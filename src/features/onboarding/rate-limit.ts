import { AppError } from "@/lib/errors";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting map keyed by identifier (userId, ip, etc.)
const rateLimits = new Map<string, RateLimitRecord>();

/**
 * Checks in-memory sliding-window-style rate limit.
 * Cleans expired entries lazily.
 */
export function enforceRateLimit(
  key: string,
  limit = 30,
  windowMs = 60 * 1000
): void {
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw AppError.rateLimited(
      `Rate limit exceeded: maximum ${limit} requests per minute.`
    );
  }

  record.count += 1;
}

/**
 * Reset rate limit tracking (primarily for tests).
 */
export function resetRateLimits(): void {
  rateLimits.clear();
}
