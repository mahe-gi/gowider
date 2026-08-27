import "server-only";
import { eq, sql, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimits } from "@/db/schema";
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
    // Atomic Upsert and increment
    const res = await db.execute(sql`
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

    const row = (res.rows || res)[0] as { points: number; expires_at: Date } | undefined;
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
    // Fail open in case of DB glitch for rate limiter so critical user requests aren't blocked
    return {
      success: true,
      limit: maxPoints,
      remaining: 1,
      resetAt,
    };
  }
}
