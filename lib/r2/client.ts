import "server-only";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/lib/env";

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (s3ClientInstance) return s3ClientInstance;

  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    console.warn("⚠️ Cloudflare R2 credentials not fully configured. Using fallback dummy client for local development.");
  }

  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
    credentials: {
      accessKeyId: accessKeyId || "mock",
      secretAccessKey: secretAccessKey || "mock",
    },
  });

  return s3ClientInstance;
}

export function getBucketName(): string {
  return env.R2_BUCKET_NAME || "gowider-media";
}
