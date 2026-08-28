import { Worker, type Job } from "bullmq";
import { getRedisConnection } from "@/lib/queue/connection";
import { getGenerationQueueName } from "@/lib/queue/queues";
import { dispatchGenerationJob } from "@/lib/queue/dispatch";
import type { GenerationJobName, GenerationJobData } from "@/lib/queue/types";
import {
  processGenerationStart,
  processGenerationLiveCheck,
  processGenerationExportCheck,
  failGeneration,
} from "@/lib/generation/process-generation";
import { env } from "@/lib/env";

export function createGenerationWorker(): Worker<GenerationJobData, any, GenerationJobName> {
  const concurrency = Number(env.GENERATION_WORKER_CONCURRENCY) || 3;

  const worker = new Worker<GenerationJobData, any, GenerationJobName>(
    getGenerationQueueName(),
    async (job: Job<GenerationJobData, any, GenerationJobName>) => {
      const { generationRunId, pollAttempt = 1 } = job.data;
      const jobName = job.name as GenerationJobName;

      console.log(`⚙️ [Worker] Processing ${jobName} for run ${generationRunId} (attempt: ${pollAttempt})`);

      try {
        switch (jobName) {
          case "generation:start": {
            const result = await processGenerationStart(generationRunId);
            if (result.nextAction === "poll_live") {
              await dispatchGenerationJob(
                generationRunId,
                "generation:poll-live",
                result.pollDelayMs || 15000,
                1
              );
            }
            return result;
          }

          case "generation:poll-live": {
            const result = await processGenerationLiveCheck(generationRunId, pollAttempt);
            if (result.nextAction === "poll_live") {
              await dispatchGenerationJob(
                generationRunId,
                "generation:poll-live",
                result.pollDelayMs || 15000,
                pollAttempt + 1
              );
            } else if (result.nextAction === "poll_export") {
              await dispatchGenerationJob(
                generationRunId,
                "generation:poll-export",
                result.pollDelayMs || 5000,
                1
              );
            }
            return result;
          }

          case "generation:poll-export": {
            const result = await processGenerationExportCheck(generationRunId, pollAttempt);
            if (result.nextAction === "poll_export") {
              await dispatchGenerationJob(
                generationRunId,
                "generation:poll-export",
                result.pollDelayMs || 10000,
                pollAttempt + 1
              );
            }
            return result;
          }

          default:
            console.warn(`Unknown generation job name: ${jobName}`);
            return { status: "unknown_job" };
        }
      } catch (err: any) {
        // Safe handling for orphan jobs (missing DB run, deleted project, already terminal)
        if (err.isOrphan) {
          console.warn(`[Worker] Skipping orphan generation job:`, {
            jobId: job.id,
            generationRunId,
            jobName,
            reason: err.reason || "generation_run_missing",
          });
          return { status: "skipped_orphan", reason: err.reason };
        }

        console.error(`💥 [Worker Error] Failed execution for ${jobName} on run ${generationRunId}:`, err.message);

        // If error is transient, rethrow so BullMQ handles backoff retry
        if (err.isTransient) {
          throw err;
        }

        // On permanent failure, guarantee wallet release
        await failGeneration(generationRunId, "WORKER_EXECUTION_FAILED", err.message);
        throw err;
      }
    },
    {
      connection: getRedisConnection(),
      concurrency,
    }
  );

  worker.on("completed", (job) => {
    console.log(`✅ [Worker] Completed job ${job.name} for run ${job.data.generationRunId}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`❌ [Worker] Failed job ${job?.name} for run ${job?.data?.generationRunId}:`, err.message);
  });

  return worker;
}
