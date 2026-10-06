import { z } from "zod";
import {
  USERNAME_REGEX,
  isReservedUsername,
} from "@/features/onboarding/constants";

export const THEMES = ["cinema", "editorial", "studio"] as const;
export const MOTION_LEVELS = ["full", "reduced"] as const;

export const portfolioSettingsSchema = z.object({
  theme: z.enum(THEMES, {
    message: "Theme must be one of: cinema, editorial, studio",
  }),
  motionLevel: z.enum(MOTION_LEVELS, {
    message: "Motion level must be 'full' or 'reduced'",
  }),
  accentColor: z
    .string()
    .trim()
    .regex(
      /^#[0-9a-fA-F]{6}$/,
      "Accent color must be a valid 6-character hex code (e.g. #E5E5E5)"
    ),
  hideBranding: z.boolean().optional(),
});

export type PortfolioSettingsInput = z.infer<typeof portfolioSettingsSchema>;

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(
      USERNAME_REGEX,
      "Username must start and end with a letter or digit and contain only lowercase letters, digits, underscores, or hyphens"
    )
    .refine((val) => !isReservedUsername(val), {
      message: "This username is reserved and cannot be claimed",
    }),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;

export const toggleVisibilitySchema = z.object({
  isPublished: z.boolean().optional(),
});
