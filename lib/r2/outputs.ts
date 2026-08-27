import "server-only";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getBucketName } from "./client";

export async function createPresignedDownloadUrl(params: {
  key: string;
  fileName?: string;
  expiresInSeconds?: number;
}): Promise<string> {
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
  const s3 = getR2Client();
  const bucket = getBucketName();

  const response = await fetch(sourceUrl);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch source from ${sourceUrl}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: destKey,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
  });

  await s3.send(command);
}
