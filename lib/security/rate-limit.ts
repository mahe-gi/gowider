import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * PostgreSQL-backed sliding window rate limiter for serverless environments.
 */
export async function checkRateLimit(
  key: string,
  maxPoints = 20,
  windowSeconds = 60
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const res: any = await db.execute(sql`
      INSERT INTO rate_limits (id, key, points, expires_at, created_at)
      VALUES (${`rate_${nanoid(16)}`}, ${key}, 1, ${resetAt}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET points = CASE
          WHEN rate_limits.expires_at < NOW() THEN 1
          ELSE rate_limits.points + 1
      END,
      expires_at = CASE
          WHEN rate_limits.expires_at < NOW() THEN ${resetAt}
          ELSE rate_limits.expires_at
      END
      RETURNING points, expires_at;
    `);

    const rawRows = res?.rows || res;
    const row = rawRows ? rawRows[0] : undefined;
    const currentPoints = row ? Number(row.points) : 1;
    const currentExpiresAt = row ? new Date(row.expires_at) : resetAt;

    const remaining = Math.max(0, maxPoints - currentPoints);
    const success = currentPoints <= maxPoints;

    return {
      success,
      limit: maxPoints,
      remaining,
      resetAt: currentExpiresAt,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return {
      success: true,
      limit: maxPoints,
      remaining: 1,
      resetAt,
    };
  }
}
