export type GenerationJobName =
  | "generation:start"
  | "generation:poll-live"
  | "generation:poll-export"
  | "generation:finalize";

export interface GenerationJobData {
  generationRunId: string;
  pollAttempt?: number;
}

export type PaymentJobName = "payment:process-webhook" | "payment:finalize-order";

export interface PaymentJobData {
  paymentOrderId?: string;
  webhookEventId?: string;
  providerPaymentId?: string;
}

export type MaintenanceJobName = "maintenance:tick";

export interface MaintenanceJobData {
  triggeredAt?: string;
}
