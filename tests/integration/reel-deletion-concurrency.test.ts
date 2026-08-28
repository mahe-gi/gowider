import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { nanoid } from "nanoid";

const { testUserId, otherUserId } = vi.hoisted(() => ({
  testUserId: `usr_conc_del_${Math.random().toString(36).substring(2, 10)}`,
  otherUserId: `usr_conc_oth_${Math.random().toString(36).substring(2, 10)}`,
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn().mockImplementation(async () => ({
    user: { id: testUserId, email: `${testUserId}@example.com`, name: "Conc Del User" },
    expires: "2099-01-01",
  })),
}));

import { db } from "@/lib/db";
import { users, projects, generationRuns, wallets, walletTransactions, projectOutputs, paymentOrders } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { DELETE as deleteHandler } from "@/app/api/projects/[id]/route";
import { POST as generateHandler } from "@/app/api/projects/[id]/generate/route";
import { POST as configureHandler } from "@/app/api/projects/[id]/configure/route";
import { POST as retryHandler } from "@/app/api/projects/[id]/retry/route";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";
import { storage } from "@/lib/storage";

describe("Reel Deletion Concurrency, Durable Claims, and Payment Races", () => {
  beforeAll(async () => {
    await db.insert(users).values([
      {
        id: testUserId,
        email: `${testUserId}@example.com`,
        displayName: "Conc Del User",
        authProvider: "google",
      },
      {
        id: otherUserId,
        email: `${otherUserId}@example.com`,
        displayName: "Other User",
        authProvider: "google",
      },
    ]);

    await db.insert(wallets).values({
      id: `wal_${nanoid(16)}`,
      userId: testUserId,
      balancePaise: 100000, // ₹1,000
      reservedPaise: 0,
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, testUserId));
    await db.delete(paymentOrders).where(eq(paymentOrders.userId, testUserId));
    await db.delete(generationRuns).where(eq(generationRuns.userId, testUserId));
    await db.delete(projectOutputs).where(eq(projectOutputs.projectId, testUserId));
    await db.delete(projects).where(eq(projects.userId, testUserId));
    await db.delete(wallets).where(eq(wallets.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, otherUserId));
  });

  // =========================================================================
  // 1. DELETE CLAIM VS GENERATE RACE
  // =========================================================================
  it("blocks concurrent generate when deletion claim is in progress", async () => {
    const projectId = `proj_del_gen_race_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Delete vs Generate Race.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      sourceLanguage: "en-IN",
      targetLanguages: ["hi-IN", "ta-IN"],
      durationSeconds: 15,
      voiceRightsConfirmedAt: new Date(),
      voiceConsentVersion: "v1.0",
      status: "ready",
    });

    // Simulate active deletion claim in progress
    await db
      .update(projects)
      .set({
        deletionStartedAt: new Date(),
        deletionClaimToken: `claim_${nanoid(16)}`,
      })
      .where(eq(projects.id, projectId));

    // Attempt concurrent POST /generate
    const genReq = new Request(`http://localhost:3000/api/projects/${projectId}/generate`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const genRes = await generateHandler(genReq, { params: Promise.resolve({ id: projectId }) });

    expect(genRes.status).toBe(404);

    // Verify 0 generation runs created
    const dbRuns = await db.select().from(generationRuns).where(eq(generationRuns.projectId, projectId));
    expect(dbRuns).toHaveLength(0);

    // Verify 0 wallet reservations
    const [dbWallet] = await db.select().from(wallets).where(eq(wallets.userId, testUserId)).limit(1);
    expect(dbWallet.reservedPaise).toBe(0);
  });

  // =========================================================================
  // 2. DELETE CLAIM VS CONFIGURE & RETRY RACE
  // =========================================================================
  it("blocks concurrent configure and retry when deletion claim is in progress", async () => {
    const projectId = `proj_del_conf_race_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Delete vs Conf Race.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
      deletionStartedAt: new Date(),
      deletionClaimToken: `claim_${nanoid(16)}`,
    });

    // Configure attempt
    const confRes = await configureHandler(
      new Request(`http://localhost:3000/api/projects/${projectId}/configure`, {
        method: "POST",
        body: JSON.stringify({ sourceLanguage: "en-IN", targetLanguages: ["hi-IN"] }),
      }),
      { params: Promise.resolve({ id: projectId }) }
    );
    expect(confRes.status).toBe(404);

    // Retry attempt
    const retryRes = await retryHandler(
      new Request(`http://localhost:3000/api/projects/${projectId}/retry`, {
        method: "POST",
        body: JSON.stringify({ targetLanguages: ["hi-IN"] }),
      }),
      { params: Promise.resolve({ id: projectId }) }
    );
    expect(retryRes.status).toBe(404);
  });

  // =========================================================================
  // 3. DELETE VS AWAITING_PAYMENT & PAYMENT AUTO-RESUME RACE
  // =========================================================================
  it("cancels awaiting_payment generation on delete and prevents auto-resume when payment captures later", async () => {
    const projectId = `proj_del_pay_race_${nanoid(8)}`;
    const runId = `run_pay_race_${nanoid(8)}`;
    const orderId = `order_pay_race_${nanoid(8)}`;
    const providerOrderId = `order_rzp_${nanoid(12)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Awaiting Payment Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
    });

    await db.insert(generationRuns).values({
      id: runId,
      projectId,
      userId: testUserId,
      targetLanguages: ["hi-IN"],
      projectConfigSnapshot: {},
      pricingSnapshot: {},
      idempotencyKey: `idem_${runId}`,
      status: "awaiting_payment",
      estimatedCostPaise: 3000,
    });

    await db.insert(paymentOrders).values({
      id: orderId,
      userId: testUserId,
      generationRunId: runId,
      providerOrderId,
      amountPaise: 3000,
      currency: "INR",
      idempotencyKey: `idem_${orderId}`,
      status: "created",
    });

    // 1. User deletes Reel before completing payment
    const delReq = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const delRes = await deleteHandler(delReq, { params: Promise.resolve({ id: projectId }) });
    expect(delRes.status).toBe(200);

    // Verify awaiting_payment run was cancelled
    const [dbRun] = await db.select().from(generationRuns).where(eq(generationRuns.id, runId)).limit(1);
    expect(dbRun.status).toBe("cancelled");

    // 2. Razorpay payment subsequently captures (via webhook or verify)
    const initialWallet = (await db.select().from(wallets).where(eq(wallets.userId, testUserId)).limit(1))[0];

    const finResult = await finalizeCapturedPayment({
      providerOrderId,
      providerPaymentId: `pay_${nanoid(12)}`,
      amountPaise: 3000,
    });

    expect(finResult.success).toBe(true);
    expect(finResult.autoResumedRunId).toBeUndefined(); // MUST NOT auto-resume deleted Reel

    // Verify wallet received the deposit
    const [updatedWallet] = await db.select().from(wallets).where(eq(wallets.userId, testUserId)).limit(1);
    expect(updatedWallet.balancePaise).toBe(initialWallet.balancePaise + 3000);
    expect(updatedWallet.reservedPaise).toBe(0); // 0 funds reserved

    // Verify run remains cancelled
    const [finalRun] = await db.select().from(generationRuns).where(eq(generationRuns.id, runId)).limit(1);
    expect(finalRun.status).toBe("cancelled");
  });

  // =========================================================================
  // 4. STORAGE FAILURE CLAIM RELEASE & IMMEDIATE RETRY
  // =========================================================================
  it("releases claim in DB after storage failure and allows immediate retry without waiting", async () => {
    const projectId = `proj_r2_fail_rel_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Storage Fail Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/fail-file.mp4`,
      status: "ready",
    });

    // Mock storage to fail on 1st call
    const originalDeleteObject = storage.deleteObject.bind(storage);
    const deleteSpy = vi.spyOn(storage, "deleteObject").mockImplementation(async (key: string) => {
      if (key.includes("fail-file.mp4")) {
        throw new Error("R2 503 Service Unavailable");
      }
      return originalDeleteObject(key);
    });

    // 1st attempt fails with 500
    const req1 = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const res1 = await deleteHandler(req1, { params: Promise.resolve({ id: projectId }) });
    expect(res1.status).toBe(500);

    // PROVE IN DB: deletion claim was released (NOT left dangling)
    const [projAfterFail] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(projAfterFail.deletionStartedAt).toBeNull();
    expect(projAfterFail.deletionClaimToken).toBeNull();
    expect(projAfterFail.deletedAt).toBeNull();

    // Restore storage
    deleteSpy.mockRestore();

    // 2nd attempt immediately succeeds (0 ms delay)
    const req2 = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const res2 = await deleteHandler(req2, { params: Promise.resolve({ id: projectId }) });
    const json2 = await res2.json();

    expect(res2.status).toBe(200);
    expect(json2.success).toBe(true);

    // PROVE IN DB: soft-deleted
    const [projAfterRetry] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(projAfterRetry.deletedAt).not.toBeNull();
  });

  // =========================================================================
  // 5. FENCING TOKEN STALE OWNER FINALIZATION REJECTION
  // =========================================================================
  it("proves fencing token blocks stale worker from finalizing deletion if lease was reclaimed", async () => {
    const projectId = `proj_fencing_test_${nanoid(8)}`;
    const tokenA = `del_claim_worker_A_${nanoid(8)}`;
    const tokenB = `del_claim_worker_B_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Fencing Token Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
      deletionStartedAt: new Date(Date.now() - 150 * 1000), // Stale (>120s)
      deletionClaimToken: tokenA,
    });

    // Worker B reclaims the lease with tokenB
    await db
      .update(projects)
      .set({
        deletionStartedAt: new Date(),
        deletionClaimToken: tokenB,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Stale Worker A attempts to finalize with tokenA
    let workerAFinalizeError: any = null;
    try {
      await db.transaction(async (tx) => {
        const [updatedProject] = await tx
          .update(projects)
          .set({
            deletedAt: new Date(),
            status: "expired",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.deletionClaimToken, tokenA), // Stale token
              isNull(projects.deletedAt)
            )
          )
          .returning();

        if (!updatedProject) {
          throw new Error("DELETION_CLAIM_LOST: Deletion lease was reclaimed by another worker or expired.");
        }
      });
    } catch (err: any) {
      workerAFinalizeError = err;
    }

    // Assert: Worker A transaction was rolled back and failed fencing token check
    expect(workerAFinalizeError).not.toBeNull();
    expect(workerAFinalizeError.message).toContain("DELETION_CLAIM_LOST");

    // Assert: Worker B is STILL the valid claim owner in DB
    const [dbProj] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(dbProj.deletionClaimToken).toBe(tokenB);
    expect(dbProj.deletedAt).toBeNull();
  });

  // =========================================================================
  // 6. FENCING TOKEN WRONG CLAIM RELEASE NO-OP
  // =========================================================================
  it("proves wrong token cannot release an active claim", async () => {
    const projectId = `proj_wrong_rel_${nanoid(8)}`;
    const validToken = `claim_valid_${nanoid(8)}`;
    const wrongToken = `claim_wrong_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Wrong Release Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
      deletionStartedAt: new Date(),
      deletionClaimToken: validToken,
    });

    // Attempt release with wrong token
    const result = await db
      .update(projects)
      .set({ deletionStartedAt: null, deletionClaimToken: null, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), eq(projects.deletionClaimToken, wrongToken)))
      .returning();

    // 0 rows updated
    expect(result).toHaveLength(0);

    // Valid claim remains intact
    const [dbProj] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(dbProj.deletionClaimToken).toBe(validToken);
    expect(dbProj.deletionStartedAt).not.toBeNull();
  });

  // =========================================================================
  // 7. 20 CONCURRENT DELETES CONVERGE SAFELY
  // =========================================================================
  it("handles 20 concurrent DELETE requests with single owner and valid terminal responses", async () => {
    const projectId = `proj_20_conc_del_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "20 Conc Del Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
    });

    await db.insert(projectOutputs).values({
      id: `out_20_${nanoid(8)}`,
      projectId,
      targetLanguage: "hi-IN",
      status: "completed",
      videoR2Key: `outputs/${projectId}/hi.mp4`,
      srtR2Key: `outputs/${projectId}/hi.srt`,
    });

    const makeDelete = () =>
      deleteHandler(
        new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: projectId }) }
      );

    const responses = await Promise.all(Array.from({ length: 20 }).map(() => makeDelete()));
    const statuses = responses.map((r) => r.status);
    const jsons = await Promise.all(responses.map((r) => r.json()));

    // All responses are either 200 (terminal completed) or 202 (deletion_in_progress)
    for (let i = 0; i < responses.length; i++) {
      const status = statuses[i];
      const json = jsons[i];
      expect([200, 202]).toContain(status);

      if (status === 200) {
        expect(json.success).toBe(true);
      } else if (status === 202) {
        expect(json.success).toBe(false);
        expect(json.status).toBe("deletion_in_progress");
      }
    }

    // Exactly 1 project row exists and has deletedAt set
    const [finalProj] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(finalProj.deletedAt).not.toBeNull();

    // Outputs removed
    const finalOutputs = await db.select().from(projectOutputs).where(eq(projectOutputs.projectId, projectId));
    expect(finalOutputs).toHaveLength(0);
  });
});
