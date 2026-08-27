import { inngest } from "../client";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentWebhookEvents } from "@/db/schema";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

export const paymentWebhookWorkflow = inngest.createFunction(
  { id: "gowider-payment-webhook" },
  { event: "payment.webhook.received" },
  async ({ event, step }) => {
    const { providerOrderId, providerPaymentId, amountPaise, webhookEventId } = event.data;

    const result = await step.run("finalize-payment", async () => {
      return finalizeCapturedPayment({
        providerOrderId,
        providerPaymentId,
        amountPaise,
      });
    });

    if (webhookEventId && result.success) {
      await step.run("mark-webhook-processed", async () => {
        await db
          .update(paymentWebhookEvents)
          .set({
            status: "processed",
            processedAt: new Date(),
          })
          .where(
            and(
              eq(paymentWebhookEvents.provider, "razorpay"),
              eq(paymentWebhookEvents.providerEventId, webhookEventId)
            )
          );
      });
    }

    return result;
  }
);
