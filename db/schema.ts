import { pgTable, text, timestamp, integer, jsonb, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

// ----------------------------------------------------
// ENUMS
// ----------------------------------------------------
export const projectStatusEnum = pgEnum("project_status", [
  "draft",
  "ready",
  "processing",
  "completed",
  "partial_failure",
  "failed",
]);

export const generationRunStatusEnum = pgEnum("generation_run_status", [
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

export const projectOutputStatusEnum = pgEnum("project_output_status", [
  "pending",
  "processing",
  "exporting",
  "completed",
  "failed",
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
  "cancelled",
]);

export const paymentOrderStatusEnum = pgEnum("payment_order_status", [
  "creating",
  "created",
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
]);

// ----------------------------------------------------
// 1. USERS TABLE
// ----------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey(), // user_xxx
  authProvider: text("auth_provider").notNull().default("google"),
  authProviderId: text("auth_provider_id").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("users_auth_idx").on(t.authProvider, t.authProviderId),
  uniqueIndex("users_email_idx").on(t.email),
]);

// ----------------------------------------------------
// 2. GUEST SESSIONS TABLE
// ----------------------------------------------------
export const guestSessions = pgTable("guest_sessions", {
  id: text("id").primaryKey(), // guest_xxx
  tokenHash: text("token_hash").unique().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 3. PROJECTS TABLE
// ----------------------------------------------------
export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // proj_xxx
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestSessionId: text("guest_session_id").references(() => guestSessions.id, { onDelete: "set null" }),
  
  displayName: text("display_name"),
  sourceR2Key: text("source_r2_key").notNull(),
  sourceFileName: text("source_file_name"),
  sourceMimeType: text("source_mime_type").notNull(),
  sourceFileSizeBytes: integer("source_file_size_bytes").notNull(),
  
  durationSeconds: integer("duration_seconds"),
  
  sourceLanguage: text("source_language"),
  targetLanguages: jsonb("target_languages").$type<string[]>().notNull().default([]),
  
  status: projectStatusEnum("status").notNull().default("draft"),
  
  voiceRightsConfirmedAt: timestamp("voice_rights_confirmed_at", { withTimezone: true }),
  voiceConsentVersion: text("voice_consent_version"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 4. GENERATION RUNS TABLE
// ----------------------------------------------------
export const generationRuns = pgTable("generation_runs", {
  id: text("id").primaryKey(), // run_xxx
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  targetLanguages: jsonb("target_languages").$type<string[]>().notNull(),
  
  projectConfigSnapshot: jsonb("project_config_snapshot").notNull(),
  pricingSnapshot: jsonb("pricing_snapshot").notNull(),
  
  idempotencyKey: text("idempotency_key").unique().notNull(),
  sarvamJobId: text("sarvam_job_id"),
  
  status: generationRunStatusEnum("status").notNull().default("queued"),
  progress: integer("progress").default(0),
  currentStep: text("current_step"),
  currentStepLabel: text("current_step_label"),
  
  estimatedCostPaise: integer("estimated_cost_paise").notNull(),
  reservedCostPaise: integer("reserved_cost_paise").notNull().default(0),
  finalCostPaise: integer("final_cost_paise"),
  
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 5. NORMALIZED PROJECT OUTPUTS TABLE
// ----------------------------------------------------
export const projectOutputs = pgTable("project_outputs", {
  id: text("id").primaryKey(), // out_xxx
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  targetLanguage: text("target_language").notNull(),
  
  latestGenerationRunId: text("latest_generation_run_id").references(() => generationRuns.id, { onDelete: "cascade" }).notNull(),
  
  status: projectOutputStatusEnum("status").notNull().default("pending"),
  videoR2Key: text("video_r2_key"),
  srtR2Key: text("srt_r2_key"),
  
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("project_lang_idx").on(t.projectId, t.targetLanguage),
]);

// ----------------------------------------------------
// 6. WALLETS TABLE
// ----------------------------------------------------
export const wallets = pgTable("wallets", {
  id: text("id").primaryKey(), // wal_xxx
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  balancePaise: integer("balance_paise").notNull().default(0),
  reservedPaise: integer("reserved_paise").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 7. PAYMENT ORDERS TABLE
// ----------------------------------------------------
export const paymentOrders = pgTable("payment_orders", {
  id: text("id").primaryKey(), // pay_xxx
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  generationRunId: text("generation_run_id").references(() => generationRuns.id, { onDelete: "set null" }),
  
  provider: text("provider").notNull().default("razorpay"),
  providerOrderId: text("provider_order_id").unique(),
  providerPaymentId: text("provider_payment_id").unique(),
  
  amountPaise: integer("amount_paise").notNull(),
  currency: text("currency").notNull().default("INR"),
  
  status: paymentOrderStatusEnum("status").notNull().default("created"),
  idempotencyKey: text("idempotency_key").unique().notNull(),
  
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 8. WALLET TRANSACTIONS LEDGER TABLE
// ----------------------------------------------------
export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey(), // txn_xxx
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amountPaise: integer("amount_paise").notNull(),
  projectId: text("project_id"),
  generationRunId: text("generation_run_id"),
  paymentOrderId: text("payment_order_id").references(() => paymentOrders.id, { onDelete: "set null" }),
  status: transactionStatusEnum("status").notNull().default("completed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 9. PAYMENT WEBHOOK EVENTS TABLE
// ----------------------------------------------------
export const paymentWebhookEvents = pgTable("payment_webhook_events", {
  id: text("id").primaryKey(), // wevt_xxx
  provider: text("provider").notNull().default("razorpay"),
  providerEventId: text("provider_event_id").notNull(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("webhook_provider_event_idx").on(t.provider, t.providerEventId),
]);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type GuestSession = typeof guestSessions.$inferSelect;
export type NewGuestSession = typeof guestSessions.$inferInsert;

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type GenerationRun = typeof generationRuns.$inferSelect;
export type NewGenerationRun = typeof generationRuns.$inferInsert;

export type ProjectOutput = typeof projectOutputs.$inferSelect;
export type NewProjectOutput = typeof projectOutputs.$inferInsert;

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;

export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type NewPaymentOrder = typeof paymentOrders.$inferInsert;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;

export type PaymentWebhookEvent = typeof paymentWebhookEvents.$inferSelect;
export type NewPaymentWebhookEvent = typeof paymentWebhookEvents.$inferInsert;
