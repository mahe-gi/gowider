ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deletion_started_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deletion_claim_token" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_deletion_started_idx" ON "projects" ("deletion_started_at");
