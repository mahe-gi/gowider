import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "@/env";

/**
 * Razorpay SDK Instance
 * Safe initialization with fallback for testing and build environments.
 */
let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

/**
 * Plan definitions and pricing tiers (GoWider V2)
 */
export const RAZORPAY_PLANS = {
  FREE: {
    id: "free",
    name: "Free Forever",
    priceInRupees: 0,
    priceInCents: 0,
    interval: "lifetime",
    maxProjects: 6,
    hideBrandingAllowed: false,
    proBadge: false,
    priorityExplore: false,
  },
  PRO_MONTHLY: {
    id: "plan_pro_monthly",
    name: "GoWider Pro (Monthly)",
    priceInRupees: 99,
    priceInPaise: 9900,
    interval: "monthly",
    maxProjects: Infinity,
    hideBrandingAllowed: true,
    proBadge: true,
    priorityExplore: true,
  },
  PRO_ANNUAL: {
    id: "plan_pro_annual",
    name: "GoWider Pro (Annual)",
    priceInRupees: 1069,
    priceInPaise: 106900,
    interval: "yearly",
    maxProjects: Infinity,
    hideBrandingAllowed: true,
    proBadge: true,
    priorityExplore: true,
  },
} as const;

/**
 * Validates Razorpay Webhook HMAC-SHA256 signature
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string = env.RAZORPAY_WEBHOOK_SECRET
): boolean {
  if (!rawBody || !signature || !secret) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  } catch {
    return false;
  }
}

/**
 * Validates Razorpay Payment/Subscription Signature
 */
export function verifyRazorpayPaymentSignature(params: {
  razorpayPaymentId: string;
  razorpaySubscriptionId?: string;
  razorpayOrderId?: string;
  razorpaySignature: string;
  secret?: string;
}): boolean {
  const secret = params.secret || env.RAZORPAY_KEY_SECRET;
  const payload = params.razorpaySubscriptionId
    ? `${params.razorpayPaymentId}|${params.razorpaySubscriptionId}`
    : `${params.razorpayOrderId}|${params.razorpayPaymentId}`;

  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(params.razorpaySignature, "utf-8"),
      Buffer.from(expected, "utf-8")
    );
  } catch {
    return false;
  }
}
