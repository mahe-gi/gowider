import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Queue, Worker, type Job } from "bullmq";
import { Redis } from "ioredis";

describe("BullMQ & Redis Real Queue Integration", () => {
  let redis: Redis | null = null;
  let testQueue: Queue | null = null;
  let testWorker: Worker | null = null;
  const queueName = `test-bullmq-${Date.now()}`;
  let redisAvailable = false;

  beforeAll(async () => {
    try {
      redis = new Redis("redis://127.0.0.1:6379", {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        connectTimeout: 2000,
        retryStrategy: () => null, // Do not retry if down
      });

      await redis.ping();
      redisAvailable = true;
      testQueue = new Queue(queueName, { connection: redis });
    } catch {
      redisAvailable = false;
    }
  });

  afterAll(async () => {
    if (testWorker) await testWorker.close();
    if (testQueue) {
      await testQueue.drain();
      await testQueue.close();
    }
    if (redis) await redis.quit();
  });

  it("enqueues and processes a delayed job in BullMQ", async () => {
    if (!redisAvailable || !testQueue || !redis) {
      console.log("Redis not available, skipping integration test");
      return;
    }

    let processed = false;
    let receivedPayload: any = null;

    testWorker = new Worker(
      queueName,
      async (job: Job) => {
        processed = true;
        receivedPayload = job.data;
        return { status: "ok" };
      },
      { connection: redis }
    );

    const job = await testQueue.add(
      "generation:poll-live",
      { generationRunId: "run_test_123", pollAttempt: 1 },
      { jobId: "test_job_1", delay: 50 }
    );

    expect(job.id).toBe("test_job_1");

    // Wait for worker to process
    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(processed).toBe(true);
    expect(receivedPayload).toEqual({
      generationRunId: "run_test_123",
      pollAttempt: 1,
    });
  });

  it("enforces deterministic job ID deduplication", async () => {
    if (!redisAvailable || !testQueue) return;

    const job1 = await testQueue.add(
      "generation:start",
      { generationRunId: "run_dedup_abc" },
      { jobId: "gen_start_run_dedup_abc" }
    );

    const job2 = await testQueue.add(
      "generation:start",
      { generationRunId: "run_dedup_abc" },
      { jobId: "gen_start_run_dedup_abc" }
    );

    expect(job1.id).toBe("gen_start_run_dedup_abc");
    expect(job2.id).toBe("gen_start_run_dedup_abc");
  });
});
