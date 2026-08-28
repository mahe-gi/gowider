import "server-only";
import { eq, and, inArray, or, isNull, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { projects, generationRuns, projectOutputs } from "@/db/schema";
import { storage } from "@/lib/storage";
import {
  createDubbingJob,
  streamUploadToSarvam,
  startDubbingJob,
  getDubbingLiveStatus,
  getDubbingExportStatus,
} from "@/lib/sarvam/dubbing";
import { settleGenerationRun, releaseFullReservation } from "@/lib/wallet/settle";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";
import { TransientError, isTransientNetworkError, OrphanJobError } from "./errors";

export interface GenerationProcessResult {
  status: "processing" | "exporting" | "completed" | "partial_failure" | "failed" | "already_terminal";
  nextAction: "poll_live" | "poll_export" | "none";
  pollDelayMs?: number;
  error?: string;
  successfulCount?: number;
  targetCount?: number;
}

/**
 * Step 1: Start/Resume Provider Dubbing Job with Authoritative Upload-Stage Crash Recovery.
 * Idempotency Invariant: If sarvamJobId exists, inspects state and guarantees upload completion before starting.
 */
export async function processGenerationStart(generationRunId: string): Promise<GenerationProcessResult> {
  const [run] = await db
    .select()
    .from(generationRuns)
    .where(eq(generationRuns.id, generationRunId))
    .limit(1);

  if (!run) {
    throw new OrphanJobError(`Generation run not found: ${generationRunId}`, "generation_run_missing");
  }

  const isTerminal =
    run.status === "completed" ||
    run.status === "partial_failure" ||
    run.status === "failed" ||
    run.status === "cancelled";

  if (isTerminal) {
    return { status: "already_terminal", nextAction: "none" };
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, run.projectId))
    .limit(1);

  if (!project || project.deletedAt) {
    throw new OrphanJobError(`Project not found or deleted: ${run.projectId}`, "project_deleted");
  }

  let sarvamJobId = run.sarvamJobId;
  const configSnapshot = (run.projectConfigSnapshot as any) || {};

  // Case A: sarvamJobId already exists from a prior attempt that may have crashed during upload
  if (sarvamJobId) {
    try {
      const liveCheck = await getDubbingLiveStatus(sarvamJobId);

      if (liveCheck.status === "completed" || liveCheck.status === "partial_failure") {
        return { status: "exporting", nextAction: "poll_export", pollDelayMs: 2000 };
      }

      if (liveCheck.status === "in_progress" || liveCheck.status === "queued") {
        await db
          .update(generationRuns)
          .set({
            status: "processing",
            currentStep: liveCheck.currentStep || "dubbing",
            currentStepLabel: liveCheck.currentStepLabel || "Localizing voices and emotion",
            progress: liveCheck.progress,
            updatedAt: new Date(),
          })
          .where(eq(generationRuns.id, run.id));

        return { status: "processing", nextAction: "poll_live", pollDelayMs: 15000 };
      }

      // If job is created but unstarted on provider:
      // Authoritative upload guarantee: re-stream source video to upload URL to ensure upload is 100% complete
      if (liveCheck.status === "not_started") {
        const uploadUrl = configSnapshot.sarvamUploadUrl;
        if (uploadUrl) {
          console.log(`🔄 [Recovery] Re-streaming upload for unstarted job ${sarvamJobId}...`);
          const { stream, contentLength, contentType } = await storage.getObjectStream(project.sourceR2Key);
          if (stream && contentLength) {
            await streamUploadToSarvam({
              uploadUrl,
              stream,
              contentLength,
              contentType: contentType || project.sourceMimeType || "video/mp4",
            });
          }
        }

        // Trigger start after upload is guaranteed complete
        await startDubbingJob(sarvamJobId);

        await db
          .update(generationRuns)
          .set({
            status: "processing",
            currentStep: "dubbing",
            currentStepLabel: "Localizing voices and emotion",
            updatedAt: new Date(),
          })
          .where(eq(generationRuns.id, run.id));

        return { status: "processing", nextAction: "poll_live", pollDelayMs: 15000 };
      }
    } catch (checkErr: any) {
      if (isTransientNetworkError(checkErr)) {
        throw new TransientError(checkErr.message, 10);
      }
      console.warn(`Could not verify existing job ${sarvamJobId}:`, checkErr.message);
    }
  }

  // Case B: Create new provider job with atomic claim lease (and stale lease recovery)
  if (!sarvamJobId) {
    const staleLeaseCutoff = new Date(Date.now() - 2 * 60 * 1000);
    const [claimedRun] = await db
      .update(generationRuns)
      .set({
        status: "uploading_to_sarvam",
        currentStep: "uploading",
        currentStepLabel: "Preparing video localization job",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(generationRuns.id, run.id),
          or(
            inArray(generationRuns.status, ["queued", "awaiting_payment"]),
            and(
              eq(generationRuns.status, "uploading_to_sarvam"),
              isNull(generationRuns.sarvamJobId),
              lt(generationRuns.updatedAt, staleLeaseCutoff)
            )
          )
        )
      )
      .returning();

    if (!claimedRun) {
      // Another concurrent worker execution currently holds an active lease
      const [current] = await db
        .select()
        .from(generationRuns)
        .where(eq(generationRuns.id, run.id))
        .limit(1);

      if (current?.sarvamJobId) {
        sarvamJobId = current.sarvamJobId;
      } else {
        return { status: "processing", nextAction: "none" };
      }
    }

    try {
      const sourceLang = project.sourceLanguage || "en-IN";
      const targetLangs = run.targetLanguages;

      // 1. Call Sarvam API to create job
      const jobResponse = await createDubbingJob({
        sourceLanguage: sourceLang,
        targetLanguages: targetLangs,
      });

      sarvamJobId = jobResponse.jobId;

      // 2. Persist provider job ID and upload_url immediately before uploading for crash recovery
      await db
        .update(generationRuns)
        .set({
          sarvamJobId,
          projectConfigSnapshot: {
            ...configSnapshot,
            sarvamUploadUrl: jobResponse.uploadUrl,
          },
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, run.id));

      // 3. Stream media from StorageProvider directly to provider upload URL
      if (jobResponse.uploadUrl) {
        const { stream, contentLength, contentType } = await storage.getObjectStream(project.sourceR2Key);
        if (!stream || !contentLength) {
          throw new Error(`Failed to retrieve stream from storage object: ${project.sourceR2Key}`);
        }

        await streamUploadToSarvam({
          uploadUrl: jobResponse.uploadUrl,
          stream,
          contentLength,
          contentType: contentType || project.sourceMimeType || "video/mp4",
        });

        // 4. Trigger dubbing start
        await startDubbingJob(sarvamJobId);
      }
    } catch (err: any) {
      console.error(`💥 Failed during provider initialization for run ${run.id}:`, err.message);

      if (isTransientNetworkError(err)) {
        throw new TransientError(err.message || "Temporary network/provider error", 10);
      }

      // Permanent failure (e.g. missing SARVAM_API_KEY, 401, validation error)
      await releaseFullReservation({
        userId: run.userId,
        projectId: project.id,
        generationRunId: run.id,
        reservedCostPaise: run.reservedCostPaise,
        reason: err.message || "Provider initialization failed",
      });

      await db
        .update(generationRuns)
        .set({
          status: "failed",
          finalCostPaise: 0,
          errorCode: "PROVIDER_INIT_FAILED",
          errorMessage: err.message || "Failed to initialize provider localization job",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, run.id));

      await db
        .update(projects)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(projects.id, project.id));

      return {
        status: "failed",
        nextAction: "none",
        error: err.message,
      };
    }
  }

  // Mark status as processing in DB
  await db
    .update(generationRuns)
    .set({
      status: "processing",
      currentStep: "dubbing",
      currentStepLabel: "Localizing voices and emotion",
      updatedAt: new Date(),
    })
    .where(eq(generationRuns.id, run.id));

  await db
    .update(projects)
    .set({ status: "processing", updatedAt: new Date() })
    .where(eq(projects.id, project.id));

  return {
    status: "processing",
    nextAction: "poll_live",
    pollDelayMs: 15000,
  };
}

