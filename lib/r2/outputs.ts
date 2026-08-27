import "server-only";
import fs from "fs";
import path from "path";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getBucketName } from "./client";
import { env } from "@/lib/env";

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), ".media_cache");

export async function createPresignedDownloadUrl(params: {
  key: string;
  fileName?: string;
  expiresInSeconds?: number;
}): Promise<string> {
  if (env.STORAGE_DRIVER === "local") {
    return `/api/uploads/direct-storage/${params.key}`;
  }

  const s3 = getR2Client();
  const bucket = getBucketName();

  const disposition = params.fileName
    ? `attachment; filename="${encodeURIComponent(params.fileName)}"`
    : undefined;

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ResponseContentDisposition: disposition,
  });

  return getSignedUrl(s3, command, {
    expiresIn: params.expiresInSeconds || 900, // 15 minutes
  });
}

export async function copyUrlToR2(sourceUrl: string, destKey: string, contentType: string): Promise<void> {
  const response = await fetch(sourceUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch source from ${sourceUrl}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (env.STORAGE_DRIVER === "local") {
    const filePath = path.join(LOCAL_STORAGE_DIR, destKey);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return;
  }

  const s3 = getR2Client();
  const bucket = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: destKey,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
  });

  await s3.send(command);
}
