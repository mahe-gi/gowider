import { z } from "zod";

export const reportReasons = [
  "spam",
  "copyright",
  "inappropriate",
  "impersonation",
  "other",
] as const;

export const submitReportSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
  projectSlug: z
    .string()
    .max(100, "Project slug must be at most 100 characters")
    .optional(),
  reason: z.enum(reportReasons),
  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),
});

export type SubmitReportSchema = z.infer<typeof submitReportSchema>;