/**
 * Step 2: Check live processing status on provider.
 */
export async function processGenerationLiveCheck(
  generationRunId: string,
  pollAttempt: number = 1
): Promise<GenerationProcessResult> {
  const [run] = await db
    .select()
    .from(generationRuns)
    .where(eq(generationRuns.id, generationRunId))
    .limit(1);

  if (!run) {
    throw new OrphanJobError(`Generation run not found: ${generationRunId}`, "generation_run_missing");
  }

  const isTerminal =
    run.status === "completed" ||
    run.status === "partial_failure" ||
    run.status === "failed" ||
    run.status === "cancelled";

  if (isTerminal) {
    return { status: "already_terminal", nextAction: "none" };
  }

  if (!run.sarvamJobId) {
    throw new OrphanJobError(`Cannot poll live status without sarvamJobId for run ${generationRunId}`, "generation_run_missing");
  }

  const maxAttempts = 60; // 60 * 15s = 15 minutes max timeout
  if (pollAttempt > maxAttempts) {
    await failGeneration(generationRunId, "POLLING_TIMEOUT", "Localization timed out waiting for provider completion.");
    return { status: "failed", nextAction: "none" };
  }

  let statusRes: any;
  try {
    statusRes = await getDubbingLiveStatus(run.sarvamJobId);
  } catch (err: any) {
    console.error(`Live status poll attempt ${pollAttempt} error:`, err.message);
    if (isTransientNetworkError(err)) {
      throw new TransientError(err.message, 15);
    }
    await failGeneration(generationRunId, "PROVIDER_STATUS_ERROR", err.message);
    return { status: "failed", nextAction: "none", error: err.message };
  }

  await db
    .update(generationRuns)
    .set({
      progress: statusRes.progress ?? 0,
      currentStep: statusRes.currentStep || "dubbing",
      currentStepLabel: statusRes.currentStepLabel || (statusRes.status === "completed" ? "Completed" : "Localizing voices and emotion"),
      updatedAt: new Date(),
    })
    .where(eq(generationRuns.id, run.id));

  if (statusRes.status === "failed" || statusRes.status === "deleted") {
    await failGeneration(
      generationRunId,
      statusRes.errorCode || "PROVIDER_JOB_FAILED",
      statusRes.errorMessage || "Provider localization pipeline failed."
    );
    return { status: "failed", nextAction: "none", error: statusRes.errorMessage };
  }

  if (statusRes.status === "completed" || statusRes.status === "partial_failure") {
    await db
      .update(generationRuns)
      .set({
        status: "exporting",
        currentStep: "exporting",
        currentStepLabel: "Preparing video and subtitle downloads",
        progress: 100,
        updatedAt: new Date(),
      })
      .where(eq(generationRuns.id, run.id));

    return {
      status: "exporting",
      nextAction: "poll_export",
      pollDelayMs: 2000,
    };
  }

  // Still running
  return {
    status: "processing",
    nextAction: "poll_live",
    pollDelayMs: 15000,
  };
}

