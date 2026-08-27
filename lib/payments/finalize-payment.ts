import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentOrders, generationRuns, wallets, type PaymentOrder } from "@/db/schema";
import { creditUserWallet } from "@/lib/wallet/service";
import { reserveCreditsForRun } from "@/lib/wallet/reserve";
import { inngest } from "@/lib/inngest/client";

export interface FinalizePaymentResult {
  success: boolean;
  paymentOrder: PaymentOrder;
  autoResumedRunId?: string;
  alreadyProcessed?: boolean;
  error?: string;
}

export async function finalizeCapturedPayment(params: {
  providerOrderId: string;
  providerPaymentId: string;
  amountPaise: number;
}): Promise<FinalizePaymentResult> {
  const { providerOrderId, providerPaymentId, amountPaise } = params;

  // 1. Load local payment order
  const [order] = await db
    .select()
    .from(paymentOrders)
    .where(eq(paymentOrders.providerOrderId, providerOrderId))
    .limit(1);

  if (!order) {
    return {
      success: false,
      paymentOrder: null as any,
      error: `Payment order not found for provider order ID: ${providerOrderId}`,
    };
  }

  // 2. Check if already marked paid (Idempotency)
  if (order.status === "paid") {
    return {
      success: true,
      paymentOrder: order,
      alreadyProcessed: true,
    };
  }

  // 3. Update payment order record
  const [updatedOrder] = await db
    .update(paymentOrders)
    .set({
      status: "paid",
      providerPaymentId,
      updatedAt: new Date(),
    })
    .where(eq(paymentOrders.id, order.id))
    .returning();

  // 4. Credit user's wallet
  await creditUserWallet({
    userId: order.userId,
    amountPaise: order.amountPaise,
    type: "purchase",
    paymentOrderId: order.id,
    metadata: {
      providerPaymentId,
      providerOrderId,
    },
  });

  let autoResumedRunId: string | undefined;

  // 5. Auto-Resume Check: if payment order is linked to a generation run
  if (order.generationRunId) {
    const [run] = await db
      .select()
      .from(generationRuns)
      .where(eq(generationRuns.id, order.generationRunId))
      .limit(1);

    if (run && (run.status === "awaiting_payment" || run.status === "queued")) {
      const reservation = await reserveCreditsForRun({
        userId: order.userId,
        projectId: run.projectId,
        generationRunId: run.id,
        requiredCostPaise: run.estimatedCostPaise,
      });

      if (reservation.success) {
        // Mark run as queued and dispatch Inngest event
        await db
          .update(generationRuns)
          .set({
            status: "queued",
            reservedCostPaise: run.estimatedCostPaise,
            currentStep: "queued",
            currentStepLabel: "Queued for processing",
            updatedAt: new Date(),
          })
          .where(eq(generationRuns.id, run.id));

        try {
          await inngest.send({
            name: "generation.requested",
            data: {
              generationRunId: run.id,
            },
          });
          autoResumedRunId = run.id;
        } catch (inngestErr) {
          console.error("Failed to send inngest event on auto-resume:", inngestErr);
        }
      }
    }
  }

  return {
    success: true,
    paymentOrder: updatedOrder,
    autoResumedRunId,
  };
}
