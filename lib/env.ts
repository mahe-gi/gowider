import { z } from "zod";

const envSchema = z.object({
  // Server Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("https://gowider.com"),

  // Storage Driver Configuration
  STORAGE_DRIVER: z.enum(["local", "r2"]).default("local"),

  // Database (PostgreSQL)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Redis Queue (BullMQ)
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  GENERATION_WORKER_CONCURRENCY: z.coerce.number().default(3),

  // Authentication (Auth.js / NextAuth v5) - Web Container Only
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters").optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Cloudflare R2 Storage (Required when STORAGE_DRIVER=r2)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // Sarvam AI - Background Worker Container Only
  SARVAM_API_KEY: z.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Business / Pricing
  GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE: z.coerce.number().default(4000), // Default ₹40/min
  ENABLE_DEV_CREDIT_SEED: z.enum(["true", "false"]).default("false"),
});

function parseEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:", JSON.stringify(parsed.error.format(), null, 2));
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      throw new Error("Application failed to start due to missing core environment variables.");
    }
  }

  const data = parsed.data || (process.env as any);

  // Production Storage Driver Invariant: Refuse local storage in production
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    data.STORAGE_DRIVER === "local"
  ) {
    throw new Error(
      "❌ FATAL: STORAGE_DRIVER cannot be 'local' in production. Configure STORAGE_DRIVER=r2 with Cloudflare R2 credentials."
    );
  }

  return data;
}

export const env = parseEnv();
