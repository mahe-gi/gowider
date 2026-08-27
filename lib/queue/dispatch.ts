import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationRuns } from "@/db/schema";
import { getGenerationQueue, getPaymentQueue, getMaintenanceQueue } from "./queues";
import type { GenerationJobName, GenerationJobData, PaymentJobData } from "./types";

export interface DispatchResult {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Enqueues a generation step job into BullMQ with deterministic stage job IDs.
 * Single-Chain Guarantee: If an active/delayed job for this stage already exists, deduplicates and skips.
 */
export async function dispatchGenerationJob(
  generationRunId: string,
  jobName: GenerationJobName = "generation:start",
  delayMs: number = 0,
  pollAttempt: number = 1
): Promise<DispatchResult> {
  try {
    const queue = getGenerationQueue();

    // Deterministic single-chain job ID per run and stage
    const jobId = `gen_${jobName.replace(":", "_")}_${generationRunId}`;

    try {
      const existing = await queue.getJob(jobId);
      if (existing) {
        const state = await existing.getState();
        // If already queued, active, or delayed, do not spawn duplicate polling loops
        if (state === "delayed" || state === "active" || state === "waiting") {
          return { success: true };
        }
        // If previously completed or failed, remove it so the next stage/attempt can be scheduled
        await existing.remove();
      }
    } catch {
      // Non-blocking
    }

    await queue.add(
      jobName,
      {
        generationRunId,
        pollAttempt,
      },
      {
        jobId,
        delay: delayMs,
        attempts: 5, // Exponential backoff retries on transient network failures
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true, // Auto-remove on completion to keep deterministic IDs reusable
      }
    );

    if (jobName === "generation:start") {
      await db
        .update(generationRuns)
        .set({
          dispatchState: "dispatched",
          dispatchError: null,
          status: "queued",
          currentStep: "queued",
          currentStepLabel: "Queued for processing",
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, generationRunId));
    }

    return { success: true };
  } catch (err: any) {
    console.error(`❌ BullMQ dispatch failed for run ${generationRunId} (${jobName}):`, err.message);

    if (jobName === "generation:start") {
      await db
        .update(generationRuns)
        .set({
          dispatchState: "failed",
          dispatchError: err.message || "Failed to enqueue into Redis queue",
          status: "queued",
          currentStep: "queued",
          currentStepLabel: "Queued for processing (awaiting dispatch worker)",
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, generationRunId));
    }

    return {
      success: false,
      errorCode: "GENERATION_DISPATCH_PENDING",
      errorMessage: "Generation queued. Processing worker is connecting...",
    };
  }
}

/**
 * Enqueues a payment processing job into BullMQ.
 */
export async function dispatchPaymentJob(data: PaymentJobData): Promise<DispatchResult> {
  try {
    const queue = getPaymentQueue();
    const jobId = `pay_${data.paymentOrderId || data.webhookEventId || Date.now()}`;

    try {
      const existing = await queue.getJob(jobId);
      if (existing) {
        const state = await existing.getState();
        if (state === "delayed" || state === "active" || state === "waiting") {
          return { success: true };
        }
        await existing.remove();
      }
    } catch {
      // Non-blocking
    }

    await queue.add("payment:process-webhook", data, {
      jobId,
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
    });

    return { success: true };
  } catch (err: any) {
    console.error("❌ Failed to enqueue payment job into BullMQ:", err.message);
    return {
      success: false,
      errorCode: "PAYMENT_DISPATCH_FAILED",
      errorMessage: err.message,
    };
  }
}

/**
 * Ensures the recurring maintenance tick is scheduled.
 */
export async function setupMaintenanceSchedule(): Promise<void> {
  try {
    const queue = getMaintenanceQueue();
    await queue.upsertJobScheduler(
      "maintenance:tick",
      { every: 60 * 1000 },
      {
        data: { triggeredAt: new Date().toISOString() },
      }
    );
  } catch (err: any) {
    console.error("❌ Failed to setup maintenance schedule:", err.message);
  }
}
