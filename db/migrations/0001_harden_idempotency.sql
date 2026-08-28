ALTER TYPE "public"."project_status" ADD VALUE IF NOT EXISTS 'upload_pending';
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "upload_intent_id" text;
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'upload_pending';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "projects_user_upload_intent_idx" ON "projects" ("userId", "upload_intent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects" ("userId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "generation_runs_proj_idem_idx" ON "generation_runs" ("project_id", "idempotency_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "generation_runs_status_idx" ON "generation_runs" ("status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wallet_txns_run_type_idx" ON "wallet_transactions" ("generation_run_id", "type");
