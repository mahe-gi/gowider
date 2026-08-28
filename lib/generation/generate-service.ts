import "server-only";
import { nanoid } from "nanoid";
import { eq, and, inArray, desc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, generationRuns, type GenerationRun } from "@/db/schema";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";
import { reserveCreditsForRun } from "@/lib/wallet/reserve";
import { getUserWallet } from "@/lib/wallet/service";
import { dispatchGenerationJob } from "@/lib/queue/dispatch";

export interface CreateGenerationInput {
  userId: string;
  projectId: string;
  idempotencyKey?: string;
}

export interface CreateGenerationResult {
  success: boolean;
  generationRunId: string;
  status: string;
  dispatchState: string;
  estimatedCostPaise: number;
  isExisting?: boolean;
  insufficientCredits?: boolean;
  shortfallPaise?: number;
  availablePaise?: number;
  pricing?: any;
}

export async function createOrResumeGeneration(
  input: CreateGenerationInput
): Promise<CreateGenerationResult> {
  const { userId, projectId } = input;
  const idempotencyKey = input.idempotencyKey || `idem_${nanoid(16)}`;

  // 1. Fetch Project and Verify Ownership & Configuration
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
        isNull(projects.deletionStartedAt)
      )
    )
    .limit(1);

  if (!project) {
    throw new Error("NOT_FOUND: Project not found or access denied.");
  }

  if (!project.sourceLanguage || !project.targetLanguages || project.targetLanguages.length === 0) {
    throw new Error("INVALID_CONFIGURATION: Please configure source and target languages first.");
  }

  if (!project.voiceRightsConfirmedAt) {
    throw new Error("VOICE_RIGHTS_CONSENT_REQUIRED: Voice ownership and dubbing rights confirmation is required.");
  }

  // 2. Calculate Authoritative Price
  const duration = project.serverVerifiedDurationSeconds || project.durationSeconds || 1;
  const pricing = calculateDubbingCost(duration, project.targetLanguages.length);
  const requiredCostPaise = pricing.totalCostPaise;

  // 3. Server-side Idempotency Check: Active Generation Run
  const [existingActiveRun] = await db
    .select()
    .from(generationRuns)
    .where(
      and(
        eq(generationRuns.projectId, project.id),
        inArray(generationRuns.status, [
          "awaiting_payment",
          "queued",
          "uploading_to_sarvam",
          "processing",
          "exporting",
        ])
      )
    )
    .orderBy(desc(generationRuns.createdAt))
    .limit(1);

  if (existingActiveRun) {
    if (existingActiveRun.status !== "awaiting_payment") {
      return {
        success: true,
        generationRunId: existingActiveRun.id,
        status: existingActiveRun.status,
        dispatchState: existingActiveRun.dispatchState,
        estimatedCostPaise: existingActiveRun.estimatedCostPaise,
        isExisting: true,
      };
    }

    // Attempt reservation on this existing awaiting_payment run
    const reservation = await reserveCreditsForRun({
      userId,
      projectId: project.id,
      generationRunId: existingActiveRun.id,
      requiredCostPaise,
    });

    if (!reservation.success) {
      const wallet = await getUserWallet(userId);
      const shortfallPaise = Math.max(0, requiredCostPaise - wallet.availablePaise);
      return {
        success: false,
        insufficientCredits: true,
        generationRunId: existingActiveRun.id,
        status: "awaiting_payment",
        dispatchState: "pending",
        estimatedCostPaise: requiredCostPaise,
        shortfallPaise,
        availablePaise: wallet.availablePaise,
        pricing,
      };
    }

    // Reservation succeeded -> Dispatch BullMQ job
    await db
      .update(projects)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(projects.id, project.id));

    const dispatchResult = await dispatchGenerationJob(existingActiveRun.id);

    return {
      success: true,
      generationRunId: existingActiveRun.id,
      status: "queued",
      dispatchState: dispatchResult.success ? "dispatched" : "pending",
      estimatedCostPaise: requiredCostPaise,
    };
  }

  // 4. Create New Generation Run with PostgreSQL Atomic Conflict Resolution
  const runId = `run_${nanoid(16)}`;
  let finalRunId = runId;

  try {
    const [insertedRun] = await db
      .insert(generationRuns)
      .values({
        id: runId,
        projectId: project.id,
        userId,
        targetLanguages: project.targetLanguages,
        projectConfigSnapshot: {
          sourceLanguage: project.sourceLanguage,
          targetLanguages: project.targetLanguages,
          durationSeconds: duration,
        },
        pricingSnapshot: pricing,
        idempotencyKey,
        status: "awaiting_payment",
        dispatchState: "pending",
        estimatedCostPaise: requiredCostPaise,
        reservedCostPaise: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing({ target: [generationRuns.projectId, generationRuns.idempotencyKey] })
      .returning();

    if (!insertedRun) {
      const [winner] = await db
        .select()
        .from(generationRuns)
        .where(and(eq(generationRuns.projectId, project.id), eq(generationRuns.idempotencyKey, idempotencyKey)))
        .limit(1);

      if (winner) {
        finalRunId = winner.id;
      }
    }
  } catch (insertErr: any) {
    const [winner] = await db
      .select()
      .from(generationRuns)
      .where(and(eq(generationRuns.projectId, project.id), eq(generationRuns.idempotencyKey, idempotencyKey)))
      .limit(1);

    if (winner) {
      finalRunId = winner.id;
    } else {
      throw insertErr;
    }
  }

  // 5. Check Wallet Balance & Attempt Atomic Reservation
  const reservation = await reserveCreditsForRun({
    userId,
    projectId: project.id,
    generationRunId: finalRunId,
    requiredCostPaise,
  });

  if (!reservation.success) {
    const wallet = await getUserWallet(userId);
    const shortfallPaise = Math.max(0, requiredCostPaise - wallet.availablePaise);
    return {
      success: false,
      insufficientCredits: true,
      generationRunId: finalRunId,
      status: "awaiting_payment",
      dispatchState: "pending",
      estimatedCostPaise: requiredCostPaise,
      shortfallPaise,
      availablePaise: wallet.availablePaise,
      pricing,
    };
  }

  // 6. Dispatch BullMQ Generation Job
  await db
    .update(projects)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  const dispatchResult = await dispatchGenerationJob(finalRunId);

  return {
    success: true,
    generationRunId: finalRunId,
    status: "queued",
    dispatchState: dispatchResult.success ? "dispatched" : "pending",
    estimatedCostPaise: requiredCostPaise,
  };
}
