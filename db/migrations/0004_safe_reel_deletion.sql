ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_deleted_at_idx" ON "projects" ("deleted_at");
