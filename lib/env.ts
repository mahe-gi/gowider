import { z } from "zod";

const envSchema = z.object({
  // Server Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database (PostgreSQL / Neon)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Authentication (Auth.js / NextAuth v5)
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Cloudflare R2 Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // Sarvam AI
  SARVAM_API_KEY: z.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Inngest
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

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
  return parsed.data || (process.env as any);
}

export const env = parseEnv();
