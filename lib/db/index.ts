import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";
import { env } from "@/lib/env";

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const isNeon = env.DATABASE_URL.includes("neon.tech");

export const db = isNeon
  ? drizzleNeon(neon(env.DATABASE_URL), { schema })
  : drizzlePostgres(
      postgres(env.DATABASE_URL, {
        max: 10,
      }),
      { schema }
    );
