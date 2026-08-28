import "server-only";
import { eq, and, not, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import {
  paymentOrders,
  wallets,
  walletTransactions,
  generationRuns,
  projects,
  type PaymentOrder,
} from "@/db/schema";
import { reserveCreditsForRun } from "@/lib/wallet/reserve";
import { dispatchGenerationJob } from "@/lib/queue/dispatch";

export interface FinalizePaymentResult {
  success: boolean;
  paymentOrder: PaymentOrder | null;
  autoResumedRunId?: string;
  alreadyProcessed?: boolean;
  errorCode?: string;
  error?: string;
}

export async function finalizeCapturedPayment(params: {
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: number;
}): Promise<FinalizePaymentResult> {
  const { providerOrderId, providerPaymentId, amountPaise } = params;

  // 1. Load local payment order record
  const [order] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.providerOrderId, providerOrderId))
    .limit(1);

  if (!order) {
    return {
      success: false,
      paymentOrder: null,
      errorCode: "ORDER_NOT_FOUND",
      error: `Local payment order not found for provider order ID: ${providerOrderId}`,
    };
  }

  // 2. Fast-path Idempotency Check: if already paid
  if (order.status === "paid") {
    return {
      success: true,
      paymentOrder: order,
      alreadyProcessed: true,
    };
  }

  // 3. Amount & Currency Verification: Provider amount MUST match local order expectation
  if (order.amountPaise !== amountPaise) {
    console.error(
      `🚨 PAYMENT_AMOUNT_MISMATCH for order ${order.id}: expected ${order.amountPaise} paise, received ${amountPaise} paise from provider.`
    );
    await db
      .update(paymentOrders)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(paymentOrders.id, order.id));

    return {
      success: false,
      paymentOrder: order,
      errorCode: "PAYMENT_AMOUNT_MISMATCH",
      error: "Payment amount mismatch detected. Wallet was not credited.",
    };
  }

  // 4. Atomic PostgreSQL Transaction: Mark Paid + Increment Wallet + Record Purchase Ledger
  const txnId = `txn_${nanoid(16)}`;

  try {
    const transactionResult = await db.transaction(async (tx) => {
      // Conditionally claim and update the payment order status to 'paid'
      // If another concurrent thread/webhook already updated it to 'paid', 0 rows returned
      const [updatedOrder] = await tx
        .update(paymentOrders)
        .set({
          status: "paid",
          providerPaymentId,
          updatedAt: new Date(),
        })
        .where(and(eq(paymentOrders.id, order.id), not(eq(paymentOrders.status, "paid"))))
        .returning();

      if (!updatedOrder) {
        // Race condition handled: order was already finalized concurrently
        const [currentOrder] = await tx
          .select()
          .from(paymentOrders)
          .where(eq(paymentOrders.id, order.id))
          .limit(1);
        return { order: currentOrder || order, alreadyProcessed: true };
      }

      // Ensure user wallet exists or insert if missing
      await tx
        .insert(wallets)
        .values({
          id: `wal_${nanoid(16)}`,
          userId: order.userId,
          balancePaise: 0,
          reservedPaise: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing({ target: wallets.userId });

      // Atomic wallet balance increment
      await tx.execute(sql`
        UPDATE wallets
        SET balance_paise = balance_paise + ${order.amountPaise},
            updated_at = NOW()
        WHERE user_id = ${order.userId};
      `);

      // Insert exactly one purchase ledger entry
      await tx.insert(walletTransactions).values({
        id: txnId,
        userId: order.userId,
        paymentOrderId: order.id,
        type: "purchase",
        amountPaise: order.amountPaise,
        status: "completed",
        metadata: {
          providerOrderId,
          providerPaymentId,
          verifiedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      });

      return { order: updatedOrder, alreadyProcessed: false };
    });

    if (transactionResult.alreadyProcessed) {
      return {
        success: true,
        paymentOrder: transactionResult.order,
        alreadyProcessed: true,
      };
    }

    let autoResumedRunId: string | undefined;

    // 5. Auto-Resume: If payment was created for a specific pending generation run
    if (order.generationRunId) {
      const [run] = await db
        .select()
        .from(generationRuns)
        .where(eq(generationRuns.id, order.generationRunId))
        .limit(1);

      if (run && (run.status === "awaiting_payment" || run.status === "queued")) {
        // Verify project is still active and not deleted/under deletion
        const [project] = await db
          .select()
          .from(projects)
          .where(eq(projects.id, run.projectId))
          .limit(1);

        if (!project || project.deletedAt || project.deletionStartedAt) {
          console.log(
            `⚠️ [Auto-Resume Skipped] Project ${run.projectId} was deleted/cancelled before payment completed. Wallet credited without auto-resuming generation.`
          );
        } else {
          const reservation = await reserveCreditsForRun({
            userId: order.userId,
            projectId: run.projectId,
            generationRunId: run.id,
            requiredCostPaise: run.estimatedCostPaise,
          });

          if (reservation.success) {
            const dispatchRes = await dispatchGenerationJob(run.id);
            if (dispatchRes.success) {
              autoResumedRunId = run.id;
            }
          }
        }
      }
    }

    return {
      success: true,
      paymentOrder: transactionResult.order,
      autoResumedRunId,
    };
  } catch (err: any) {
    console.error("❌ Atomic payment finalization transaction failed:", err);
    return {
      success: false,
      paymentOrder: order,
      errorCode: "PAYMENT_FINALIZATION_FAILED",
      error: err.message || "Failed to finalize payment transaction.",
    };
  }
}
