import "server-only";
import {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getBucketName } from "./client";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

export interface PresignedUploadOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export async function createPresignedUploadUrl({
  key,
  contentType,
  expiresInSeconds = 600, // 10 minutes default
}: PresignedUploadOptions): Promise<string> {
  const s3 = getR2Client();
  const bucket = getBucketName();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: expiresInSeconds,
  });

  return url;
}

export async function checkR2ObjectExists(key: string): Promise<{
  exists: boolean;
  sizeBytes?: number;
  contentType?: string;
}> {
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
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return { exists: false };
    }
    console.error("Error checking R2 object existence:", error);
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
    stream: response.Body as NodeJS.ReadableStream,
    contentLength: response.ContentLength,
    contentType: response.ContentType,
  };
}

export async function deleteR2Object(key: string): Promise<boolean> {
  try {
    const s3 = getR2Client();
    const bucket = getBucketName();
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3.send(command);
    return true;
  } catch (error) {
    console.error(`Failed to delete R2 object ${key}:`, error);
    return false;
  }
}
