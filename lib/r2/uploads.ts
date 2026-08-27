import "server-only";
import { PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getBucketName } from "./client";

export async function createPresignedUploadUrl(params: {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const s3 = getR2Client();
  const bucket = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: params.expiresInSeconds || 600, // 10 minutes
  });
}

export async function checkR2ObjectExists(key: string): Promise<{ exists: boolean; sizeBytes?: number; contentType?: string }> {
  try {
    const s3 = getR2Client();
    const bucket = getBucketName();

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3.send(command);
    return {
      exists: true,
      sizeBytes: response.ContentLength,
      contentType: response.ContentType,
    };
  } catch (error: any) {
    if (error?.name === "NotFound" || error?.$metadata?.httpStatusCode === 404) {
      return { exists: false };
    }
    console.error("Error checking R2 object:", error);
    return { exists: false };
  }
}

export async function getR2ObjectStream(key: string) {
  const s3 = getR2Client();
  const bucket = getBucketName();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);
  return {
    stream: response.Body,
    contentLength: response.ContentLength,
    contentType: response.ContentType,
  };
}
