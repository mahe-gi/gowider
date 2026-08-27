import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 1. Enums
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "uploading",
  "ready",
  "processing",
  "completed",
  "partial_failure",
  "failed",
  "expired",
]);

export const runStatusEnum = pgEnum("run_status", [
  "awaiting_payment",
  "queued",
  "uploading_to_sarvam",
  "processing",
  "exporting",
  "completed",
  "partial_failure",
  "failed",
  "cancelled",
]);

export const dispatchStateEnum = pgEnum("dispatch_state", [
  "pending",
  "dispatched",
  "failed",
]);

export const outputStatusEnum = pgEnum("output_status", [
  "pending",
  "processing",
  "exporting",
  "completed",
  "failed",
  "expired",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "creating",
  "created",
  "pending",
  "authorized",
  "paid",
  "captured",
  "failed",
  "expired",
]);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "purchase",
  "reservation",
  "usage",
  "release",
  "refund",
  "manual_adjustment",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
  "reversed",
]);

export const webhookStatusEnum = pgEnum("webhook_status", [
  "received",
  "dispatch_pending",
  "dispatched",
  "processed",
  "failed",
]);

// 2. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // usr_...
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  authProvider: text("auth_provider").notNull().default("google"),
  authProviderId: text("auth_provider_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Guest Sessions Table
export const guestSessions = pgTable("guest_sessions", {
  id: text("id").primaryKey(), // gst_...
  tokenHash: text("token_hash").notNull().unique(),
  claimedByUserId: text("claimed_by_user_id").references(() => users.id, { onDelete: "set null" }),
  claimedAt: timestamp("claimed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Projects Table
export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // proj_...
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  guestSessionId: text("guest_session_id").references(() => guestSessions.id, { onDelete: "set null" }),
  displayName: text("display_name"),
  sourceR2Key: text("source_r2_key").notNull(),
  sourceFileName: text("source_file_name"),
  sourceMimeType: text("source_mime_type"),
  sourceFileSizeBytes: integer("source_file_size_bytes"),
  durationSeconds: integer("duration_seconds"),
  serverVerifiedDurationSeconds: integer("server_verified_duration_seconds"),
  sourceLanguage: text("source_language"),
  targetLanguages: jsonb("target_languages").$type<string[]>(),
  voiceRightsConfirmedAt: timestamp("voice_rights_confirmed_at", { withTimezone: true }),
  voiceConsentVersion: text("voice_consent_version"),
  status: projectStatusEnum("status").default("draft").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Generation Runs Table
export const generationRuns = pgTable("generation_runs", {
  id: text("id").primaryKey(), // run_...
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetLanguages: jsonb("target_languages").$type<string[]>().notNull(),
  projectConfigSnapshot: jsonb("project_config_snapshot").notNull(),
  pricingSnapshot: jsonb("pricing_snapshot").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  sarvamJobId: text("sarvam_job_id"),
  status: runStatusEnum("status").default("awaiting_payment").notNull(),
  dispatchState: dispatchStateEnum("dispatch_state").default("pending").notNull(),
  dispatchError: text("dispatch_error"),
  progress: integer("progress").default(0),
  currentStep: text("current_step"),
  currentStepLabel: text("current_step_label"),
  estimatedCostPaise: integer("estimated_cost_paise").notNull(),
  reservedCostPaise: integer("reserved_cost_paise").default(0).notNull(),
  finalCostPaise: integer("final_cost_paise"),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  settledAt: timestamp("settled_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 6. Project Outputs Table (Normalized per-language output records)
export const projectOutputs = pgTable(
  "project_outputs",
  {
    id: text("id").primaryKey(), // out_...
    projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    targetLanguage: text("target_language").notNull(),
    latestGenerationRunId: text("latest_generation_run_id").references(() => generationRuns.id, { onDelete: "set null" }),
    status: outputStatusEnum("status").default("pending").notNull(),
    videoR2Key: text("video_r2_key"),
    srtR2Key: text("srt_r2_key"),
    videoFileSizeBytes: integer("video_file_size_bytes"),
    srtFileSizeBytes: integer("srt_file_size_bytes"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("project_outputs_proj_lang_idx").on(table.projectId, table.targetLanguage),
    index("project_outputs_project_id_idx").on(table.projectId),
  ]
);

// 7. Wallets Table
export const wallets = pgTable(
  "wallets",
  {
    id: text("id").primaryKey(), // wal_...
    userId: text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
    balancePaise: integer("balance_paise").default(0).notNull(),
    reservedPaise: integer("reserved_paise").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("balance_paise_non_negative", sql`${table.balancePaise} >= 0`),
    check("reserved_paise_non_negative", sql`${table.reservedPaise} >= 0`),
    check("reserved_lte_balance", sql`${table.reservedPaise} <= ${table.balancePaise}`),
  ]
);

// 8. Payment Orders Table
export const paymentOrders = pgTable("payment_orders", {
  id: text("id").primaryKey(), // pay_...
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  generationRunId: text("generation_run_id").references(() => generationRuns.id, { onDelete: "set null" }),
  provider: text("provider").default("razorpay").notNull(),
  providerOrderId: text("provider_order_id"),
  providerPaymentId: text("provider_payment_id").unique(),
  amountPaise: integer("amount_paise").notNull(),
  currency: text("currency").default("INR").notNull(),
  status: paymentStatusEnum("status").default("creating").notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 9. Wallet Transactions Table (Immutable Financial Ledger)
export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: text("id").primaryKey(), // txn_...
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    paymentOrderId: text("payment_order_id").references(() => paymentOrders.id, { onDelete: "set null" }),
    generationRunId: text("generation_run_id").references(() => generationRuns.id, { onDelete: "set null" }),
    type: transactionTypeEnum("type").notNull(),
    amountPaise: integer("amount_paise").notNull(),
    status: transactionStatusEnum("status").default("completed").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("wallet_txns_user_id_idx").on(table.userId),
    index("wallet_txns_generation_run_id_idx").on(table.generationRunId),
    index("wallet_txns_payment_order_id_idx").on(table.paymentOrderId),
  ]
);

// 10. Payment Webhook Events Table (Deduplication and Retries)
export const paymentWebhookEvents = pgTable(
  "payment_webhook_events",
  {
    id: text("id").primaryKey(), // wevt_...
    provider: text("provider").default("razorpay").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    status: webhookStatusEnum("status").default("received").notNull(),
    dispatchAttempts: integer("dispatch_attempts").default(0).notNull(),
    lastError: text("last_error"),
    payload: jsonb("payload"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("provider_event_idx").on(table.provider, table.providerEventId),
  ]
);

// 11. Rate Limits Table (PostgreSQL-backed for serverless environments)
export const rateLimits = pgTable("rate_limits", {
  id: text("id").primaryKey(), // rate_...
  key: text("key").notNull().unique(),
  points: integer("points").default(1).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// TypeScript Types
export type User = typeof users.$inferSelect;
export type GuestSession = typeof guestSessions.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type GenerationRun = typeof generationRuns.$inferSelect;
export type ProjectOutput = typeof projectOutputs.$inferSelect;
export type Wallet = typeof wallets.$inferSelect;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type PaymentWebhookEvent = typeof paymentWebhookEvents.$inferSelect;
export type RateLimit = typeof rateLimits.$inferSelect;
