import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { fork } from "child_process";
import path from "path";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { users, wallets, projects, generationRuns } from "@/db/schema";
import { eq } from "drizzle-orm";

async function runMultiProcessWorkerTest() {
  console.log("==================================================");
  console.log("🚀 STARTING TWO-WORKER MULTI-PROCESS CLAIM PROOF");
  console.log("==================================================");

  const testUserId = `usr_mp_worker_${nanoid(8)}`;
  const projectId = `proj_mp_worker_${nanoid(8)}`;
  const runId = `run_mp_worker_${nanoid(8)}`;

  await db.insert(users).values({
    id: testUserId,
    email: `${testUserId}@example.com`,
    displayName: "Multi-Process Worker Test User",
    authProvider: "google",
  });

  await db.insert(projects).values({
    id: projectId,
    userId: testUserId,
    displayName: "Multi-Process Worker Reel.mp4",
    sourceR2Key: `sources/${testUserId}/${projectId}/video.mp4`,
    status: "processing",
  });

  await db.insert(generationRuns).values({
    id: runId,
    projectId,
    userId: testUserId,
    targetLanguages: ["hi-IN"],
    projectConfigSnapshot: { sourceLanguage: "en-IN", targetLanguages: ["hi-IN"] },
    pricingSnapshot: { totalCostPaise: 2934 },
    idempotencyKey: `idem_mp_worker_${runId}`,
    status: "queued",
    dispatchState: "dispatched",
    estimatedCostPaise: 2934,
    reservedCostPaise: 2934,
  });

  console.log(`[Parent] Seeded Run ${runId} with status = 'queued', sarvamJobId = NULL.`);

  const childWorkerPath = path.resolve("./tests/integration/child-generation-worker.ts");

  // Spawn 2 independent Worker processes
  const w1 = fork(childWorkerPath, [], {
    execArgv: ["--import=tsx"],
    env: { ...process.env },
  });

  const w2 = fork(childWorkerPath, [], {
    execArgv: ["--import=tsx"],
    env: { ...process.env },
  });

  console.log(`[Parent] Spawned Worker 1 (PID: ${w1.pid}) and Worker 2 (PID: ${w2.pid}).`);

  const w1Promise = new Promise((resolve) => w1.once("message", resolve));
  const w2Promise = new Promise((resolve) => w2.once("message", resolve));

  w1.send({ runId });
  w2.send({ runId });

  const [res1, res2]: any = await Promise.all([w1Promise, w2Promise]);

  console.log("[Parent] Worker 1 Result:", res1);
  console.log("[Parent] Worker 2 Result:", res2);

  w1.kill();
  w2.kill();

  const [finalRun] = await db.select().from(generationRuns).where(eq(generationRuns.id, runId)).limit(1);
  console.log(`[Parent] Final Run Status in DB: ${finalRun.status}, sarvamJobId: ${finalRun.sarvamJobId}`);

  // Exactly one worker must have claimed and started the provider job
  const claims = [res1.claimed, res2.claimed].filter(Boolean);
  if (claims.length !== 1) {
    throw new Error(`FAIL: Expected exactly 1 worker to claim provider start, got ${claims.length}`);
  }

  console.log("✅ TWO-WORKER MULTI-PROCESS CLAIM PROOF PASSED!");

  // Cleanup
  await db.delete(generationRuns).where(eq(generationRuns.id, runId));
  await db.delete(projects).where(eq(projects.id, projectId));
  await db.delete(users).where(eq(users.id, testUserId));
}

runMultiProcessWorkerTest().catch((err) => {
  console.error("Multi-process worker test failed:", err);
  process.exit(1);
});
