import { AppError } from "@/lib/errors";
import { ALLOWED_MEDIA_HOSTS } from "./types";
import type { MediaProvider, ParsedMedia } from "./types";
import { youtubeProvider } from "./providers/youtube";
import { instagramProvider } from "./providers/instagram";
import { googleDriveProvider } from "./providers/google-drive";

export * from "./types";
export { youtubeProvider } from "./providers/youtube";
export { instagramProvider } from "./providers/instagram";
export { googleDriveProvider } from "./providers/google-drive";

export { YouTubePlayer } from "./components/youtube-player";
export { InstagramCard } from "./components/instagram-card";
export { DrivePlayer } from "./components/drive-player";
export { TypographicPoster } from "./components/typographic-poster";

const providers: MediaProvider[] = [
  youtubeProvider,
  instagramProvider,
  googleDriveProvider,
];

const allowedHostsSet = new Set<string>(ALLOWED_MEDIA_HOSTS);

/**
 * Validates and parses any media URL across supported providers.
 * Enforces protocol allowlist (http/https), port restrictions, and host allowlist.
 */
export function parseMediaUrl(url: string): ParsedMedia {
  if (!url || typeof url !== "string" || !url.trim()) {
    throw AppError.validation("Media URL cannot be empty");
  }

  let urlObj: URL;
  try {
    urlObj = new URL(url.trim());
  } catch {
    throw AppError.validation("Invalid URL format");
  }

  // Reject dangerous / non-http protocols (e.g. javascript:, data:, file:)
  const protocol = urlObj.protocol.toLowerCase();
  if (protocol !== "https:" && protocol !== "http:") {
    throw AppError.validation(
      `Invalid media URL protocol "${urlObj.protocol}". Only HTTP and HTTPS protocols are allowed.`
    );
  }

  // Reject arbitrary ports (only default ports "" or 80/443 allowed)
  if (urlObj.port && urlObj.port !== "80" && urlObj.port !== "443") {
    throw AppError.validation(
      `Arbitrary ports are not allowed: ${urlObj.port}`
    );
  }

  // Normalize and validate hostname against allowlist
  const hostname = urlObj.hostname.toLowerCase().replace(/\.$/, "");
  if (!allowedHostsSet.has(hostname)) {
    throw AppError.validation(
      `Disallowed or unsupported media host: "${hostname}"`
    );
  }

  // Dispatch to the matching provider
  const provider = providers.find((p) => p.match(urlObj));
  if (!provider) {
    throw AppError.validation(
      `No media provider registered for host: "${hostname}"`
    );
  }

  return provider.parse(urlObj, url.trim());
}

/**
 * Safely parses a media URL, returning null if invalid instead of throwing.
 */
export function tryParseMediaUrl(url: string): ParsedMedia | null {
  try {
    return parseMediaUrl(url);
  } catch {
    return null;
  }
}

/**
 * Checks whether a URL is a valid, supported media URL.
 */
export function isValidMediaUrl(url: string): boolean {
  return tryParseMediaUrl(url) !== null;
}
