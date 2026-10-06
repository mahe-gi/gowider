ALTER TYPE "portfolio_theme" ADD VALUE IF NOT EXISTS 'atelier';--> statement-breakpoint
ALTER TYPE "portfolio_theme" ADD VALUE IF NOT EXISTS 'cyber';--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN IF NOT EXISTS "spotlight_project_id" uuid;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN IF NOT EXISTS "cta_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN IF NOT EXISTS "cta_label" varchar(60);--> statement-breakpoint
ALTER TABLE "portfolio_settings" ADD COLUMN IF NOT EXISTS "cta_url" varchar(500);
