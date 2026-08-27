import "server-only";
import fs from "fs";
import path from "path";
import {
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, getBucketName } from "@/lib/r2/client";
import { env } from "@/lib/env";

export interface UploadTargetOptions {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
}

export interface ObjectMetadata {
  exists: boolean;
  sizeBytes?: number;
  contentType?: string;
}

export interface StorageProvider {
  createUploadTarget(options: UploadTargetOptions): Promise<string>;
  checkObjectExists(key: string): Promise<ObjectMetadata>;
  getObjectStream(key: string): Promise<{ stream: NodeJS.ReadableStream; contentLength?: number; contentType?: string }>;
  readRange(key: string, start: number, endInclusive: number): Promise<Buffer>;
  deleteObject(key: string): Promise<boolean>;
  createDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
}

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), ".media_cache");

/**
 * Local Storage Provider (Filesystem storage for local development & integration testing)
 */
class LocalStorageProvider implements StorageProvider {
  async createUploadTarget(options: UploadTargetOptions): Promise<string> {
    return `/api/uploads/direct-storage/${options.key}`;
  }

  async checkObjectExists(key: string): Promise<ObjectMetadata> {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        sizeBytes: stats.size,
        contentType: key.endsWith(".mov") ? "video/quicktime" : key.endsWith(".srt") ? "text/plain" : "video/mp4",
      };
    }
    return { exists: false };
  }

  async getObjectStream(key: string) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in local storage: ${key}`);
    }
    const stream = fs.createReadStream(filePath);
    const stats = fs.statSync(filePath);
    return {
      stream: stream as NodeJS.ReadableStream,
      contentLength: stats.size,
      contentType: key.endsWith(".mov") ? "video/quicktime" : key.endsWith(".srt") ? "text/plain" : "video/mp4",
    };
  }

  async readRange(key: string, start: number, endInclusive: number): Promise<Buffer> {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found in local storage: ${key}`);
    }
    const length = endInclusive - start + 1;
    if (length <= 0) return Buffer.alloc(0);

    const fileHandle = await fs.promises.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await fileHandle.read(buffer, 0, length, start);
      return buffer.subarray(0, bytesRead);
    } finally {
      await fileHandle.close();
    }
  }

  async deleteObject(key: string): Promise<boolean> {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  async createDownloadUrl(key: string): Promise<string> {
    // In local development, direct downloads stream from local direct-storage GET
    return `/api/uploads/direct-storage/${key}`;
  }
}

/**
 * Cloudflare R2 Storage Provider (S3-compatible object storage for production)
 */
class R2StorageProvider implements StorageProvider {
  async createUploadTarget(options: UploadTargetOptions): Promise<string> {
    const s3 = getR2Client();
    const bucket = getBucketName();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: options.key,
      ContentType: options.contentType,
    });
    return getSignedUrl(s3, command, {
      expiresIn: options.expiresInSeconds || 600,
    });
  }

  async checkObjectExists(key: string): Promise<ObjectMetadata> {
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
      console.error("R2 checkObjectExists error:", error);
      return { exists: false };
    }
  }

  async getObjectStream(key: string) {
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

  async readRange(key: string, start: number, endInclusive: number): Promise<Buffer> {
    const s3 = getR2Client();
    const bucket = getBucketName();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: `bytes=${start}-${endInclusive}`,
    });
    const response = await s3.send(command);
    if (!response.Body) {
      return Buffer.alloc(0);
    }
    const chunks: Buffer[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  async deleteObject(key: string): Promise<boolean> {
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

  async createDownloadUrl(key: string, expiresInSeconds = 900): Promise<string> {
    const s3 = getR2Client();
    const bucket = getBucketName();
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return getSignedUrl(s3, command, {
      expiresIn: expiresInSeconds,
    });
  }
}

// Singleton storage provider based on explicit STORAGE_DRIVER
export const storage: StorageProvider =
  env.STORAGE_DRIVER === "r2" ? new R2StorageProvider() : new LocalStorageProvider();
