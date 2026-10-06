import { AppError } from "@/lib/errors";
import type { InstagramSubtype, MediaProvider, ParsedMedia } from "../types";

const INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "instagr.am",
]);

export function extractInstagramInfo(
  urlObj: URL
): { id: string; subtype: InstagramSubtype } | null {
  const pathname = urlObj.pathname;
  // Match /reel/{id}, /reels/{id}, /p/{id}, /tv/{id}
  const match = pathname.match(/^\/(reels?|p|tv)\/([a-zA-Z0-9_-]+)/);
  if (!match) {
    return null;
  }

  const rawSubtype = match[1];
  const subtype: InstagramSubtype = rawSubtype === "reels" ? "reel" : (rawSubtype as InstagramSubtype);
  const id = match[2];

  return { id, subtype };
}

export const instagramProvider: MediaProvider = {
  type: "instagram",

  match(urlObj: URL): boolean {
    const hostname = urlObj.hostname.toLowerCase().replace(/\.$/, "");
    return INSTAGRAM_HOSTS.has(hostname);
  },

  parse(urlObj: URL, originalUrl: string): ParsedMedia {
    const info = extractInstagramInfo(urlObj);
    if (!info || !info.id.trim()) {
      throw AppError.validation(
        "Invalid Instagram URL: Must be a /reel/, /p/, or /tv/ link with valid shortcode"
      );
    }

    const { id, subtype } = info;
    const canonicalUrl = `https://www.instagram.com/${subtype}/${id}/`;

    return {
      sourceType: "instagram",
      originalUrl,
      canonicalUrl,
      // Card embed points users directly to the native link; no iframes/scraping
      embedUrl: null,
      thumbnailUrl: null,
      id,
      subtype,
    };
  },
};
