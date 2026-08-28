import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { Queue } from "bullmq";
import { getRedisConnection, closeRedisConnection } from "@/lib/queue/connection";
import { getGenerationQueueName, getPaymentQueueName } from "@/lib/queue/queues";
import { db } from "@/lib/db";
import { generationRuns, paymentOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = process.argv.slice(2);
  const isApply = args.includes("--apply");
  const isDryRun = args.includes("--dry-run") || !isApply;

  const genQueueName = getGenerationQueueName();
  const payQueueName = getPaymentQueueName();

  console.log("==================================================");
  console.log(`🧹 GOWIDER BULLMQ ORPHAN JOB INSPECTION [Mode: ${isApply ? "APPLY" : "DRY-RUN"}]`);
  console.log("==================================================");

  const connection = getRedisConnection();
  const genQueue = new Queue(genQueueName, { connection });
  const payQueue = new Queue(payQueueName, { connection });

  // 1. Inspect Generation Queue Jobs
  const genJobStates = ["waiting", "active", "delayed", "failed"] as const;
  const genJobs = await genQueue.getJobs([...genJobStates]);

  console.log(`\nFound ${genJobs.length} non-completed job(s) in ${genQueueName}:`);

  const orphanGenJobs: any[] = [];

  for (const job of genJobs) {
    const runId = job.data?.generationRunId;
    const state = await job.getState();

    let dbExists = false;
    let runStatus: string | null = null;

    if (runId) {
      const [dbRun] = await db
        .select({ id: generationRuns.id, status: generationRuns.status })
        .from(generationRuns)
        .where(eq(generationRuns.id, runId))
        .limit(1);

      if (dbRun) {
        dbExists = true;
        runStatus = dbRun.status;
      }
    }

    const isOrphan = !dbExists;
    if (isOrphan) {
      orphanGenJobs.push({ job, runId, state, dbExists, runStatus });
    }

    console.log({
      jobId: job.id,
      jobName: job.name,
      generationRunId: runId || "N/A",
      bullmqState: state,
      dbExists,
      dbRunStatus: runStatus || "N/A",
      isOrphan,
    });
  }

  console.log(`\nSummary: ${orphanGenJobs.length} orphan generation job(s) identified.`);

  // 2. Apply removal if requested
  if (isApply && orphanGenJobs.length > 0) {
    console.log(`\n🧹 Removing ${orphanGenJobs.length} orphan job(s) from ${genQueueName}...`);
    for (const { job } of orphanGenJobs) {
      await job.remove();
      console.log(`  ✓ Removed job ${job.id}`);
    }
    console.log("✅ Cleanup applied successfully!");
  } else if (!isApply && orphanGenJobs.length > 0) {
    console.log("\n⚠️ Dry-run completed. Run with --apply to clean up orphan jobs.");
  } else {
    console.log("\n✅ No orphan jobs found.");
  }

  await genQueue.close();
  await payQueue.close();
  await closeRedisConnection();
  process.exit(0);
}

main().catch((err) => {
  console.error("Orphan job inspection failed:", err);
  process.exit(1);
});
