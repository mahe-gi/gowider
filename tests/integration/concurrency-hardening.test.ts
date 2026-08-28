import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, projects, generationRuns, wallets, walletTransactions, paymentOrders } from "@/db/schema";
import { eq, and, or, isNull, lt, inArray } from "drizzle-orm";
import { createOrGetPaymentOrder, PaymentIntentConflictError } from "@/lib/payments/order-service";
import { createOrResumeGeneration } from "@/lib/generation/generate-service";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";
import { settleGenerationRun } from "@/lib/wallet/settle";
import type { PaymentProvider, CreateOrderInput, PaymentOrderResult, VerifyPaymentInput, VerifiedPayment, ProviderPaymentDetails } from "@/lib/payments/provider";

describe("Production-Grade Concurrency, Crash-Window & Idempotency Hardening", () => {
  const testUserId = `usr_test_conc_${nanoid(8)}`;

  beforeAll(async () => {
    // Seed test user and initial wallet
    await db.insert(users).values({
      id: testUserId,
      email: `${testUserId}@example.com`,
      displayName: "Concurrency Test User",
      authProvider: "google",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(wallets).values({
      id: `wal_${nanoid(16)}`,
      userId: testUserId,
      balancePaise: 50000, // ₹500.00
      reservedPaise: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterAll(async () => {
    // Clean up test records
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, testUserId));
    await db.delete(generationRuns).where(eq(generationRuns.userId, testUserId));
    await db.delete(paymentOrders).where(eq(paymentOrders.userId, testUserId));
    await db.delete(projects).where(eq(projects.userId, testUserId));
    await db.delete(wallets).where(eq(wallets.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  // =========================================================================
  // 1. PRESIGN CONCURRENCY & IMMUTABLE METADATA
  // =========================================================================
  it("converges 50 concurrent presign requests for same uploadIntentId into 1 project", async () => {
    const uploadIntentId = `intent_50_presign_${nanoid(16)}`;

    const presignCalls = Array.from({ length: 50 }).map(async () => {
      const projId = `proj_${nanoid(16)}`;
      const sourceR2Key = `sources/${testUserId}/${projId}/video.mp4`;

      try {
        const [inserted] = await db
          .insert(projects)
          .values({
            id: projId,
            userId: testUserId,
            uploadIntentId,
            displayName: "Concurrency Test Video.mp4",
            sourceR2Key,
            sourceFileName: "Concurrency Test Video.mp4",
            sourceMimeType: "video/mp4",
            sourceFileSizeBytes: 14000000,
            status: "upload_pending",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing({ target: [projects.userId, projects.uploadIntentId] })
          .returning();

        if (inserted) return inserted.id;

        const [existing] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.userId, testUserId), eq(projects.uploadIntentId, uploadIntentId)))
          .limit(1);

        return existing?.id;
      } catch {
        const [existing] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.userId, testUserId), eq(projects.uploadIntentId, uploadIntentId)))
          .limit(1);
        return existing?.id;
      }
    });

    const projectIds = await Promise.all(presignCalls);
    const uniqueIds = Array.from(new Set(projectIds));

    expect(uniqueIds).toHaveLength(1);

    const dbProjects = await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, testUserId), eq(projects.uploadIntentId, uploadIntentId)));

    expect(dbProjects).toHaveLength(1);
  });

  // =========================================================================
  // 2. PAYMENT INTENT IMMUTABILITY & CONFLICTS
  // =========================================================================
  it("enforces payment intent immutability (same intent with conflicting amount or runId throws conflict)", async () => {
    const paymentIntentId = `pay_intent_immut_${nanoid(12)}`;
    const runId1 = `run_link_1_${nanoid(8)}`;
    const runId2 = `run_link_2_${nanoid(8)}`;

    const projectId = `proj_pay_test_${nanoid(8)}`;
    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Payment Test.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "ready",
    });

    await db.insert(generationRuns).values([
      {
        id: runId1,
        projectId,
        userId: testUserId,
        targetLanguages: ["hi-IN"],
        projectConfigSnapshot: {},
        pricingSnapshot: {},
        idempotencyKey: `idem_${runId1}`,
        estimatedCostPaise: 2934,
      },
      {
        id: runId2,
        projectId,
        userId: testUserId,
        targetLanguages: ["te-IN"],
        projectConfigSnapshot: {},
        pricingSnapshot: {},
        idempotencyKey: `idem_${runId2}`,
        estimatedCostPaise: 2934,
      },
    ]);

    // Mock Provider
    const mockProvider: PaymentProvider = {
      async createOrder(input: CreateOrderInput): Promise<PaymentOrderResult> {
        return { providerOrderId: `rzp_${input.receipt}`, amountPaise: input.amountPaise, currency: "INR", keyId: "test_key" };
      },
      async verifyPayment(): Promise<VerifiedPayment> {
        return { success: true, providerPaymentId: "p", amountPaise: 0, status: "captured", currency: "INR", isCaptured: true };
      },
      async getPayment(): Promise<ProviderPaymentDetails> {
        return { status: "captured", amountPaise: 0, currency: "INR" };
      },
    };

    // 1. Initial Order Creation
    const order1 = await createOrGetPaymentOrder({
      userId: testUserId,
      paymentIntentId,
      amountPaise: 5000,
      generationRunId: runId1,
      providerOverride: mockProvider,
    });

    expect(order1.providerOrderId).toBe(`rzp_${paymentIntentId}`);

    // 2. Same intent + same parameters -> Idempotent Success
    const order1Retry = await createOrGetPaymentOrder({
      userId: testUserId,
      paymentIntentId,
      amountPaise: 5000,
      generationRunId: runId1,
      providerOverride: mockProvider,
    });
    expect(order1Retry.paymentOrderId).toBe(order1.paymentOrderId);

    // 3. Same intent + different amount -> Throws PaymentIntentConflictError (409)
    await expect(
      createOrGetPaymentOrder({
        userId: testUserId,
        paymentIntentId,
        amountPaise: 10000,
        generationRunId: runId1,
        providerOverride: mockProvider,
      })
    ).rejects.toThrow(PaymentIntentConflictError);

    // 4. Same intent + different generationRunId -> Throws PaymentIntentConflictError (409)
    await expect(
      createOrGetPaymentOrder({
        userId: testUserId,
        paymentIntentId,
        amountPaise: 5000,
        generationRunId: runId2,
        providerOverride: mockProvider,
      })
    ).rejects.toThrow(PaymentIntentConflictError);
  });

  // =========================================================================
  // 3. 20 CONCURRENT PAYMENT ORDER CALLS VIA PRODUCTION SERVICE
  // =========================================================================
  it("fires 20 concurrent requests for SAME paymentIntentId via createOrGetPaymentOrder with exactly 1 provider call", async () => {
    let providerCreateOrderCalls = 0;
    const paymentIntentId = `pay_intent_20_conc_${nanoid(12)}`;

    const mockProvider: PaymentProvider = {
      async createOrder(input: CreateOrderInput): Promise<PaymentOrderResult> {
        providerCreateOrderCalls++;
        // Simulate small provider network latency
        await new Promise((r) => setTimeout(r, 50));
        return {
          providerOrderId: `rzp_order_${input.receipt}`,
          amountPaise: input.amountPaise,
          currency: "INR",
          keyId: "test_key",
        };
      },
      async verifyPayment(): Promise<VerifiedPayment> {
        return { success: true, providerPaymentId: "p", amountPaise: 0, status: "captured", currency: "INR", isCaptured: true };
      },
      async getPayment(): Promise<ProviderPaymentDetails> {
        return { status: "captured", amountPaise: 0, currency: "INR" };
      },
    };

    // Fire 20 concurrent requests directly against production createOrGetPaymentOrder service
    const calls = Array.from({ length: 20 }).map(() =>
      createOrGetPaymentOrder({
        userId: testUserId,
        paymentIntentId,
        amountPaise: 5000,
        providerOverride: mockProvider,
      })
    );

    const results = await Promise.all(calls);
    const orderIds = results.map((r) => r.paymentOrderId);
    const providerOrderIds = results.map((r) => r.providerOrderId);

    // Assert: local database rows = 1
    const dbOrders = await db
      .select()
      .from(paymentOrders)
      .where(and(eq(paymentOrders.userId, testUserId), eq(paymentOrders.paymentIntentId, paymentIntentId)));

    expect(dbOrders).toHaveLength(1);
    expect(Array.from(new Set(orderIds))).toHaveLength(1);
    expect(Array.from(new Set(providerOrderIds))).toHaveLength(1);

    // Assert: Provider createOrder call count = 1
    expect(providerCreateOrderCalls).toBe(1);

    // Genuinely new paymentIntentId -> provider call count increments to 2
    const newIntentId = `pay_intent_new_${nanoid(12)}`;
    await createOrGetPaymentOrder({
      userId: testUserId,
      paymentIntentId: newIntentId,
      amountPaise: 5000,
      providerOverride: mockProvider,
    });

    expect(providerCreateOrderCalls).toBe(2);
  });

  // =========================================================================
  // 4. RAZORPAY CRASH WINDOW & RECEIPT RECONCILIATION
  // =========================================================================
  it("reconciles crash between Razorpay order creation and DB persistence via receipt lookup without duplicate orders", async () => {
    let providerCreateOrderCalls = 0;
    let findOrderByReceiptCalls = 0;
    const paymentIntentId = `pay_crash_recon_${nanoid(12)}`;

    // Store remote orders on mock provider
    const remoteOrders = new Map<string, { id: string; status: string; amountPaise: number }>();

    const mockReconcilingProvider: PaymentProvider = {
      async createOrder(input: CreateOrderInput): Promise<PaymentOrderResult> {
        providerCreateOrderCalls++;
        const orderId = `rzp_remote_${input.receipt}`;
        remoteOrders.set(input.receipt, { id: orderId, status: "created", amountPaise: input.amountPaise });
        return {
          providerOrderId: orderId,
          amountPaise: input.amountPaise,
          currency: "INR",
          keyId: "test_key",
        };
      },
      async findOrderByReceipt(receipt: string) {
        findOrderByReceiptCalls++;
        return remoteOrders.get(receipt) || null;
      },
      async verifyPayment(): Promise<VerifiedPayment> {
        return { success: true, providerPaymentId: "p", amountPaise: 0, status: "captured", currency: "INR", isCaptured: true };
      },
      async getPayment(): Promise<ProviderPaymentDetails> {
        return { status: "captured", amountPaise: 0, currency: "INR" };
      },
    };

    // Step 1: Simulate Process 1 creating local DB row in status = 'creating'
    const paymentId = `pay_crash_${nanoid(16)}`;
    await db.insert(paymentOrders).values({
      id: paymentId,
      userId: testUserId,
      paymentIntentId,
      amountPaise: 5000,
      currency: "INR",
      status: "creating",
      idempotencyKey: `ord_idem_${paymentId}`,
      providerCreationLeaseUntil: new Date(Date.now() - 60 * 1000), // Stale lease (process died)
      providerCreationToken: "crashed_token_123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Step 2: Simulate Razorpay remote order was created before crash
    remoteOrders.set(paymentIntentId, { id: `rzp_remote_${paymentIntentId}`, status: "created", amountPaise: 5000 });

    // Step 3: Process 2 retries createOrGetPaymentOrder
    const recoveredOrder = await createOrGetPaymentOrder({
      userId: testUserId,
      paymentIntentId,
      amountPaise: 5000,
      providerOverride: mockReconcilingProvider,
    });

    // Assert: findOrderByReceipt was used to reconcile
    expect(findOrderByReceiptCalls).toBeGreaterThanOrEqual(1);
    expect(recoveredOrder.providerOrderId).toBe(`rzp_remote_${paymentIntentId}`);

    // Assert: createOrder was NOT called again (calls = 0)
    expect(providerCreateOrderCalls).toBe(0);

    // Verify DB updated
    const [dbOrder] = await db.select().from(paymentOrders).where(eq(paymentOrders.id, paymentId)).limit(1);
    expect(dbOrder.providerOrderId).toBe(`rzp_remote_${paymentIntentId}`);
    expect(dbOrder.status).toBe("created");
    expect(dbOrder.providerCreationLeaseUntil).toBeNull();
  });

  // =========================================================================
  // 5. GENERATE CONCURRENCY VIA PRODUCTION SERVICE
  // =========================================================================
  it("fires 20 concurrent requests for SAME generation intent via createOrResumeGeneration with exactly 1 run and 1 reservation", async () => {
    const projectId = `proj_gen_service_${nanoid(8)}`;
    const idempotencyKey = `idem_gen_service_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Generate Production Service Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      sourceLanguage: "en-IN",
      targetLanguages: ["hi-IN"],
      voiceRightsConfirmedAt: new Date(),
      status: "ready",
      durationSeconds: 15,
      serverVerifiedDurationSeconds: 15,
    });

    // Fire 20 concurrent requests directly against production createOrResumeGeneration service
    const calls = Array.from({ length: 20 }).map(() =>
      createOrResumeGeneration({
        userId: testUserId,
        projectId,
        idempotencyKey,
      })
    );

    const results = await Promise.all(calls);
    const runIds = results.map((r) => r.generationRunId);

    // Assert: exactly 1 generation run created
    expect(Array.from(new Set(runIds))).toHaveLength(1);

    const dbRuns = await db.select().from(generationRuns).where(eq(generationRuns.projectId, projectId));
    expect(dbRuns).toHaveLength(1);

    // Assert: exactly 1 reservation transaction in ledger
    const txns = await db
      .select()
      .from(walletTransactions)
      .where(and(eq(walletTransactions.generationRunId, dbRuns[0].id), eq(walletTransactions.type, "reservation")));
    expect(txns).toHaveLength(1);
    expect(txns[0].amountPaise).toBe(1000);
  });

  // =========================================================================
  // 6. SARVAM CRASH WINDOW TEST & ACCURATE AT-LEAST-ONCE BOUNDARY
  // =========================================================================
  it("proves two-worker provider creation race calls createDubbingJob 1 time and documents crash recovery boundary", async () => {
    let createDubbingJobCalls = 0;
    const runId = `run_sarvam_race_${nanoid(8)}`;
    const projectId = `proj_sarvam_race_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Sarvam Race Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "processing",
    });

    await db.insert(generationRuns).values({
      id: runId,
      projectId,
      userId: testUserId,
      targetLanguages: ["hi-IN"],
      projectConfigSnapshot: { sourceLanguage: "en-IN", targetLanguages: ["hi-IN"] },
      pricingSnapshot: { totalCostPaise: 2934 },
      idempotencyKey: `idem_sarvam_${runId}`,
      status: "queued",
      dispatchState: "dispatched",
      estimatedCostPaise: 2934,
      reservedCostPaise: 2934,
    });

    async function mockCreateDubbingJob(targetRunId: string) {
      createDubbingJobCalls++;
      await new Promise((r) => setTimeout(r, 40));
      return { jobId: `sarvam_job_${targetRunId}`, uploadUrl: "https://sarvam.ai/upload" };
    }

    // Production Lease Claim Logic from processGenerationStart
    async function workerStartClaim(targetRunId: string) {
      const staleLeaseCutoff = new Date(Date.now() - 2 * 60 * 1000);

      const [claimedRun] = await db
        .update(generationRuns)
        .set({
          status: "uploading_to_sarvam",
          currentStep: "uploading",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(generationRuns.id, targetRunId),
            or(
              inArray(generationRuns.status, ["queued", "awaiting_payment"]),
              and(
                eq(generationRuns.status, "uploading_to_sarvam"),
                isNull(generationRuns.sarvamJobId),
                lt(generationRuns.updatedAt, staleLeaseCutoff)
              )
            )
          )
        )
        .returning();

      if (!claimedRun) {
        const [current] = await db.select().from(generationRuns).where(eq(generationRuns.id, targetRunId)).limit(1);
        if (current?.sarvamJobId) {
          return { status: "processing", sarvamJobId: current.sarvamJobId };
        }
        return { status: "processing", action: "skipped_duplicate" };
      }

      const jobRes = await mockCreateDubbingJob(targetRunId);

      await db
        .update(generationRuns)
        .set({
          sarvamJobId: jobRes.jobId,
          status: "processing",
          currentStep: "dubbing",
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, targetRunId));

      return { status: "processing", sarvamJobId: jobRes.jobId };
    }

    // Two simultaneous workers run against the same run
    const results = await Promise.all([workerStartClaim(runId), workerStartClaim(runId)]);

    expect(createDubbingJobCalls).toBe(1);
    const [finalRun] = await db.select().from(generationRuns).where(eq(generationRuns.id, runId)).limit(1);
    expect(finalRun.sarvamJobId).toBe(`sarvam_job_${runId}`);

    // Crash Window Boundary Test:
    // When a worker crashes after Sarvam created a job but before DB persistence,
    // on stale lease expiry (> 2 mins), a recovery worker claims the run and safely restarts creation.
    const crashRunId = `run_sarvam_crash_${nanoid(8)}`;
    await db.insert(generationRuns).values({
      id: crashRunId,
      projectId,
      userId: testUserId,
      targetLanguages: ["hi-IN"],
      projectConfigSnapshot: { sourceLanguage: "en-IN", targetLanguages: ["hi-IN"] },
      pricingSnapshot: { totalCostPaise: 2934 },
      idempotencyKey: `idem_${crashRunId}`,
      status: "uploading_to_sarvam",
      sarvamJobId: null, // process crashed here
      dispatchState: "dispatched",
      estimatedCostPaise: 2934,
      reservedCostPaise: 2934,
      updatedAt: new Date(Date.now() - 3 * 60 * 1000), // 3 minutes ago
    });

    const recoveryRes = await workerStartClaim(crashRunId);
    expect(recoveryRes.sarvamJobId).toBe(`sarvam_job_${crashRunId}`);
    expect(createDubbingJobCalls).toBe(2);
  });
});
