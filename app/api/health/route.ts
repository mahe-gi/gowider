import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { Redis } from "ioredis";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("Healthcheck timed out")), timeoutMs)),
  ]);
}

export async function GET() {
  let isDbOk = false;
  let isRedisOk = false;

  // 1. Fast DB check with 2s timeout
  try {
    await withTimeout(db.execute(sql`SELECT 1`), 2000);
    isDbOk = true;
  } catch (err: any) {
    console.error("Healthcheck: DB check failed:", err.message);
  }

  // 2. Fast Redis check with isolated short-lived client (2s timeout, no infinite reconnect retry)
  try {
    const healthRedis = new Redis(env.REDIS_URL, {
      connectTimeout: 1500,
      maxRetriesPerRequest: 1,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null, // Do not reconnect on failure during healthcheck
    });

    await withTimeout(
      (async () => {
        await healthRedis.connect();
        const pong = await healthRedis.ping();
        await healthRedis.quit();
        return pong;
      })(),
      2000
    );

    isRedisOk = true;
  } catch (err: any) {
    console.error("Healthcheck: Redis check failed:", err.message);
  }

  const isHealthy = isDbOk && isRedisOk;

  return NextResponse.json(
    { status: isHealthy ? "ok" : "degraded" },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
