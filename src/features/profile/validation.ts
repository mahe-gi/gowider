import { z } from "zod";

export const SOCIAL_PLATFORMS = [
  "instagram",
  "youtube",
  "linkedin",
  "x",
  "whatsapp",
  "website",
] as const;

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(100, "Display name must not exceed 100 characters"),
  headline: z
    .string()
    .trim()
    .min(2, "Headline must be at least 2 characters")
    .max(120, "Headline must not exceed 120 characters"),
  location: z
    .string()
    .trim()
    .max(80, "Location must not exceed 80 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio must not exceed 1000 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  availability: z
    .string()
    .trim()
    .max(60, "Availability status must not exceed 60 characters")
    .optional()
    .nullable()
    .or(z.literal("")),
  avatarUrl: z
    .string()
    .trim()
    .url("Avatar must be a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const serviceItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Service name cannot be empty")
    .max(80, "Service name must not exceed 80 characters"),
});

export const manageServicesSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  services: z.array(serviceItemSchema),
});

export const skillItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Skill name cannot be empty")
    .max(60, "Skill name must not exceed 60 characters"),
});

export const manageSkillsSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  skills: z.array(skillItemSchema),
});

export const socialLinkItemSchema = z.object({
  id: z.string().uuid().optional(),
  platform: z.enum(SOCIAL_PLATFORMS, {
    message: "Invalid social platform",
  }),
  url: z
    .string()
    .trim()
    .regex(/^https:\/\/.+/i, "Social link URL must start with https://"),
});

export const manageSocialLinksSchema = z.object({
  profileId: z.string().uuid("Invalid profile ID"),
  socialLinks: z
    .array(socialLinkItemSchema)
    .refine(
      (items) => {
        const platforms = items.map((i) => i.platform);
        return new Set(platforms).size === platforms.length;
      },
      {
        message: "Duplicate platforms are not allowed. Each platform may only be added once.",
      }
    ),
});
