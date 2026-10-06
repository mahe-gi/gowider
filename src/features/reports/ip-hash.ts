import crypto from "crypto";
import { env } from "@/env";

/**
 * Computes a salted HMAC-SHA256 hash of a client IP address.
 * Plaintext IP addresses are NEVER stored in the database.
 */
export function hashIpAddress(ip: string): string {
  const secret =
    env.REPORT_PEPPER_SECRET ||
    process.env.REPORT_PEPPER_SECRET ||
    "default_pepper_secret_min_32_characters";
  const normalizedIp = ip.trim();
  return crypto.createHmac("sha256", secret).update(normalizedIp).digest("hex");
}

/**
 * Resolves client IP from request headers (x-forwarded-for, x-real-ip).
 */
export function resolveClientIp(headersList: Headers): string {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }

  return "127.0.0.1";
}
