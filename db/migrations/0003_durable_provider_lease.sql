ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "provider_creation_lease_until" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "provider_creation_token" text;
--> statement-breakpoint
DROP INDEX IF EXISTS "wallet_txns_pay_type_idx";
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wallet_txns_pay_purchase_idx" ON "wallet_transactions" ("payment_order_id") WHERE "type" = 'purchase' AND "payment_order_id" IS NOT NULL;
