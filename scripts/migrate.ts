import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is required for running migrations.");
    process.exit(1);
  }

  console.log("🚀 Running database migrations against PostgreSQL...");

  const isSsl = databaseUrl.includes("sslmode=require") || process.env.DB_SSL === "true";
  const migrationClient = postgres(databaseUrl, {
    max: 1,
    ssl: isSsl ? "require" : undefined,
  });

  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: "./db/migrations" });
    console.log("✅ All migrations applied successfully.");
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigration();
