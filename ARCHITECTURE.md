# GoWider — Technical Architecture (Production V1)

## 1. High-Level Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   User Browser                         │
│  - Guest Session Cookie (guest_token)                  │
│  - Direct R2 Video Upload                              │
│  - Interactive Studio (Media Canvas + Language Chips)  │
│  - Result Studio (Tabbed Multi-Language Video Player)  │
│  - Razorpay Hosted Checkout Modal                      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────┐
│                   Next.js App                          │
│                                                        │
│  API Endpoints:                                        │
│  - POST /api/uploads/presign (Presigned R2 PUT)        │
│  - POST /api/uploads/complete (HEAD check & metadata)  │
│  - POST /api/projects        (Create draft project)    │
│  - POST /api/projects/:id/configure (Update config)    │
│  - POST /api/projects/:id/generate (Reserve credits &  │
│                               trigger Inngest event)   │
│  - GET  /api/projects/:id    (Read Postgres state)     │
│  - POST /api/projects/:id/retry (Targeted retry run)   │
│  - GET  /api/projects/:id/download/:lang/:fmt (Signed) │
│  - POST /api/auth/guest-merge (Transfer guest project) │
│  - GET  /api/wallet          (Balance & recent ledger) │
│  - POST /api/payments/order  (Create Razorpay order)   │
│  - POST /api/payments/verify (Verify HMAC signature)   │
│  - POST /api/webhooks/razorpay (Raw HMAC verification) │
│  - ALL  /api/inngest         (Inngest function server) │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ↓                        ↓
       ┌────────────────┐       ┌─────────────────┐
       │   PostgreSQL   │       │  Cloudflare R2  │
       │     (Neon)     │       │    (Private)    │
       │ - users        │       │                 │
       │ - guest_sess   │       │ - sources/...   │
       │ - projects     │       │ - outputs/...   │
       │ - gen_runs     │       └────────┬────────┘
       │ - outputs      │                │
       │ - wallets      │                │ Streaming R2 -> Sarvam
       │ - transactions │                ↓
       │ - payments     │       ┌───────────────────┐
       │ - webhook_evts │       │ Sarvam AI Dubbing │
       └────────┬───────┘       │                   │
                │               │ - Create job      │
                │ Trigger event │ - Live status     │
                ↓               │ - Export status   │
       ┌────────────────┐       └───────────────────┘
       │ Inngest Engine │
       │                │
       │ Durable Runs:  │
       │ - generation   │
       │ - webhooks     │
       │ - cleanup      │
       │ - reconciler   │
       └────────────────┘
```

---

## 2. Normalized Database Schema (Drizzle ORM)

```typescript
// db/schema.ts
import { pgTable, text, timestamp, integer, jsonb, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";

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

// 1. Users Table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // user_xxx
  authProvider: text("auth_provider").notNull().default("google"),
  authProviderId: text("auth_provider_id").notNull(),
  email: text("email").notNull(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("users_auth_idx").on(t.authProvider, t.authProviderId),
]);

