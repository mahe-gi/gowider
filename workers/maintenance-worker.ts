import { Worker, type Job } from "bullmq";
import { eq, and, isNotNull, or, lt, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationRuns, paymentWebhookEvents, guestSessions, projects, paymentOrders } from "@/db/schema";
import { storage } from "@/lib/storage";
import { paymentProvider } from "@/lib/payments/razorpay";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";
import { getRedisConnection } from "@/lib/queue/connection";
import { MAINTENANCE_QUEUE_NAME } from "@/lib/queue/queues";
import { dispatchGenerationJob, dispatchPaymentJob } from "@/lib/queue/dispatch";
import type { MaintenanceJobName, MaintenanceJobData } from "@/lib/queue/types";

export function createMaintenanceWorker(): Worker<MaintenanceJobData, any, MaintenanceJobName> {
  const worker = new Worker<MaintenanceJobData, any, MaintenanceJobName>(
    MAINTENANCE_QUEUE_NAME,
    async (job: Job<MaintenanceJobData, any, MaintenanceJobName>) => {
      console.log("🧹 [Maintenance Worker] Running periodic reconciliation and media cleanup heartbeat...");

      // 1. Reconcile Queued Runs that failed initial dispatch or stalled
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const queuedRuns = await db
        .select({ id: generationRuns.id })
        .from(generationRuns)
        .where(
          and(
            eq(generationRuns.status, "queued"),
            or(
              eq(generationRuns.dispatchState, "failed"),
              lt(generationRuns.createdAt, oneMinuteAgo)
            )
          )
        )
        .limit(10);

      for (const run of queuedRuns) {
        console.log(`🔄 [Maintenance] Re-enqueueing queued run ${run.id}`);
        await dispatchGenerationJob(run.id, "generation:start");
      }

      // 2. Reconcile Stalled Processing Runs (e.g. if worker crashed during live polling)
      const twoMinutesAgo = new Date(Date.now() - 120 * 1000);
      const stalledProcessingRuns = await db
        .select({ id: generationRuns.id })
        .from(generationRuns)
        .where(
          and(
            eq(generationRuns.status, "processing"),
            isNotNull(generationRuns.sarvamJobId),
            lt(generationRuns.updatedAt, twoMinutesAgo)
          )
        )
        .limit(10);

      for (const run of stalledProcessingRuns) {
        console.log(`🔄 [Maintenance] Resuming stalled processing poll for run ${run.id}`);
        await dispatchGenerationJob(run.id, "generation:poll-live", 0, 1);
      }

      // 3. Reconcile Stalled Exporting Runs
      const stalledExportingRuns = await db
        .select({ id: generationRuns.id })
        .from(generationRuns)
        .where(
          and(
            eq(generationRuns.status, "exporting"),
            isNotNull(generationRuns.sarvamJobId),
            lt(generationRuns.updatedAt, twoMinutesAgo)
          )
        )
        .limit(10);

      for (const run of stalledExportingRuns) {
        console.log(`🔄 [Maintenance] Resuming stalled export poll for run ${run.id}`);
        await dispatchGenerationJob(run.id, "generation:poll-export", 0, 1);
      }

      // 4. Reconcile Unprocessed/Pending Webhook Events
      const pendingWebhooks = await db
        .select({ id: paymentWebhookEvents.id })
        .from(paymentWebhookEvents)
        .where(
          and(
            inArray(paymentWebhookEvents.status, ["received", "dispatch_pending"]),
            lt(paymentWebhookEvents.createdAt, twoMinutesAgo)
          )
        )
        .limit(10);

      for (const ev of pendingWebhooks) {
        console.log(`🔄 [Maintenance] Re-dispatching unprocessed webhook event ${ev.id}`);
        await dispatchPaymentJob({ webhookEventId: ev.id });
      }

      // 5. Reconcile Pending Payment Orders directly against payment provider
      let reconciledOrdersCount = 0;
      const fiveMinutesAgo = new Date(Date.now() - 300 * 1000);
      const oneHourAgo = new Date(Date.now() - 3600 * 1000);

      try {
        const pendingOrders = await db
          .select()
          .from(paymentOrders)
          .where(
            and(
              inArray(paymentOrders.status, ["created", "pending"]),
              lt(paymentOrders.createdAt, fiveMinutesAgo)
            )
          )
          .limit(10);

        for (const order of pendingOrders) {
          if (order.providerOrderId && paymentProvider.getOrder) {
            try {
              const remoteOrder = await paymentProvider.getOrder(order.providerOrderId);
              if (remoteOrder && remoteOrder.status === "paid") {
                console.log(`💳 [Maintenance] Reconciling paid provider order ${order.providerOrderId}...`);
                await finalizeCapturedPayment({
                  providerOrderId: order.providerOrderId,
                  providerPaymentId: order.providerPaymentId || `pay_recon_${order.providerOrderId}`,
                  amountPaise: remoteOrder.amountPaise || order.amountPaise,
                });
                reconciledOrdersCount++;
              } else if (order.createdAt < oneHourAgo) {
                // Expire ancient abandoned orders
                await db
                  .update(paymentOrders)
                  .set({ status: "expired", updatedAt: new Date() })
                  .where(eq(paymentOrders.id, order.id));
              }
            } catch (orderErr: any) {
              console.warn(`Could not check remote status for order ${order.providerOrderId}:`, orderErr.message);
            }
          }
        }
      } catch (payReconErr: any) {
        console.warn("⚠️ [Maintenance] Payment reconciliation warning:", payReconErr.message);
      }

      // 6. Media Retention & Expired Guest Session Cleanup (Never deletes active or completed projects)
      let cleanedMediaCount = 0;
      try {
        const expiredSessions = await db
          .select({ id: guestSessions.id })
          .from(guestSessions)
          .where(lt(guestSessions.expiresAt, new Date()))
          .limit(20);

        if (expiredSessions.length > 0) {
          const sessionIds = expiredSessions.map((s) => s.id);

          // Find guest projects that are expired and draft (never converted to paid user projects)
          const expiredProjects = await db
            .select({ id: projects.id, sourceR2Key: projects.sourceR2Key })
            .from(projects)
            .where(
              and(
                inArray(projects.guestSessionId, sessionIds),
                eq(projects.status, "draft")
              )
            );

          for (const proj of expiredProjects) {
            if (proj.sourceR2Key) {
              await storage.deleteObject(proj.sourceR2Key);
              cleanedMediaCount++;
            }
          }

          // Delete expired guest sessions
          await db.delete(guestSessions).where(inArray(guestSessions.id, sessionIds));
        }
      } catch (cleanupErr: any) {
        console.warn("⚠️ [Maintenance] Cleanup step warning:", cleanupErr.message);
      }

      return {
        reconciledQueued: queuedRuns.length,
        reconciledProcessing: stalledProcessingRuns.length,
        reconciledExporting: stalledExportingRuns.length,
        reconciledWebhooks: pendingWebhooks.length,
        reconciledOrders: reconciledOrdersCount,
        cleanedMediaCount,
      };
    },
    {
      connection: getRedisConnection(),
      concurrency: 1,
    }
  );

  return worker;
}
