import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, projects, generationRuns, wallets, walletTransactions, paymentOrders } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { createOrGetPaymentOrder } from "@/lib/payments/order-service";
import { createOrResumeGeneration } from "@/lib/generation/generate-service";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";
import { settleGenerationRun } from "@/lib/wallet/settle";

describe("Crash-Point Matrix Invariant Verification", () => {
  const testUserId = `usr_crash_matrix_${nanoid(8)}`;

  beforeAll(async () => {
    await db.insert(users).values({
      id: testUserId,
      email: `${testUserId}@example.com`,
      displayName: "Crash Matrix Test User",
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
    await db.delete(walletTransactions).where(eq(walletTransactions.userId, testUserId));
    await db.delete(generationRuns).where(eq(generationRuns.userId, testUserId));
    await db.delete(paymentOrders).where(eq(paymentOrders.userId, testUserId));
    await db.delete(projects).where(eq(projects.userId, testUserId));
    await db.delete(wallets).where(eq(wallets.userId, testUserId));
    await db.delete(users).where(eq(users.id, testUserId));
  });

  // =========================================================================
  // 1. PAYMENT CRASH POINTS
  // =========================================================================
  it("Payment Crash Point: Captured before wallet credit -> verify/webhook retry credits exactly ONCE", async () => {
    const paymentIntentId = `pay_crash_cap_${nanoid(12)}`;
    const paymentOrderId = `pay_ord_cap_${nanoid(12)}`;
    const providerOrderId = `order_rzp_${paymentOrderId}`;
    const providerPaymentId = `pay_rzp_mock_${nanoid(12)}`;
    const amountPaise = 5000;

    // Seed payment order in 'authorized' status (crash occurred after capture before DB ledger)
    await db.insert(paymentOrders).values({
      id: paymentOrderId,
      userId: testUserId,
      paymentIntentId,
      provider: "razorpay",
      providerOrderId,
      providerPaymentId,
      amountPaise,
      currency: "INR",
      status: "authorized",
      idempotencyKey: `idem_pay_${paymentOrderId}`,
    });

    // Simulate 5 simultaneous webhook + user verify retries
    const finalizeAttempts = Array.from({ length: 5 }).map(() =>
      finalizeCapturedPayment({
        providerOrderId,
        providerPaymentId,
        amountPaise,
      })
    );

    const results = await Promise.all(finalizeAttempts);
    expect(results).toHaveLength(5);

    // Invariant: exactly 1 wallet balance increment of ₹50.00 (5000 paise)
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, testUserId)).limit(1);
    expect(wallet.balancePaise).toBe(55000); // 50000 + 5000

    // Invariant: exactly 1 purchase ledger transaction
    const purchaseTxns = await db
      .select()
      .from(walletTransactions)
      .where(and(eq(walletTransactions.paymentOrderId, paymentOrderId), eq(walletTransactions.type, "purchase")));
    expect(purchaseTxns).toHaveLength(1);
  });

  // =========================================================================
  // 2. GENERATION CRASH POINTS
  // =========================================================================
  it("Generation Crash Point: After reservation before queue dispatch -> retry resumes without double reservation", async () => {
    const projectId = `proj_crash_gen_${nanoid(8)}`;
    const idempotencyKey = `idem_crash_gen_${nanoid(8)}`;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Crash Reservation Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      sourceLanguage: "en-IN",
      targetLanguages: ["hi-IN"],
      voiceRightsConfirmedAt: new Date(),
      status: "ready",
      durationSeconds: 15,
      serverVerifiedDurationSeconds: 15,
    });

    // Step 1: Initial call succeeds in reserving and dispatching
    const res1 = await createOrResumeGeneration({
      userId: testUserId,
      projectId,
      idempotencyKey,
    });
    expect(res1.success).toBe(true);

    // Step 2: Retry simulating client retry after network disconnect
    const res2 = await createOrResumeGeneration({
      userId: testUserId,
      projectId,
      idempotencyKey,
    });
    expect(res2.generationRunId).toBe(res1.generationRunId);

    // Invariant: exactly 1 reservation transaction
    const resTxns = await db
      .select()
      .from(walletTransactions)
      .where(and(eq(walletTransactions.generationRunId, res1.generationRunId), eq(walletTransactions.type, "reservation")));
    expect(resTxns).toHaveLength(1);
  });

  // =========================================================================
  // 3. SETTLEMENT CRASH POINTS
  // =========================================================================
  it("Settlement Crash Point: Multiple settlement retries after provider completion execute exactly once", async () => {
    const runId = `run_settle_crash_${nanoid(8)}`;
    const projectId = `proj_settle_crash_${nanoid(8)}`;
    const costPaise = 1000;

    await db.insert(projects).values({
      id: projectId,
      userId: testUserId,
      displayName: "Settlement Crash Reel.mp4",
      sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
      status: "processing",
    });

    await db.insert(generationRuns).values({
      id: runId,
      projectId,
      userId: testUserId,
      targetLanguages: ["hi-IN"],
      projectConfigSnapshot: { sourceLanguage: "en-IN", targetLanguages: ["hi-IN"] },
      pricingSnapshot: { totalCostPaise: costPaise },
      idempotencyKey: `idem_settle_${runId}`,
      status: "processing",
      dispatchState: "dispatched",
      estimatedCostPaise: costPaise,
      reservedCostPaise: costPaise,
    });

    // Record initial reservation
    await db.insert(walletTransactions).values({
      id: `txn_res_${runId}`,
      userId: testUserId,
      generationRunId: runId,
      type: "reservation",
      amountPaise: costPaise,
      status: "completed",
    });

    await db
      .update(wallets)
      .set({ reservedPaise: sql`${wallets.reservedPaise} + ${costPaise}` })
      .where(eq(wallets.userId, testUserId));

    // Fire 5 concurrent settlement calls
    const settleCalls = Array.from({ length: 5 }).map(() =>
      settleGenerationRun({
        generationRunId: runId,
        projectId,
        userId: testUserId,
        reservedCostPaise: costPaise,
        finalCostPaise: costPaise,
      })
    );

    await Promise.all(settleCalls);

    // Invariant: exactly 1 usage ledger transaction
    const usageTxns = await db
      .select()
      .from(walletTransactions)
      .where(and(eq(walletTransactions.generationRunId, runId), eq(walletTransactions.type, "usage")));
    expect(usageTxns).toHaveLength(1);

    // Invariant: run marked settled
    const [finalRun] = await db.select().from(generationRuns).where(eq(generationRuns.id, runId)).limit(1);
    expect(finalRun.settledAt).not.toBeNull();
  });
});
