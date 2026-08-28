import { Worker, type Job } from "bullmq";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentWebhookEvents } from "@/db/schema";
import { getRedisConnection } from "@/lib/queue/connection";
import { getPaymentQueueName } from "@/lib/queue/queues";
import type { PaymentJobName, PaymentJobData } from "@/lib/queue/types";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

export function createPaymentWorker(): Worker<PaymentJobData, any, PaymentJobName> {
  const worker = new Worker<PaymentJobData, any, PaymentJobName>(
    getPaymentQueueName(),
    async (job: Job<PaymentJobData, any, PaymentJobName>) => {
      const { webhookEventId, providerPaymentId } = job.data;
      console.log(`💳 [Payment Worker] Processing payment job: ${job.name} (webhook: ${webhookEventId})`);

      if (webhookEventId) {
        const [event] = await db
          .select()
          .from(paymentWebhookEvents)
          .where(eq(paymentWebhookEvents.id, webhookEventId))
          .limit(1);

        if (!event) {
          throw new Error(`Webhook event not found: ${webhookEventId}`);
        }

        if (event.status === "processed") {
          return { success: true, alreadyProcessed: true };
        }

        const payload = event.payload as any;
        const paymentEntity = payload?.payload?.payment?.entity;
        const providerOrderId = paymentEntity?.order_id;
        const resolvedPaymentId = providerPaymentId || paymentEntity?.id;
        const amountPaise = paymentEntity?.amount;

        if (!providerOrderId || !resolvedPaymentId || !amountPaise) {
          await db
            .update(paymentWebhookEvents)
            .set({
              status: "failed",
              lastError: "Missing required order_id or payment id in webhook entity",
            })
            .where(eq(paymentWebhookEvents.id, event.id));

          throw new Error(`Invalid webhook payload: missing order_id (${providerOrderId}) or payment_id (${resolvedPaymentId})`);
        }

        const result = await finalizeCapturedPayment({
          providerOrderId,
          providerPaymentId: resolvedPaymentId,
          amountPaise,
        });

        if (!result.success) {
          await db
            .update(paymentWebhookEvents)
            .set({
              status: "failed",
              lastError: result.error || "Payment finalization failed",
            })
            .where(eq(paymentWebhookEvents.id, event.id));

          throw new Error(result.error || "Payment finalization failed");
        }

        await db
          .update(paymentWebhookEvents)
          .set({
            status: "processed",
            processedAt: new Date(),
          })
          .where(eq(paymentWebhookEvents.id, event.id));

        return result;
      }

      return { success: true, skipped: true };
    },
    {
      connection: getRedisConnection(),
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ [Payment Worker] Completed job ${job.name}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ [Payment Worker] Failed job ${job?.name}:`, err.message);
  });

  return worker;
}
