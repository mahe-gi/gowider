import { z } from "zod";

const envSchema = z.object({
  // Server-only secrets
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16).default("gowider_default_auth_session_secret_change_in_prod_32chars"),
  BETTER_AUTH_URL: z.string().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
  REPORT_PEPPER_SECRET: z.string().default("gowider_pepper_secret_production_hash_salt_v1"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Razorpay Billing (V2)
  RAZORPAY_KEY_ID: z.string().default("rzp_test_placeholder_key_id"),
  RAZORPAY_KEY_SECRET: z.string().default("placeholder_secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().default("placeholder_webhook_secret"),

  // Public variables
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().default("rzp_test_placeholder_key_id"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const isServer = typeof window === "undefined";

  // Canonical production domain is gowider.in
  const detectedUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.BETTER_AUTH_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://gowider.in"
      : process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

  const rawEnv = {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      (!isServer || process.env.NODE_ENV === "test"
        ? "postgresql://client-safe:mock@localhost:5432/mock"
        : undefined),
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ||
      "gowider_default_auth_session_secret_change_in_prod_32chars",
    BETTER_AUTH_URL: detectedUrl,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
    REPORT_PEPPER_SECRET:
      process.env.REPORT_PEPPER_SECRET ||
      "gowider_pepper_secret_production_hash_salt_v1",
    RAZORPAY_KEY_ID:
      process.env.RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      "rzp_test_placeholder_key_id",
    RAZORPAY_KEY_SECRET:
      process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
    RAZORPAY_WEBHOOK_SECRET:
      process.env.RAZORPAY_WEBHOOK_SECRET || "placeholder_webhook_secret",
    NODE_ENV: process.env.NODE_ENV || "development",
    NEXT_PUBLIC_APP_URL: detectedUrl,
    NEXT_PUBLIC_RAZORPAY_KEY_ID:
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      "rzp_test_placeholder_key_id",
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    if (isServer && (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development")) {
      console.error("❌ Invalid environment variables:", JSON.stringify(parsed.error.format(), null, 2));
      throw new Error("Invalid environment variables");
    }
  }

  return (parsed.success ? parsed.data : rawEnv) as Env;
}

export const env = parseEnv();
