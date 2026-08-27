CREATE TYPE "public"."dispatch_state" AS ENUM('pending', 'dispatched', 'failed');--> statement-breakpoint
CREATE TYPE "public"."output_status" AS ENUM('pending', 'processing', 'exporting', 'completed', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('creating', 'created', 'pending', 'authorized', 'paid', 'captured', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'uploading', 'ready', 'processing', 'completed', 'partial_failure', 'failed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."run_status" AS ENUM('awaiting_payment', 'queued', 'uploading_to_sarvam', 'processing', 'exporting', 'completed', 'partial_failure', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('purchase', 'reservation', 'usage', 'release', 'refund', 'manual_adjustment');--> statement-breakpoint
CREATE TYPE "public"."webhook_status" AS ENUM('received', 'dispatch_pending', 'dispatched', 'processed', 'failed');--> statement-breakpoint
CREATE TABLE "generation_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"user_id" text NOT NULL,
	"target_languages" jsonb NOT NULL,
	"project_config_snapshot" jsonb NOT NULL,
	"pricing_snapshot" jsonb NOT NULL,
	"idempotency_key" text NOT NULL,
	"sarvam_job_id" text,
	"status" "run_status" DEFAULT 'awaiting_payment' NOT NULL,
	"dispatch_state" "dispatch_state" DEFAULT 'pending' NOT NULL,
	"dispatch_error" text,
	"progress" integer DEFAULT 0,
	"current_step" text,
	"current_step_label" text,
	"estimated_cost_paise" integer NOT NULL,
	"reserved_cost_paise" integer DEFAULT 0 NOT NULL,
	"final_cost_paise" integer,
	"error_code" text,
	"error_message" text,
	"settled_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generation_runs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "guest_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"claimed_by_user_id" text,
	"claimed_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guest_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "payment_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"generation_run_id" text,
	"provider" text DEFAULT 'razorpay' NOT NULL,
	"provider_order_id" text,
	"provider_payment_id" text,
	"amount_paise" integer NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"status" "payment_status" DEFAULT 'creating' NOT NULL,
	"idempotency_key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_orders_provider_payment_id_unique" UNIQUE("provider_payment_id"),
	CONSTRAINT "payment_orders_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'razorpay' NOT NULL,
	"provider_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"status" "webhook_status" DEFAULT 'received' NOT NULL,
	"dispatch_attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"payload" jsonb,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_outputs" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"target_language" text NOT NULL,
	"latest_generation_run_id" text,
	"status" "output_status" DEFAULT 'pending' NOT NULL,
	"video_r2_key" text,
	"srt_r2_key" text,
	"video_file_size_bytes" integer,
	"srt_file_size_bytes" integer,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"guest_session_id" text,
	"display_name" text,
	"source_r2_key" text NOT NULL,
	"source_file_name" text,
	"source_mime_type" text,
	"source_file_size_bytes" integer,
	"duration_seconds" integer,
	"server_verified_duration_seconds" integer,
	"source_language" text,
	"target_languages" jsonb,
	"voice_rights_confirmed_at" timestamp with time zone,
	"voice_consent_version" text,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limits_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"auth_provider" text DEFAULT 'google' NOT NULL,
	"auth_provider_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"payment_order_id" text,
	"generation_run_id" text,
	"type" "transaction_type" NOT NULL,
	"amount_paise" integer NOT NULL,
	"status" "transaction_status" DEFAULT 'completed' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance_paise" integer DEFAULT 0 NOT NULL,
	"reserved_paise" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "balance_paise_non_negative" CHECK ("wallets"."balance_paise" >= 0),
	CONSTRAINT "reserved_paise_non_negative" CHECK ("wallets"."reserved_paise" >= 0),
	CONSTRAINT "reserved_lte_balance" CHECK ("wallets"."reserved_paise" <= "wallets"."balance_paise")
);
--> statement-breakpoint
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_sessions" ADD CONSTRAINT "guest_sessions_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_orders" ADD CONSTRAINT "payment_orders_generation_run_id_generation_runs_id_fk" FOREIGN KEY ("generation_run_id") REFERENCES "public"."generation_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_outputs" ADD CONSTRAINT "project_outputs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_outputs" ADD CONSTRAINT "project_outputs_latest_generation_run_id_generation_runs_id_fk" FOREIGN KEY ("latest_generation_run_id") REFERENCES "public"."generation_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_guest_session_id_guest_sessions_id_fk" FOREIGN KEY ("guest_session_id") REFERENCES "public"."guest_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_payment_order_id_payment_orders_id_fk" FOREIGN KEY ("payment_order_id") REFERENCES "public"."payment_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_generation_run_id_generation_runs_id_fk" FOREIGN KEY ("generation_run_id") REFERENCES "public"."generation_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "provider_event_idx" ON "payment_webhook_events" USING btree ("provider","provider_event_id");--> statement-breakpoint
CREATE UNIQUE INDEX "project_outputs_proj_lang_idx" ON "project_outputs" USING btree ("project_id","target_language");--> statement-breakpoint
CREATE INDEX "project_outputs_project_id_idx" ON "project_outputs" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "wallet_txns_user_id_idx" ON "wallet_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wallet_txns_generation_run_id_idx" ON "wallet_transactions" USING btree ("generation_run_id");--> statement-breakpoint
CREATE INDEX "wallet_txns_payment_order_id_idx" ON "wallet_transactions" USING btree ("payment_order_id");