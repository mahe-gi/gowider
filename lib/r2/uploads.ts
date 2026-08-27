import "server-only";
import { storage, type UploadTargetOptions, type ObjectMetadata } from "@/lib/storage";

export type PresignedUploadOptions = UploadTargetOptions;

export async function createPresignedUploadUrl(options: PresignedUploadOptions): Promise<string> {
  return storage.createUploadTarget(options);
}

export async function checkR2ObjectExists(key: string): Promise<ObjectMetadata> {
  return storage.checkObjectExists(key);
}

export async function getR2ObjectStream(key: string) {
  return storage.getObjectStream(key);
}

export async function readR2Range(key: string, start: number, endInclusive: number): Promise<Buffer> {
  return storage.readRange(key, start, endInclusive);
}

export async function deleteR2Object(key: string): Promise<boolean> {
  return storage.deleteObject(key);
}
