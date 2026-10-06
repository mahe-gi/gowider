import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["creator", "admin"]);

export const mediaSourceTypeEnum = pgEnum("media_source_type", [
  "youtube",
  "instagram",
  "google_drive",
]);

export const socialPlatformEnum = pgEnum("social_platform", [
  "instagram",
  "youtube",
  "linkedin",
  "x",
  "whatsapp",
  "website",
]);

export const portfolioThemeEnum = pgEnum("portfolio_theme", [
  "cinema",
  "editorial",
  "studio",
]);

export const motionLevelEnum = pgEnum("motion_level", ["full", "reduced"]);

export const reportReasonEnum = pgEnum("report_reason", [
  "spam",
  "copyright",
  "inappropriate",
  "impersonation",
  "other",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "resolved",
  "dismissed",
]);
