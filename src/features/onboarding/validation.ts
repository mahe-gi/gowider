import { z } from "zod";
import {
  USERNAME_REGEX,
  isReservedUsername,
} from "./constants";

export const claimUsernameSchema = z.object({
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

export type ClaimUsernameInput = z.infer<typeof claimUsernameSchema>;

export const updateIdentitySchema = z.object({
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
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio must not exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type UpdateIdentityInput = z.infer<typeof updateIdentitySchema>;

export const createFirstProjectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(140, "Title must not exceed 140 characters"),
  sourceUrl: z.string().trim().min(1, "Media source URL is required"),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(60, "Category must not exceed 60 characters"),
  client: z
    .string()
    .trim()
    .max(80, "Client must not exceed 80 characters")
    .optional()
    .or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1990, "Year must be 1990 or later")
    .max(2100, "Year must not exceed 2100")
    .optional()
    .nullable(),
  tools: z
    .array(z.string().trim().min(1))
    .default([]),
});

export type CreateFirstProjectInput = z.infer<typeof createFirstProjectSchema>;

export const setAestheticSchema = z.object({
  theme: z.enum(["cinema", "editorial", "studio"]),
  motionLevel: z.enum(["full", "reduced"]).default("full"),
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Accent color must be a valid 6-character hex code")
    .optional(),
});

export type SetAestheticInput = z.infer<typeof setAestheticSchema>;
