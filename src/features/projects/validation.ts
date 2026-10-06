import { z } from "zod";
import { isValidMediaUrl } from "@/features/media";

export const ALLOWED_THUMBNAIL_IMAGE_HOSTS = [
  "images.unsplash.com",
  "cdn.sanity.io",
  "drive.google.com",
  "lh3.googleusercontent.com",
  "i.imgur.com",
  "res.cloudinary.com",
] as const;

export function isValidThumbnailHost(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  try {
    const url = new URL(urlStr.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return false;
    }
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

    // Direct check against allowed list or matching allowed provider domains
    if (
      ALLOWED_THUMBNAIL_IMAGE_HOSTS.some(
        (host) => hostname === host || hostname.endsWith(`.${host}`)
      )
    ) {
      return true;
    }

    // Provider domain suffixes (Unsplash, Sanity, Google, Imgur, Cloudinary)
    if (
      hostname === "unsplash.com" ||
      hostname.endsWith(".unsplash.com") ||
      hostname === "sanity.io" ||
      hostname.endsWith(".sanity.io") ||
      hostname === "googleusercontent.com" ||
      hostname.endsWith(".googleusercontent.com") ||
      hostname === "google.com" ||
      hostname.endsWith(".google.com") ||
      hostname === "imgur.com" ||
      hostname.endsWith(".imgur.com") ||
      hostname === "cloudinary.com" ||
      hostname.endsWith(".cloudinary.com")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export const projectSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(100, "Slug must not exceed 100 characters")
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    "Slug must contain only lowercase alphanumeric characters separated by hyphens"
  );

export const createProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(140, "Title must not exceed 140 characters"),
  sourceUrl: z
    .string()
    .trim()
    .min(1, "Media source URL is required")
    .refine((url) => isValidMediaUrl(url), {
      message:
        "Invalid media URL. Supported platforms are YouTube, Instagram, and Google Drive.",
    }),
  sourceType: z
    .enum(["youtube", "instagram", "google_drive"])
    .optional(),
  thumbnailUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((url) => !url || isValidThumbnailHost(url), {
      message:
        "Thumbnail URL must be hosted on an allowed domain (Unsplash, Sanity, Google, Imgur, Cloudinary)",
    }),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(60, "Category must not exceed 60 characters"),
  client: z
    .string()
    .trim()
    .max(80, "Client name must not exceed 80 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1990, "Year must be 1990 or later")
    .max(2100, "Year must not exceed 2100")
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  tools: z
    .array(z.string().trim().min(1))
    .default([]),
  featured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  slug: projectSlugSchema.optional(),
});

export const updateProjectSchema = z.object({
  id: z.string().uuid("Invalid project ID"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(140, "Title must not exceed 140 characters")
    .optional(),
  sourceUrl: z
    .string()
    .trim()
    .min(1, "Media source URL is required")
    .refine((url) => isValidMediaUrl(url), {
      message:
        "Invalid media URL. Supported platforms are YouTube, Instagram, and Google Drive.",
    })
    .optional(),
  sourceType: z
    .enum(["youtube", "instagram", "google_drive"])
    .optional(),
  thumbnailUrl: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((url) => !url || isValidThumbnailHost(url), {
      message:
        "Thumbnail URL must be hosted on an allowed domain (Unsplash, Sanity, Google, Imgur, Cloudinary)",
    }),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(60, "Category must not exceed 60 characters")
    .optional(),
  client: z
    .string()
    .trim()
    .max(80, "Client name must not exceed 80 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1990, "Year must be 1990 or later")
    .max(2100, "Year must not exceed 2100")
    .optional()
    .nullable(),
  description: z
    .string()
    .trim()
    .max(5000, "Description must not exceed 5000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  tools: z.array(z.string().trim().min(1)).optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  slug: projectSlugSchema.optional(),
});

export const reorderProjectsSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  projectIds: z
    .array(z.string().uuid("Invalid project ID"))
    .min(1, "At least one project ID is required"),
});

export const toggleProjectPublishSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});

export const deleteProjectSchema = z.object({
  projectId: z.string().uuid("Invalid project ID"),
});
