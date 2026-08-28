import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { nanoid } from "nanoid";

const { testUserId, otherUserId } = vi.hoisted(() => ({
  testUserId: `usr_del_test_${Math.random().toString(36).substring(2, 10)}`,
  otherUserId: `usr_other_${Math.random().toString(36).substring(2, 10)}`,
}));

vi.mock("@/lib/auth/auth", () => ({
  auth: vi.fn().mockImplementation(async () => ({
    user: { id: testUserId, email: `${testUserId}@example.com`, name: "Delete Test User" },
    expires: "2099-01-01",
  })),
}));

import { db } from "@/lib/db";
import { users, projects, generationRuns, wallets, walletTransactions, projectOutputs } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { DELETE as deleteHandler, GET as getProjectHandler } from "@/app/api/projects/[id]/route";
import { GET as getProjectsListHandler } from "@/app/api/projects/route";
import { GET as getMeHandler } from "@/app/api/me/route";
import { POST as configureHandler } from "@/app/api/projects/[id]/configure/route";
import { POST as generateHandler } from "@/app/api/projects/[id]/generate/route";
import { storage } from "@/lib/storage";
import { getGenerationQueueName } from "@/lib/queue/queues";
import { createGenerationWorker } from "@/workers/generation-worker";

describe("Safe Reel Deletion & Media Cleanup Invariant Tests", () => {
  beforeAll(async () => {
    await db.insert(users).values([
      {
        id: testUserId,
        email: `${testUserId}@example.com`,
        displayName: "Delete Test User",
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
      balancePaise: 50000,
      reservedPaise: 0,
    });
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, testUserId));
    await db.delete(generationRuns).where(eq(generationRuns.userId, testUserId));
    await db.delete(projectOutputs).where(eq(projectOutputs.projectId, testUserId));
    await db.delete(projects).where(eq(projects.userId, testUserId));
    await db.delete(projects).where(eq(projects.userId, otherUserId));
    await db.delete(wallets).where(eq(wallets.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, otherUserId));
  });

  // =========================================================================
  // 1. NORMAL COMPLETED REEL DELETE & MEDIA CLEANUP
  // =========================================================================
  it("deletes completed Reel, removes outputs from DB, sets deletedAt, and retains financial ledger audit", async () => {
    const projectId = `proj_del_comp_${nanoid(8)}`;
    const runId = `run_del_comp_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Completed Delete Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      sourceLanguage: "en-IN",
      targetLanguages: ["hi-IN", "ta-IN"],
      status: "completed",
    });

    await db.insert(generationRuns).values({
      id: runId,
      projectId,
      userId: testUserId,
      targetLanguages: ["hi-IN", "ta-IN"],
      projectConfigSnapshot: {},
      pricingSnapshot: {},
      idempotencyKey: `idem_${runId}`,
      status: "completed",
      estimatedCostPaise: 2000,
      finalCostPaise: 2000,
      settledAt: new Date(),
    });

    await db.insert(projectOutputs).values([
      {
        id: `out_1_${nanoid(8)}`,
        projectId,
        targetLanguage: "hi-IN",
        status: "completed",
        videoR2Key: `outputs/${projectId}/hi.mp4`,
        srtR2Key: `outputs/${projectId}/hi.srt`,
      },
      {
        id: `out_2_${nanoid(8)}`,
        projectId,
        targetLanguage: "ta-IN",
        status: "completed",
        videoR2Key: `outputs/${projectId}/ta.mp4`,
        srtR2Key: `outputs/${projectId}/ta.srt`,
      },
    ]);

    // Financial ledger records
    await db.insert(walletTransactions).values({
      id: `txn_usage_${runId}`,
      userId: testUserId,
      generationRunId: runId,
      type: "usage",
      amountPaise: 2000,
      status: "completed",
    });

    // Execute DELETE
    const req = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const res = await deleteHandler(req, { params: Promise.resolve({ id: projectId }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    // Verify Project is marked deleted
    const [dbProj] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(dbProj.deletedAt).not.toBeNull();

    // Verify Project Outputs are removed
    const dbOutputs = await db.select().from(projectOutputs).where(eq(projectOutputs.projectId, projectId));
    expect(dbOutputs).toHaveLength(0);

    // Verify Financial Ledger & Run Audit remain intact (NOT deleted, NOT nulled)
    const [dbRun] = await db.select().from(generationRuns).where(eq(generationRuns.id, runId)).limit(1);
    expect(dbRun).toBeDefined();

    const [dbTxn] = await db.select().from(walletTransactions).where(eq(walletTransactions.id, `txn_usage_${runId}`)).limit(1);
    expect(dbTxn.generationRunId).toBe(runId);
  });

  // =========================================================================
  // 2. R2 DELETION FAILURE & RETRY RECOVERY
  // =========================================================================
  it("does not claim fake success on R2 failure, preserves DB metadata, and allows successful retry", async () => {
    const projectId = `proj_del_fail_retry_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Failing Storage Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/fail-video.mp4`,
      status: "ready",
    });

    await db.insert(projectOutputs).values({
      id: `out_fail_${nanoid(8)}`,
      projectId,
      targetLanguage: "hi-IN",
      status: "completed",
      videoR2Key: `outputs/${projectId}/fail-hi.mp4`,
      srtR2Key: `outputs/${projectId}/fail-hi.srt`,
    });

    // Mock storage.deleteObject to throw on fail-video.mp4
    const originalDeleteObject = storage.deleteObject.bind(storage);
    const deleteSpy = vi.spyOn(storage, "deleteObject").mockImplementation(async (key: string) => {
      if (key.includes("fail-video.mp4")) {
        throw new Error("S3 500 Internal Storage Error");
      }
      return originalDeleteObject(key);
    });

    // 1st DELETE attempt: should fail
    const req1 = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const res1 = await deleteHandler(req1, { params: Promise.resolve({ id: projectId }) });
    const json1 = await res1.json();

    expect(res1.status).toBe(500);
    expect(json1.error?.code).toBe("STORAGE_DELETE_FAILED");

    // Verify DB metadata was NOT deleted and claim was cleanly released
    const [projAfterFail] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(projAfterFail.deletedAt).toBeNull();
    expect(projAfterFail.deletionStartedAt).toBeNull();
    expect(projAfterFail.deletionClaimToken).toBeNull();

    const outputsAfterFail = await db.select().from(projectOutputs).where(eq(projectOutputs.projectId, projectId));
    expect(outputsAfterFail).toHaveLength(1);

    // Now restore storage to succeed
    deleteSpy.mockRestore();

    // 2nd DELETE attempt (Retry): should succeed
    const req2 = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const res2 = await deleteHandler(req2, { params: Promise.resolve({ id: projectId }) });
    const json2 = await res2.json();

    expect(res2.status).toBe(200);
    expect(json2.success).toBe(true);

    // Verify DB is now soft-deleted and outputs purged
    const [projAfterSuccess] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(projAfterSuccess.deletedAt).not.toBeNull();

    const outputsAfterSuccess = await db.select().from(projectOutputs).where(eq(projectOutputs.projectId, projectId));
    expect(outputsAfterSuccess).toHaveLength(0);
  });

  // =========================================================================
  // 3. BLOCK DELETE WHILE LOCALIZATION IS ACTIVELY RUNNING
  // =========================================================================
  it("blocks deletion while localization run is actively processing and returns 400", async () => {
    const projectId = `proj_del_active_${nanoid(8)}`;
    const runId = `run_del_active_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Active Running Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "processing",
    });

    await db.insert(generationRuns).values({
      id: runId,
      projectId,
      userId: testUserId,
      targetLanguages: ["hi-IN"],
      projectConfigSnapshot: {},
      pricingSnapshot: {},
      idempotencyKey: `idem_${runId}`,
      status: "processing",
      dispatchState: "dispatched",
      estimatedCostPaise: 1000,
    });

    // Attempt DELETE while running
    const req = new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" });
    const res = await deleteHandler(req, { params: Promise.resolve({ id: projectId }) });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error?.code).toBe("LOCALIZATION_IN_PROGRESS");
    expect(json.error?.message).toContain("Localization is currently in progress");

    // Verify project was NOT deleted
    const [dbProj] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    expect(dbProj.deletedAt).toBeNull();
  });

  // =========================================================================
  // 4. SOFT DELETE VISIBILITY AUDIT
  // =========================================================================
  it("ensures soft-deleted Reels are completely absent from user listings and endpoints", async () => {
    const softDeletedProjectId = `proj_soft_del_${nanoid(8)}`;

    await db.insert(projects).values({
      id: softDeletedProjectId,
      userId: testUserId,
      displayName: "Soft Deleted Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${softDeletedProjectId}/video.mp4`,
      status: "ready",
      deletedAt: new Date(),
    });

    // 1. GET /api/projects
    const listRes = await getProjectsListHandler();
    const listJson = await listRes.json();
    const idsInList = listJson.data?.map((p: any) => p.id) || [];
    expect(idsInList).not.toContain(softDeletedProjectId);

    // 2. GET /api/projects/:id -> 404
    const getRes = await getProjectHandler(
      new Request(`http://localhost:3000/api/projects/${softDeletedProjectId}`),
      { params: Promise.resolve({ id: softDeletedProjectId }) }
    );
    expect(getRes.status).toBe(404);

    // 3. POST /api/projects/:id/configure -> 404
    const confRes = await configureHandler(
      new Request(`http://localhost:3000/api/projects/${softDeletedProjectId}/configure`, {
        method: "POST",
        body: JSON.stringify({ sourceLanguage: "en-IN", targetLanguages: ["hi-IN"] }),
      }),
      { params: Promise.resolve({ id: softDeletedProjectId }) }
    );
    expect(confRes.status).toBe(404);

    // 4. POST /api/projects/:id/generate -> 404
    const genRes = await generateHandler(
      new Request(`http://localhost:3000/api/projects/${softDeletedProjectId}/generate`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: softDeletedProjectId }) }
    );
    expect(genRes.status).toBe(404);
  });

  // =========================================================================
  // 5. QUEUE NAME CONSISTENCY & ISOLATION
  // =========================================================================
  it("proves producer queue name matches worker consumer queue name dynamically", () => {
    const currentPrefix = process.env.BULLMQ_QUEUE_PREFIX;
    process.env.BULLMQ_QUEUE_PREFIX = "test-custom-ns";

    const expectedName = "test-custom-ns-generation";
    expect(getGenerationQueueName()).toBe(expectedName);

    const worker = createGenerationWorker();
    expect(worker.name).toBe(expectedName);
    worker.close().catch(() => {});

    // Restore prefix
    process.env.BULLMQ_QUEUE_PREFIX = currentPrefix;
  });

  // =========================================================================
  // 6. 20 CONCURRENT DELETE REQUESTS & DOUBLE-TAP IDEMPOTENCY
  // =========================================================================
  it("handles 20 concurrent DELETE requests for the same project with exactly 1 soft deletion", async () => {
    const projectId = `proj_del_20_race_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "20 Race Delete Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
    });

    const makeDelete = () =>
      deleteHandler(
        new Request(`http://localhost:3000/api/projects/${projectId}`, { method: "DELETE" }),
        { params: Promise.resolve({ id: projectId }) }
      );

    const responses = await Promise.all(Array.from({ length: 20 }).map(() => makeDelete()));
    const jsons = await Promise.all(responses.map((r) => r.json()));

    // All 20 returned success
    for (const j of jsons) {
      expect(j.success).toBe(true);
    }

    // Verify exactly 1 project row exists and has deletedAt set
    const dbProjs = await db.select().from(projects).where(eq(projects.id, projectId));
    expect(dbProjs).toHaveLength(1);
    expect(dbProjs[0].deletedAt).not.toBeNull();
  });

  // =========================================================================
  // 7. OWNERSHIP / IDOR PROTECTION
  // =========================================================================
  it("returns 404 when attempting to delete another user's project", async () => {
    const otherProjectId = `proj_other_${nanoid(8)}`;

    await db.insert(projects).values({
      id: otherProjectId,
      userId: otherUserId, // belongs to other user
      displayName: "Other User Reel.mp4",
      sourceR2Key: `sources/${otherUserId}/${otherProjectId}/video.mp4`,
      status: "ready",
    });

    // testUserId tries to delete other user's project
    const req = new Request(`http://localhost:3000/api/projects/${otherProjectId}`, { method: "DELETE" });
    const res = await deleteHandler(req, { params: Promise.resolve({ id: otherProjectId }) });

    expect(res.status).toBe(404);

    // Verify other user's project was not touched
    const [dbProj] = await db.select().from(projects).where(eq(projects.id, otherProjectId)).limit(1);
    expect(dbProj.deletedAt).toBeNull();
  });
});
