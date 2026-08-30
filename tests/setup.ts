import { config } from "dotenv";
config({ path: ".env.local" });

// Set isolated BullMQ test queue namespace
process.env.BULLMQ_QUEUE_PREFIX = `gowider-test-${process.pid}`;

import { afterAll } from "vitest";
import { getGenerationQueue, getPaymentQueue, getMaintenanceQueue, closeAllQueues } from "@/lib/queue/queues";
import { closeRedisConnection } from "@/lib/queue/connection";

afterAll(async () => {
  try {
    const timeout = new Promise((resolve) => setTimeout(resolve, 500));
    const cleanup = async () => {
      const genQueue = getGenerationQueue();
      const payQueue = getPaymentQueue();
      const maintQueue = getMaintenanceQueue();

      await genQueue.obliterate({ force: true }).catch(() => {});
      await payQueue.obliterate({ force: true }).catch(() => {});
      await maintQueue.obliterate({ force: true }).catch(() => {});

      await closeAllQueues();
      await closeRedisConnection();
    };

    await Promise.race([cleanup(), timeout]);
  } catch {}
});
