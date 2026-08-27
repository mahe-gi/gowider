import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import {
  projects,
  generationRuns,
  projectOutputs,
  type GenerationRun,
  type Project,
} from "@/db/schema";
import { getR2ObjectStream } from "@/lib/r2/uploads";
import { copyUrlToR2 } from "@/lib/r2/outputs";
import {
  createDubbingJob,
  streamUploadToSarvam,
  startDubbingJob,
  getDubbingLiveStatus,
  getDubbingExportStatus,
} from "@/lib/sarvam/dubbing";
import { settleGenerationRun, releaseFullReservation } from "@/lib/wallet/settle";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";

export const generationWorkflow = inngest.createFunction(
  {
    id: "gowider-generation-workflow",
    concurrency: {
      limit: 3, // Conservative concurrency limit to protect Sarvam API rate limits
    },
    retries: 2,
  },
  { event: "generation.requested" },
  async ({ event, step }) => {
    const { generationRunId } = event.data;

    // Step 1: Load Generation Run & Project from PostgreSQL
    const { run, project } = await step.run("load-run-state", async () => {
      const [r] = await db
        .select()
        .from(generationRuns)
        .where(eq(generationRuns.id, generationRunId))
        .limit(1);

      if (!r) throw new Error(`Generation run not found: ${generationRunId}`);

      const [p] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, r.projectId))
        .limit(1);

      if (!p) throw new Error(`Project not found: ${r.projectId}`);

      return { run: r, project: p };
    });

    // Step 2: Create Sarvam Dubbing Job
    const sarvamJob = await step.run("create-sarvam-job", async () => {
      // Mark as uploading
      await db
        .update(generationRuns)
        .set({
          status: "uploading_to_sarvam",
          currentStep: "uploading",
          currentStepLabel: "Preparing video upload to Sarvam",
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, run.id));

      const sourceLang = project.sourceLanguage || "en-IN";
      const targetLangs = run.targetLanguages;

      const jobResponse = await createDubbingJob({
        sourceLanguage: sourceLang,
        targetLanguages: targetLangs,
      });

      // Persist Sarvam job ID immediately
      await db
        .update(generationRuns)
        .set({
          sarvamJobId: jobResponse.job_id,
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, run.id));

      return {
        jobId: jobResponse.job_id,
        uploadUrl: jobResponse.upload_url,
      };
    });

    // Step 3: Stream Video from R2 to Sarvam Signed Upload URL
    await step.run("stream-r2-to-sarvam", async () => {
      const { stream, contentLength, contentType } = await getR2ObjectStream(project.sourceR2Key);

      if (!stream || !contentLength) {
        throw new Error(`Failed to retrieve stream from R2 object: ${project.sourceR2Key}`);
      }

      await streamUploadToSarvam({
        uploadUrl: sarvamJob.uploadUrl,
        stream,
        contentLength,
        contentType: contentType || project.sourceMimeType || "video/mp4",
      });
    });

    // Step 4: Start Sarvam Job
    await step.run("start-sarvam-job", async () => {
      await startDubbingJob(sarvamJob.jobId);

      await db
        .update(generationRuns)
        .set({
          status: "processing",
          currentStep: "dubbing",
          currentStepLabel: "Localizing your Reel with Sarvam AI",
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, run.id));

      await db
        .update(projects)
        .set({
          status: "processing",
          updatedAt: new Date(),
        })
        .where(eq(projects.id, project.id));
    });

    // Step 5: Poll Sarvam Live Status (with 15s intervals)
    const liveStatusResult = await step.run("poll-sarvam-live-status", async () => {
      let isTerminal = false;
      let lastStatus: any = null;
      const maxAttempts = 60; // Max ~15 minutes wait

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const statusRes = await getDubbingLiveStatus(sarvamJob.jobId);
        lastStatus = statusRes;

        // Update progress checkpoint in PostgreSQL
        await db
          .update(generationRuns)
          .set({
            progress: statusRes.progress ?? 0,
            currentStep: statusRes.current_step,
            currentStepLabel: statusRes.current_step_label || "Localizing voices and emotion",
            updatedAt: new Date(),
          })
          .where(eq(generationRuns.id, run.id));

        if (
          statusRes.status === "completed" ||
          statusRes.status === "partial_failure" ||
          statusRes.status === "failed" ||
          statusRes.status === "deleted"
        ) {
          isTerminal = true;
          break;
        }

        // Wait 15 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }

      if (!isTerminal) {
        throw new Error(`Sarvam dubbing timed out after maximum polling attempts for job: ${sarvamJob.jobId}`);
      }

      return lastStatus;
    });

    // If dubbing failed completely at stage 1
    if (liveStatusResult.status === "failed" || liveStatusResult.status === "deleted") {
      await step.run("handle-total-dubbing-failure", async () => {
        await releaseFullReservation({
          userId: run.userId,
          projectId: project.id,
          generationRunId: run.id,
          reservedCostPaise: run.reservedCostPaise,
          reason: liveStatusResult.error_message || "Sarvam job failed in pipeline",
        });

        await db
          .update(generationRuns)
          .set({
            status: "failed",
            finalCostPaise: 0,
            errorCode: liveStatusResult.error_code || "SARVAM_JOB_FAILED",
            errorMessage: liveStatusResult.error_message || "Dubbing job failed",
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(generationRuns.id, run.id));

        await db
          .update(projects)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(projects.id, project.id));
      });

      return { success: false, status: "failed" };
    }

    // Step 6: Poll Sarvam Export Status (`limit=100`)
    const exportResult = await step.run("poll-sarvam-export-status", async () => {
      await db
        .update(generationRuns)
        .set({
          status: "exporting",
          currentStep: "exporting",
          currentStepLabel: "Preparing your video and subtitle downloads",
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, run.id));

      let allExportsTerminal = false;
      let exportItems: any[] = [];
      const maxExportAttempts = 30; // Max ~5 minutes

      for (let attempt = 0; attempt < maxExportAttempts; attempt++) {
        const exportRes = await getDubbingExportStatus(sarvamJob.jobId);
        exportItems = exportRes.data?.exports || [];

        // Check if all requested target languages have a video export status that is terminal
        const videoExports = exportItems.filter((e) => e.export_type === "video");
        const pendingVideos = videoExports.filter(
          (e) => e.status !== "completed" && e.status !== "failed"
        );

        if (videoExports.length >= run.targetLanguages.length && pendingVideos.length === 0) {
          allExportsTerminal = true;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      return exportItems;
    });

    // Step 7: Archive Output Files to Private R2 & Update Project Outputs
    const successfulOutputs = await step.run("archive-outputs-to-r2", async () => {
      const successfulLanguages: string[] = [];

      for (const lang of run.targetLanguages) {
        const videoExport = exportResult.find(
          (e) => e.target_language === lang && e.export_type === "video" && e.status === "completed"
        );
        const srtExport = exportResult.find(
          (e) => e.target_language === lang && e.export_type === "srt" && e.status === "completed"
        );

        let videoR2Key: string | undefined;
        let srtR2Key: string | undefined;

        if (videoExport?.download_url) {
          videoR2Key = `outputs/${run.userId}/${project.id}/${lang}/video.mp4`;
          try {
            await copyUrlToR2(videoExport.download_url, videoR2Key, "video/mp4");
            successfulLanguages.push(lang);
          } catch (copyErr) {
            console.error(`Failed to archive video export for ${lang}:`, copyErr);
            videoR2Key = undefined;
          }
        }

        if (srtExport?.download_url) {
          srtR2Key = `outputs/${run.userId}/${project.id}/${lang}/subtitles.srt`;
          try {
            await copyUrlToR2(srtExport.download_url, srtR2Key, "text/plain");
          } catch (srtErr) {
            console.error(`Failed to archive SRT export for ${lang}:`, srtErr);
            srtR2Key = undefined;
          }
        }

        const isSuccess = !!videoR2Key;
        const outStatus = isSuccess ? "completed" : "failed";

        // Insert or update normalized project_outputs
        const [existingOutput] = await db
          .select()
          .from(projectOutputs)
          .where(eq(projectOutputs.projectId, project.id))
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
            videoR2Key: videoR2Key || null,
            srtR2Key: srtR2Key || null,
            errorMessage: isSuccess ? null : "Video export unavailable",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: [projectOutputs.projectId, projectOutputs.targetLanguage],
            set: {
              latestGenerationRunId: run.id,
              status: outStatus,
              videoR2Key: videoR2Key || null,
              srtR2Key: srtR2Key || null,
              errorMessage: isSuccess ? null : "Video export unavailable",
              updatedAt: new Date(),
            },
          });
      }

      return successfulLanguages;
    });

    // Step 8: Settle Wallet & Finalize Generation Run
    await step.run("settle-wallet-and-finalize", async () => {
      const successfulCount = successfulOutputs.length;
      const pricing = calculateDubbingCost(
        project.durationSeconds || 1,
        successfulCount,
        run.pricingSnapshot ? (run.pricingSnapshot as any).pricePerMinutePaise : undefined
      );

      const finalCostPaise = pricing.totalCostPaise;

      // Settle wallet: charge only successful video exports
      await settleGenerationRun({
        userId: run.userId,
        projectId: project.id,
        generationRunId: run.id,
        reservedCostPaise: run.reservedCostPaise,
        finalCostPaise,
      });

      const isFullSuccess = successfulCount === run.targetLanguages.length;
      const isPartial = successfulCount > 0 && !isFullSuccess;
      const isCompleteFail = successfulCount === 0;

      const finalRunStatus = isFullSuccess
        ? "completed"
        : isPartial
        ? "partial_failure"
        : "failed";

      const finalProjectStatus = isFullSuccess
        ? "completed"
        : isPartial
        ? "partial_failure"
        : "failed";

      await db
        .update(generationRuns)
        .set({
          status: finalRunStatus,
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
          status: finalProjectStatus,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, project.id));
    });

    return {
      success: true,
      successfulCount: successfulOutputs.length,
      targetCount: run.targetLanguages.length,
    };
  }
);
