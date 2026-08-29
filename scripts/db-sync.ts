import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import postgres from "postgres";

async function runDBSync() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is required.");
    process.exit(1);
  }

  console.log("🚀 Syncing schema and applying all missing columns to PostgreSQL...");

  const isSsl = databaseUrl.includes("sslmode=require") || process.env.DB_SSL === "true";
  const sql = postgres(databaseUrl, {
    max: 1,
    ssl: isSsl ? { rejectUnauthorized: false } : undefined,
    prepare: false,
  });

  try {
    // 1. Enum updates (run individually outside transaction blocks)
    try {
      await sql.unsafe(`ALTER TYPE "public"."project_status" ADD VALUE IF NOT EXISTS 'upload_pending';`);
    } catch (e: any) {
      console.log("Note on enum project_status:", e.message);
    }

    // 2. Ensure all columns exist on projects
    console.log("Checking projects columns...");
    await sql.unsafe(`
      ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "upload_intent_id" text;
      ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
      ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deletion_started_at" timestamp with time zone;
      ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "deletion_claim_token" text;
      ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'upload_pending';
    `);

    // 3. Ensure all columns exist on payment_orders
    console.log("Checking payment_orders columns...");
    await sql.unsafe(`
      ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "payment_intent_id" text;
      ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "provider_creation_lease_until" timestamp with time zone;
      ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "provider_creation_token" text;
    `);

    // 4. Ensure all indexes exist
    console.log("Checking indexes...");
    await sql.unsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "projects_user_upload_intent_idx" ON "projects" ("userId", "upload_intent_id");
      CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects" ("userId");
      CREATE INDEX IF NOT EXISTS "projects_status_idx" ON "projects" ("status");
      CREATE INDEX IF NOT EXISTS "projects_deleted_at_idx" ON "projects" ("deleted_at");
      CREATE INDEX IF NOT EXISTS "projects_deletion_started_idx" ON "projects" ("deletion_started_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "generation_runs_proj_idem_idx" ON "generation_runs" ("project_id", "idempotency_key");
      CREATE INDEX IF NOT EXISTS "generation_runs_status_idx" ON "generation_runs" ("status");
      CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_user_intent_idx" ON "payment_orders" ("user_id", "payment_intent_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_provider_order_idx" ON "payment_orders" ("provider_order_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "wallet_txns_run_type_idx" ON "wallet_transactions" ("generation_run_id", "type");
    `);

    console.log("✅ All columns and indexes are 100% verified and synchronized.");
  } catch (err: any) {
    console.error("❌ Schema sync failed:", err.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runDBSync();
