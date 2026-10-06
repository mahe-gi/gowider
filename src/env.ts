import { z } from "zod";

const envSchema = z.object({
  // Server-only secrets
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  REPORT_PEPPER_SECRET: z.string().min(16, "REPORT_PEPPER_SECRET must be at least 16 characters"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Public variables
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const isServer = typeof window === "undefined";

  // During client bundle evaluation or testing, provide safe mock defaults for server-only secrets
  const rawEnv = {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      (!isServer || process.env.NODE_ENV === "test"
        ? "postgresql://client-safe:mock@localhost:5432/mock"
        : undefined),
    BETTER_AUTH_SECRET:
      process.env.BETTER_AUTH_SECRET ||
      (!isServer || process.env.NODE_ENV === "test"
        ? "client_safe_secret_32_characters_long"
        : undefined),
    BETTER_AUTH_URL:
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
      (process.env.NODE_ENV === "production" ? "https://gowider.in" : "http://localhost:3000"),
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID ||
      (!isServer || process.env.NODE_ENV === "test" ? "client_safe_id" : undefined),
    GOOGLE_CLIENT_SECRET:
      process.env.GOOGLE_CLIENT_SECRET ||
      (!isServer || process.env.NODE_ENV === "test"
        ? "client_safe_secret"
        : undefined),
    REPORT_PEPPER_SECRET:
      process.env.REPORT_PEPPER_SECRET ||
      (!isServer || process.env.NODE_ENV === "test"
        ? "client_safe_pepper_32_characters_long"
        : undefined),
    NODE_ENV: process.env.NODE_ENV || "development",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
      (process.env.NODE_ENV === "production" ? "https://gowider.in" : "http://localhost:3000"),
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
