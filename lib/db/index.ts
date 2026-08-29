import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { env } from "@/lib/env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

// Standard PostgreSQL SSL configuration (determined by sslmode=require in connection string or explicit DB_SSL env)
const requiresSsl =
  env.DATABASE_URL.includes("sslmode=require") ||
  env.DATABASE_URL.includes("ssl=true") ||
  process.env.DB_SSL === "true";

const client = postgres(env.DATABASE_URL, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 15,
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  prepare: false,
});

export const db = drizzle(client, { schema });
