import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { generationRuns } from "@/db/schema";
import { inngest } from "./client";

export interface DispatchResult {
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export async function dispatchGenerationRun(generationRunId: string): Promise<DispatchResult> {
  try {
    await inngest.send({
      name: "generation.requested",
      data: {
        generationRunId,
      },
    });

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

    return { success: true };
  } catch (err: any) {
    console.error(`❌ Inngest dispatch failed for run ${generationRunId}:`, err);

    await db
      .update(generationRuns)
      .set({
        dispatchState: "failed",
        dispatchError: err.message || "Failed to dispatch Inngest event",
        status: "queued", // Kept queued so reconciliation cron recovers it
        currentStep: "queued",
        currentStepLabel: "Queued for processing (awaiting dispatch worker)",
        updatedAt: new Date(),
      })
      .where(eq(generationRuns.id, generationRunId));

    return {
      success: false,
      errorCode: "GENERATION_DISPATCH_PENDING",
      errorMessage: "Generation queued. Processing worker is connecting...",
    };
  }
}
