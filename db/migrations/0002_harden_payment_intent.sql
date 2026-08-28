ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "payment_intent_id" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_user_intent_idx" ON "payment_orders" ("user_id", "payment_intent_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_provider_order_idx" ON "payment_orders" ("provider_order_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "wallet_txns_pay_type_idx" ON "wallet_transactions" ("payment_order_id", "type");
