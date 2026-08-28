import "server-only";
import { Queue } from "bullmq";
import { getRedisConnection } from "./connection";
import type { GenerationJobName, GenerationJobData, PaymentJobName, PaymentJobData, MaintenanceJobName, MaintenanceJobData } from "./types";

const defaultJobOptions = {
  removeOnComplete: {
    age: 3600 * 24, // Keep completed job history for 24h
    count: 1000,
  },
  removeOnFail: {
    age: 3600 * 24 * 7, // Keep failed jobs for 7 days
  },
};

export function getQueuePrefix(): string {
  return process.env.BULLMQ_QUEUE_PREFIX || "gowider";
}

export function getGenerationQueueName(): string {
  return `${getQueuePrefix()}-generation`;
}

export function getPaymentQueueName(): string {
  return `${getQueuePrefix()}-payments`;
}

export function getMaintenanceQueueName(): string {
  return `${getQueuePrefix()}-maintenance`;
}

export const GENERATION_QUEUE_NAME = "gowider-generation";
export const PAYMENT_QUEUE_NAME = "gowider-payments";
export const MAINTENANCE_QUEUE_NAME = "gowider-maintenance";

let genQueue: Queue<GenerationJobData, any, GenerationJobName> | null = null;
let payQueue: Queue<PaymentJobData, any, PaymentJobName> | null = null;
let maintQueue: Queue<MaintenanceJobData, any, MaintenanceJobName> | null = null;

export function getGenerationQueue(): Queue<GenerationJobData, any, GenerationJobName> {
  const queueName = getGenerationQueueName();
  if (!genQueue || genQueue.name !== queueName) {
    if (genQueue) genQueue.close().catch(() => {});
    genQueue = new Queue<GenerationJobData, any, GenerationJobName>(queueName, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return genQueue;
}

export function getPaymentQueue(): Queue<PaymentJobData, any, PaymentJobName> {
  const queueName = getPaymentQueueName();
  if (!payQueue || payQueue.name !== queueName) {
    if (payQueue) payQueue.close().catch(() => {});
    payQueue = new Queue<PaymentJobData, any, PaymentJobName>(queueName, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return payQueue;
}

export function getMaintenanceQueue(): Queue<MaintenanceJobData, any, MaintenanceJobName> {
  const queueName = getMaintenanceQueueName();
  if (!maintQueue || maintQueue.name !== queueName) {
    if (maintQueue) maintQueue.close().catch(() => {});
    maintQueue = new Queue<MaintenanceJobData, any, MaintenanceJobName>(queueName, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return maintQueue;
}

export async function closeAllQueues(): Promise<void> {
  const closes: Promise<void>[] = [];
  if (genQueue) {
    closes.push(genQueue.close());
    genQueue = null;
  }
  if (payQueue) {
    closes.push(payQueue.close());
    payQueue = null;
  }
  if (maintQueue) {
    closes.push(maintQueue.close());
    maintQueue = null;
  }
  await Promise.all(closes);
}
