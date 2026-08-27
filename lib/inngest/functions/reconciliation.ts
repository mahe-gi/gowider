import { inngest } from "../client";
import { eq, and, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationRuns, paymentOrders } from "@/db/schema";
import { paymentProvider } from "@/lib/payments/razorpay";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

export const reconciliationWorkflow = inngest.createFunction(
  { id: "gowider-reconciliation" },
  { cron: "*/30 * * * *" }, // Run every 30 minutes
  async ({ step }) => {
    // 1. Reconcile pending payment orders older than 15 minutes
    const reconciledPayments = await step.run("reconcile-pending-payments", async () => {
      const threshold = new Date(Date.now() - 15 * 60 * 1000);
      const pendingOrders = await db
        .select()
        .from(paymentOrders)
        .where(and(eq(paymentOrders.status, "pending"), lt(paymentOrders.createdAt, threshold)))
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
          }
        }
      }
      return processed;
    });

    return { reconciledPayments };
  }
);
