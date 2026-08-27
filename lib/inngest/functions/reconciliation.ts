import { inngest } from "../client";
import { eq, and, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationRuns, paymentOrders } from "@/db/schema";
import { paymentProvider } from "@/lib/payments/razorpay";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";
import { dispatchGenerationRun } from "../dispatch";

export const reconciliationWorkflow = inngest.createFunction(
  { id: "gowider-reconciliation" },
  { cron: "*/15 * * * *" }, // Run every 15 minutes
  async ({ step }) => {
    // 1. Reconcile Stuck Queued Generation Runs
    const reDispatchedRuns = await step.run("reconcile-queued-runs", async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

      const stuckRuns = await db
        .select()
        .from(generationRuns)
        .where(
          and(
            eq(generationRuns.status, "queued"),
            lt(generationRuns.updatedAt, fiveMinutesAgo),
            or(
              eq(generationRuns.dispatchState, "failed"),
              eq(generationRuns.dispatchState, "pending")
            )
          )
        )
        .limit(10);

      let count = 0;
      for (const run of stuckRuns) {
        const res = await dispatchGenerationRun(run.id);
        if (res.success) count++;
      }
      return count;
    });

    // 2. Reconcile Pending Payment Orders
    const reconciledPayments = await step.run("reconcile-pending-payments", async () => {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const pendingOrders = await db
        .select()
        .from(paymentOrders)
        .where(
          and(
            or(
              eq(paymentOrders.status, "pending"),
              eq(paymentOrders.status, "created"),
              eq(paymentOrders.status, "creating")
            ),
            lt(paymentOrders.createdAt, fifteenMinutesAgo)
          )
        )
        .limit(10);

      let processed = 0;

      for (const order of pendingOrders) {
        if (order.providerPaymentId) {
          const payment = await paymentProvider.getPayment(order.providerPaymentId);
          if (payment.status === "captured") {
            await finalizeCapturedPayment({
              providerOrderId: order.providerOrderId || "",
              providerPaymentId: order.providerPaymentId,
              amountPaise: payment.amountPaise,
            });
            processed++;
          } else if (payment.status === "failed") {
            await db
              .update(paymentOrders)
              .set({ status: "failed", updatedAt: new Date() })
              .where(eq(paymentOrders.id, order.id));
          }
        } else if (order.providerOrderId && paymentProvider.getOrder) {
          try {
            const providerOrder = await paymentProvider.getOrder(order.providerOrderId);
            if (providerOrder.status === "paid") {
              // Order was paid; will be finalized when payment webhook arrives or payment ID found
            } else if (providerOrder.status === "attempted") {
              // Leave pending
            }
          } catch (ordErr) {
            console.error(`Error querying provider order ${order.providerOrderId}:`, ordErr);
          }
        }
      }

      return processed;
    });

    return { reDispatchedRuns, reconciledPayments };
  }
);
