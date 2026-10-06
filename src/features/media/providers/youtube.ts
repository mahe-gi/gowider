import { AppError } from "@/lib/errors";
import type { MediaProvider, ParsedMedia, YouTubeSubtype } from "../types";

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function extractYouTubeId(urlObj: URL): { id: string; subtype: YouTubeSubtype } | null {
  const hostname = urlObj.hostname.toLowerCase().replace(/\.$/, "");
  const pathname = urlObj.pathname;

  if (hostname === "youtu.be") {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      return { id: segments[0], subtype: "standard" };
    }
    return null;
  }

  // Check for shorts: /shorts/{id}
  const shortsMatch = pathname.match(/^\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) {
    return { id: shortsMatch[1], subtype: "shorts" };
  }

  // Check for embed: /embed/{id}
  const embedMatch = pathname.match(/^\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) {
    return { id: embedMatch[1], subtype: "standard" };
  }

  // Check for live: /live/{id}
  const liveMatch = pathname.match(/^\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch) {
    return { id: liveMatch[1], subtype: "standard" };
  }

  // Check for /v/{id}
  const vMatch = pathname.match(/^\/v\/([a-zA-Z0-9_-]+)/);
  if (vMatch) {
    return { id: vMatch[1], subtype: "standard" };
  }

  // Check query param v for /watch or similar
  const vParam = urlObj.searchParams.get("v");
  if (vParam) {
    return { id: vParam, subtype: "standard" };
  }

  return null;
}

export const youtubeProvider: MediaProvider = {
  type: "youtube",

  match(urlObj: URL): boolean {
    const hostname = urlObj.hostname.toLowerCase().replace(/\.$/, "");
    return YOUTUBE_HOSTS.has(hostname);
  },

  parse(urlObj: URL, originalUrl: string): ParsedMedia {
    const result = extractYouTubeId(urlObj);
    if (!result || !result.id.trim()) {
      throw AppError.validation("Invalid YouTube URL: Missing video ID");
    }

    const { id, subtype } = result;

    return {
      sourceType: "youtube",
      originalUrl,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnailUrl: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
      id,
      subtype,
    };
  },
};
