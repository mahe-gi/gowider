export const ALLOWED_MEDIA_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "instagram.com",
  "www.instagram.com",
  "instagr.am",
  "drive.google.com",
  "docs.google.com",
] as const;

export type AllowedMediaHost = (typeof ALLOWED_MEDIA_HOSTS)[number];

export type MediaSourceType = "youtube" | "instagram" | "google_drive";

export type InstagramSubtype = "reel" | "p" | "tv";
export type YouTubeSubtype = "standard" | "shorts";

export type MediaSubtype = InstagramSubtype | YouTubeSubtype | string;

export interface ParsedMedia {
  sourceType: MediaSourceType;
  originalUrl: string;
  canonicalUrl: string;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  id: string;
  subtype?: MediaSubtype;
}

export interface MediaProvider {
  readonly type: MediaSourceType;
  match: (urlObj: URL) => boolean;
  parse: (urlObj: URL, originalUrl: string) => ParsedMedia;
}