/**
 * Step 3: Poll export status, stream archive files to StorageProvider, and settle credits.
 */
export async function processGenerationExportCheck(
  generationRunId: string,
  pollAttempt: number = 1
): Promise<GenerationProcessResult> {
  const [run] = await db
    .select()
    .from(generationRuns)
    .where(eq(generationRuns.id, generationRunId))
    .limit(1);

  if (!run) {
    throw new OrphanJobError(`Generation run not found: ${generationRunId}`, "generation_run_missing");
  }

  const isTerminal =
    run.status === "completed" ||
    run.status === "partial_failure" ||
    run.status === "failed" ||
    run.status === "cancelled";

  if (isTerminal) {
    return { status: "already_terminal", nextAction: "none" };
  }

  if (!run.sarvamJobId) {
    throw new OrphanJobError(`Missing sarvamJobId for export check: ${generationRunId}`, "generation_run_missing");
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, run.projectId))
    .limit(1);

  if (!project || project.deletedAt) {
    throw new OrphanJobError(`Project not found or deleted: ${run.projectId}`, "project_deleted");
  }

  let exportRes: any;
  try {
    exportRes = await getDubbingExportStatus(run.sarvamJobId);
  } catch (err: any) {
    console.error(`Export status poll attempt ${pollAttempt} error:`, err.message);
    if (isTransientNetworkError(err)) {
      throw new TransientError(err.message, 10);
    }
    await failGeneration(generationRunId, "PROVIDER_EXPORT_ERROR", err.message);
    return { status: "failed", nextAction: "none" };
  }

  const exportItems = exportRes.exports || [];
  const videoExports = exportItems.filter((e: any) => e.exportType === "video");
  const pendingVideos = videoExports.filter(
    (e: any) => e.status !== "completed" && e.status !== "failed"
  );

  const maxExportAttempts = 30;

  if ((videoExports.length < run.targetLanguages.length || pendingVideos.length > 0) && pollAttempt < maxExportAttempts) {
    return {
      status: "exporting",
      nextAction: "poll_export",
      pollDelayMs: 10000,
    };
  }

  // 4. Archive outputs via storage.saveFromUrl (streaming, no high RAM buffering)
  const successfulLanguages: string[] = [];

  for (const lang of run.targetLanguages) {
    const videoExport = exportItems.find(
      (e: any) => e.targetLanguage === lang && e.exportType === "video" && e.status === "completed"
    );
    const srtExport = exportItems.find(
      (e: any) => e.targetLanguage === lang && e.exportType === "srt" && e.status === "completed"
    );

    let videoStorageKey: string | undefined;
    let srtStorageKey: string | undefined;

    if (videoExport?.downloadUrl) {
      videoStorageKey = `outputs/${run.userId}/${project.id}/${lang}/video.mp4`;
      try {
        await storage.saveFromUrl(videoExport.downloadUrl, videoStorageKey, "video/mp4");
        successfulLanguages.push(lang);
      } catch (copyErr: any) {
        console.error(`Failed to archive video export for ${lang}:`, copyErr.message);
        if (isTransientNetworkError(copyErr)) {
          throw new TransientError(copyErr.message, 10);
        }
        videoStorageKey = undefined;
      }
    }

    if (srtExport?.downloadUrl) {
      srtStorageKey = `outputs/${run.userId}/${project.id}/${lang}/subtitles.srt`;
      try {
        await storage.saveFromUrl(srtExport.downloadUrl, srtStorageKey, "text/plain");
      } catch (srtErr: any) {
        console.error(`Failed to archive SRT export for ${lang}:`, srtErr.message);
        srtStorageKey = undefined;
      }
    }

    const isSuccess = !!videoStorageKey;
    const outStatus = isSuccess ? "completed" : "failed";

    const [existingOutput] = await db
      .select()
      .from(projectOutputs)
      .where(
        and(
          eq(projectOutputs.projectId, project.id),
          eq(projectOutputs.targetLanguage, lang)
        )
      )
      .limit(1);

    const outId = existingOutput?.id || `out_${nanoid(16)}`;

    await db
      .insert(projectOutputs)
      .values({
        id: outId,
        projectId: project.id,
        targetLanguage: lang,
        latestGenerationRunId: run.id,
        status: outStatus,
        videoR2Key: videoStorageKey || null,
        srtR2Key: srtStorageKey || null,
        errorMessage: isSuccess ? null : "Video export unavailable",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [projectOutputs.projectId, projectOutputs.targetLanguage],
        set: {
          latestGenerationRunId: run.id,
          status: outStatus,
          videoR2Key: videoStorageKey || null,
          srtR2Key: srtStorageKey || null,
          errorMessage: isSuccess ? null : "Video export unavailable",
          updatedAt: new Date(),
        },
      });
  }

  // 5. Final settlement
  const successfulCount = successfulLanguages.length;
  const pricing = calculateDubbingCost(
    project.serverVerifiedDurationSeconds || project.durationSeconds || 1,
    successfulCount,
    run.pricingSnapshot ? (run.pricingSnapshot as any).pricePerMinutePaise : undefined
  );

  const finalCostPaise = pricing.totalCostPaise;

  await settleGenerationRun({
    userId: run.userId,
    projectId: project.id,
    generationRunId: run.id,
    reservedCostPaise: run.reservedCostPaise,
    finalCostPaise,
  });

  const isFullSuccess = successfulCount === run.targetLanguages.length;
  const isPartial = successfulCount > 0 && !isFullSuccess;
  const finalStatus = isFullSuccess
    ? "completed"
    : isPartial
    ? "partial_failure"
    : "failed";

  await db
    .update(generationRuns)
    .set({
      status: finalStatus,
      finalCostPaise,
      progress: 100,
      currentStep: "done",
      currentStepLabel: isFullSuccess ? "All versions ready" : "Localization completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(generationRuns.id, run.id));

  await db
    .update(projects)
    .set({
      status: finalStatus,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, project.id));

  return {
    status: finalStatus,
    nextAction: "none",
    successfulCount,
    targetCount: run.targetLanguages.length,
  };
}

/**
 * Marks run and project as failed and safely releases any unspent reservation.
 */
export async function failGeneration(
  generationRunId: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  const [run] = await db
    .select()
    .from(generationRuns)
    .where(eq(generationRuns.id, generationRunId))
    .limit(1);

  if (!run) return;

  const isTerminal =
    run.status === "completed" ||
    run.status === "partial_failure" ||
    run.status === "failed" ||
    run.status === "cancelled";

  if (isTerminal) return;

  if (run.reservedCostPaise > 0) {
    await releaseFullReservation({
      userId: run.userId,
      projectId: run.projectId,
      generationRunId: run.id,
      reservedCostPaise: run.reservedCostPaise,
      reason: errorMessage,
    });
  }

  await db
    .update(generationRuns)
    .set({
      status: "failed",
      finalCostPaise: 0,
      errorCode,
      errorMessage,
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(generationRuns.id, run.id));

  await db
    .update(projects)
    .set({ status: "failed", updatedAt: new Date() })
    .where(eq(projects.id, run.projectId));
}
