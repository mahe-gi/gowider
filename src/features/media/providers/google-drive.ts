import { AppError } from "@/lib/errors";
import type { MediaProvider, ParsedMedia } from "../types";

const GOOGLE_DRIVE_HOSTS = new Set([
  "drive.google.com",
  "docs.google.com",
]);

export function extractGoogleDriveId(urlObj: URL): string | null {
  const pathname = urlObj.pathname;

  // Match /file/d/{fileId}
  const fileMatch = pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return fileMatch[1];
  }

  // Match /open?id={fileId} or /uc?id={fileId}
  const idParam = urlObj.searchParams.get("id");
  if (idParam) {
    return idParam;
  }

  return null;
}

export const googleDriveProvider: MediaProvider = {
  type: "google_drive",

  match(urlObj: URL): boolean {
    const hostname = urlObj.hostname.toLowerCase().replace(/\.$/, "");
    return GOOGLE_DRIVE_HOSTS.has(hostname);
  },

  parse(urlObj: URL, originalUrl: string): ParsedMedia {
    const id = extractGoogleDriveId(urlObj);
    if (!id || !id.trim()) {
      throw AppError.validation("Invalid Google Drive URL: Missing file ID");
    }

    return {
      sourceType: "google_drive",
      originalUrl,
      canonicalUrl: `https://drive.google.com/file/d/${id}/view`,
      embedUrl: `https://drive.google.com/file/d/${id}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1280`,
      id,
    };
  },
};