// 2. Guest Sessions Table
export const guestSessions = pgTable("guest_sessions", {
  id: text("id").primaryKey(), // guest_xxx
  tokenHash: text("token_hash").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

// 3. Projects Table
export const projects = pgTable("projects", {
  id: text("id").primaryKey(), // proj_xxx
  userId: text("user_id").references(() => users.id),
  guestSessionId: text("guest_session_id").references(() => guestSessions.id),
  
  displayName: text("display_name"),
  sourceR2Key: text("source_r2_key").notNull(),
  sourceFileName: text("source_file_name"),
  sourceMimeType: text("source_mime_type").notNull(),
  sourceFileSizeBytes: integer("source_file_size_bytes").notNull(),
  
  durationSeconds: integer("duration_seconds"),
  
  sourceLanguage: text("source_language"),
  targetLanguages: jsonb("target_languages").$type<string[]>().notNull().default([]),
  
  status: projectStatusEnum("status").notNull().default("draft"),
  
  voiceRightsConfirmedAt: timestamp("voice_rights_confirmed_at"),
  voiceConsentVersion: text("voice_consent_version"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Generation Runs Table
export const generationRuns = pgTable("generation_runs", {
  id: text("id").primaryKey(), // run_xxx
  projectId: text("project_id").references(() => projects.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  
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
  
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Normalized Project Outputs Table
export const projectOutputs = pgTable("project_outputs", {
  id: text("id").primaryKey(), // out_xxx
  projectId: text("project_id").references(() => projects.id).notNull(),
  targetLanguage: text("target_language").notNull(),
  
  latestGenerationRunId: text("latest_generation_run_id").references(() => generationRuns.id).notNull(),
  
  status: projectOutputStatusEnum("status").notNull().default("pending"),
  videoR2Key: text("video_r2_key"),
  srtR2Key: text("srt_r2_key"),
  
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("project_lang_idx").on(t.projectId, t.targetLanguage),
]);

// 6. Wallets Table
export const wallets = pgTable("wallets", {
  id: text("id").primaryKey(), // wal_xxx
  userId: text("user_id").references(() => users.id).notNull().unique(),
  balancePaise: integer("balance_paise").notNull().default(0),
  reservedPaise: integer("reserved_paise").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 7. Payment Orders Table
export const paymentOrders = pgTable("payment_orders", {
  id: text("id").primaryKey(), // pay_xxx
  userId: text("user_id").references(() => users.id).notNull(),
  generationRunId: text("generation_run_id").references(() => generationRuns.id),
  
  provider: text("provider").notNull().default("razorpay"),
  providerOrderId: text("provider_order_id").unique(),
  providerPaymentId: text("provider_payment_id").unique(),
  
  amountPaise: integer("amount_paise").notNull(),
  currency: text("currency").notNull().default("INR"),
  
  status: paymentOrderStatusEnum("status").notNull().default("created"),
  idempotencyKey: text("idempotency_key").unique().notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8. Wallet Transactions Ledger Table
export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey(), // txn_xxx
  userId: text("user_id").references(() => users.id).notNull(),
  type: transactionTypeEnum("type").notNull(),
  amountPaise: integer("amount_paise").notNull(),
  projectId: text("project_id"),
  generationRunId: text("generation_run_id"),
  paymentOrderId: text("payment_order_id").references(() => paymentOrders.id),
  status: transactionStatusEnum("status").notNull().default("completed"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Payment Webhook Events Table
export const paymentWebhookEvents = pgTable("payment_webhook_events", {
  id: text("id").primaryKey(), // wevt_xxx
  provider: text("provider").notNull().default("razorpay"),
  providerEventId: text("provider_event_id").notNull(),
  eventType: text("event_type").notNull(),
  processedAt: timestamp("processed_at"),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  uniqueIndex("webhook_provider_event_idx").on(t.provider, t.providerEventId),
]);
```

---

## 3. Inngest Durable Workflow Lifecycle

### Workflow 1: `generation.requested`
```text
Inngest Step 1: Load Run & Project
       ↓
Inngest Step 2: Create Sarvam Job (`editor_flow=false`, `export_options=["video","srt"]`)
       ↓
Inngest Step 3: Stream Video from R2 -> Sarvam upload URL (`x-ms-blob-type: BlockBlob`)
       ↓
Inngest Step 4: Start Sarvam Job
       ↓
Inngest Step 5: Poll Sarvam Live Status (15s intervals, checkpoint real progress & steps)
       ↓
Inngest Step 6: Poll Sarvam Export Status (`limit=100`) until exports complete or fail
       ↓
Inngest Step 7: Download Video & SRT from temporary Sarvam URLs -> Upload to private R2
       ↓
Inngest Step 8: Update `project_outputs` rows with `videoR2Key` & `srtR2Key`
       ↓
Inngest Step 9: Atomic Wallet Settlement
  - Deduct cost only for successful video exports
  - Release unused reserved credits for failed targets
  - Record `usage` and `release` ledger entries
       ↓
Inngest Step 10: Finalize Generation Run & Project Aggregate Status
```

### Workflow 2: `payment.webhook.received`
```text
Inngest Step 1: Check `payment_webhook_events` deduplication
       ↓
Inngest Step 2: Call `finalizeCapturedPayment` (Atomic DB transaction: mark payment `paid`, credit wallet `balancePaise`, insert `purchase` transaction)
       ↓
Inngest Step 3: Auto-Resume Check:
  - If payment order has `generationRunId` and run is `awaiting_payment`:
  - Recalculate wallet balance -> atomically reserve credits -> set run to `queued` -> emit `generation.requested`
```

---

## 4. Storage & Key Path Standards

All R2 storage is private:
* Source Video: `sources/{ownerScope}/{projectId}/{randomId}.mp4`
* Output Video: `outputs/{userId}/{projectId}/{language}/video.mp4`
* Output Subtitles: `outputs/{userId}/{projectId}/{language}/subtitles.srt`
* Presigned GET download URLs are generated on-demand with a 15-minute expiration.
