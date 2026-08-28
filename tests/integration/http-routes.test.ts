import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

const { testUserId } = vi.hoisted(() => ({
  testUserId: `usr_http_test_${Math.random().toString(36).substring(2, 10)}`,
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn().mockImplementation(async () => ({
    user: { id: testUserId, email: `${testUserId}@example.com`, name: "HTTP Test User" },
    expires: "2099-01-01",
  })),
}));

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, projects, generationRuns, wallets, walletTransactions, paymentOrders } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { POST as presignHandler } from "@/app/api/uploads/presign/route";
import { POST as paymentOrderHandler } from "@/app/api/payments/order/route";
import { POST as generateHandler } from "@/app/api/projects/[id]/generate/route";

describe("Real HTTP Route Concurrency Invariant Tests", () => {
  beforeAll(async () => {
    await db.insert(users).values({
      id: testUserId,
      email: `${testUserId}@example.com`,
      displayName: "HTTP Route Test User",
      authProvider: "google",
    });

    await db.insert(wallets).values({
      id: `wal_${nanoid(16)}`,
      userId: testUserId,
      balancePaise: 50000,
      reservedPaise: 0,
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, testUserId));
    await db.delete(generationRuns).where(eq(generationRuns.userId, testUserId));
    await db.delete(paymentOrders).where(eq(paymentOrders.userId, testUserId));
    await db.delete(projects).where(eq(projects.userId, testUserId));
    await db.delete(wallets).where(eq(wallets.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  // =========================================================================
  // 1. PRESIGN ROUTE: 50 Concurrent HTTP Requests
  // =========================================================================
  it("HTTP Presign Route: 50 concurrent calls with same uploadIntentId converge onto 1 project", async () => {
    const uploadIntentId = `http_presign_intent_${nanoid(12)}`;

    const makeRequest = () =>
      presignHandler(
        new Request("http://localhost:3000/api/uploads/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: "sample_video.mp4",
            contentType: "video/mp4",
            fileSizeBytes: 5000000,
            uploadIntentId,
          }),
        })
      );

    const responses = await Promise.all(Array.from({ length: 50 }).map(() => makeRequest()));
    const jsons = await Promise.all(responses.map((r) => r.json()));

    const projectIds = jsons.map((j) => j.data?.projectId).filter(Boolean);
    const keys = jsons.map((j) => j.data?.key).filter(Boolean);

    // Assert: All 50 HTTP calls returned the SAME project ID and R2 key
    expect(Array.from(new Set(projectIds))).toHaveLength(1);
    expect(Array.from(new Set(keys))).toHaveLength(1);

    // Assert: Exactly 1 row in PostgreSQL
    const dbProjs = await db.select().from(projects).where(eq(projects.uploadIntentId, uploadIntentId));
    expect(dbProjs).toHaveLength(1);
  });

  // =========================================================================
  // 2. PAYMENT ORDER ROUTE: 20 Concurrent HTTP Requests
  // =========================================================================
  it("HTTP Payment Order Route: 20 concurrent calls with same paymentIntentId converge onto 1 payment order", async () => {
    const paymentIntentId = `http_pay_intent_${nanoid(12)}`;

    const makeRequest = () =>
      paymentOrderHandler(
        new Request("http://localhost:3000/api/payments/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountPaise: 5000,
            paymentIntentId,
          }),
        })
      );

    const responses = await Promise.all(Array.from({ length: 20 }).map(() => makeRequest()));
    const jsons = await Promise.all(responses.map((r) => r.json()));

    const orderIds = jsons.map((j) => j.data?.paymentOrderId).filter(Boolean);
    const providerOrderIds = jsons.map((j) => j.data?.providerOrderId).filter(Boolean);

    // Assert: All 20 HTTP calls returned the SAME paymentOrderId and providerOrderId
    expect(Array.from(new Set(orderIds))).toHaveLength(1);
    expect(Array.from(new Set(providerOrderIds))).toHaveLength(1);

    // Assert: Exactly 1 row in PostgreSQL
    const dbOrders = await db.select().from(paymentOrders).where(eq(paymentOrders.paymentIntentId, paymentIntentId));
    expect(dbOrders).toHaveLength(1);
  });

  // =========================================================================
  // 3. GENERATE ROUTE: 20 Concurrent HTTP Requests
  // =========================================================================
  it("HTTP Generate Route: 20 concurrent calls with same idempotencyKey converge onto 1 run and 1 reservation", async () => {
    const projectId = `proj_http_gen_${nanoid(8)}`;
    const idempotencyKey = `http_gen_idem_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "HTTP Generate Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      sourceLanguage: "en-IN",
      targetLanguages: ["hi-IN"],
      voiceRightsConfirmedAt: new Date(),
      status: "ready",
      durationSeconds: 15,
      serverVerifiedDurationSeconds: 15,
    });

    const makeRequest = () =>
      generateHandler(
        new Request(`http://localhost:3000/api/projects/${projectId}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idempotencyKey }),
        }),
        { params: Promise.resolve({ id: projectId }) }
      );

    const responses = await Promise.all(Array.from({ length: 20 }).map(() => makeRequest()));
    const jsons = await Promise.all(responses.map((r) => r.json()));

    const runIds = jsons.map((j) => j.data?.generationRunId).filter(Boolean);

    // Assert: All 20 HTTP calls returned the SAME run ID
    expect(Array.from(new Set(runIds))).toHaveLength(1);

    // Assert: Exactly 1 generation run in PostgreSQL
    const dbRuns = await db.select().from(generationRuns).where(eq(generationRuns.projectId, projectId));
    expect(dbRuns).toHaveLength(1);

    // Assert: Exactly 1 reservation transaction in ledger
    const resTxns = await db
      .select()
      .from(walletTransactions)
      .where(and(eq(walletTransactions.generationRunId, dbRuns[0].id), eq(walletTransactions.type, "reservation")));
    expect(resTxns).toHaveLength(1);
  });
});
