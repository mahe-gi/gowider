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

export const GENERATION_QUEUE_NAME = "gowider-generation";
export const PAYMENT_QUEUE_NAME = "gowider-payments";
export const MAINTENANCE_QUEUE_NAME = "gowider-maintenance";

let genQueue: Queue<GenerationJobData, any, GenerationJobName> | null = null;
let payQueue: Queue<PaymentJobData, any, PaymentJobName> | null = null;
let maintQueue: Queue<MaintenanceJobData, any, MaintenanceJobName> | null = null;

export function getGenerationQueue(): Queue<GenerationJobData, any, GenerationJobName> {
  if (!genQueue) {
    genQueue = new Queue<GenerationJobData, any, GenerationJobName>(GENERATION_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return genQueue;
}

export function getPaymentQueue(): Queue<PaymentJobData, any, PaymentJobName> {
  if (!payQueue) {
    payQueue = new Queue<PaymentJobData, any, PaymentJobName>(PAYMENT_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return payQueue;
}

export function getMaintenanceQueue(): Queue<MaintenanceJobData, any, MaintenanceJobName> {
  if (!maintQueue) {
    maintQueue = new Queue<MaintenanceJobData, any, MaintenanceJobName>(MAINTENANCE_QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions,
    });
  }
  return maintQueue;
}
