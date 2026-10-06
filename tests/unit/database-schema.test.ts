import { describe, it, expect } from "vitest";
import {
  user,
  session,
  account,
  verification,
  profiles,
  projects,
  socialLinks,
  services,
  skills,
  portfolioSettings,
  reports,
  userRoleEnum,
  mediaSourceTypeEnum,
  socialPlatformEnum,
  portfolioThemeEnum,
  motionLevelEnum,
  reportReasonEnum,
  reportStatusEnum,
} from "@/db/schema";
import { assertDevelopmentEnvironment } from "@/db/fixtures/guard";
import { getTableColumns } from "drizzle-orm";

describe("Database Schema Contracts & Tables", () => {
  it("defines all 11 core tables with required columns", () => {
    const userCols = getTableColumns(user);
    expect(userCols.id).toBeDefined();
    expect(userCols.email).toBeDefined();
    expect(userCols.role).toBeDefined();

    const sessionCols = getTableColumns(session);
    expect(sessionCols.id).toBeDefined();
    expect(sessionCols.userId).toBeDefined();
    expect(sessionCols.token).toBeDefined();

    const accountCols = getTableColumns(account);
    expect(accountCols.id).toBeDefined();
    expect(accountCols.userId).toBeDefined();
    expect(accountCols.accessTokenExpiresAt).toBeDefined();
    expect(accountCols.refreshTokenExpiresAt).toBeDefined();

    const verificationCols = getTableColumns(verification);
    expect(verificationCols.id).toBeDefined();
    expect(verificationCols.identifier).toBeDefined();

    const profileCols = getTableColumns(profiles);
    expect(profileCols.id).toBeDefined();
    expect(profileCols.userId).toBeDefined();
    expect(profileCols.username).toBeDefined();
    expect(profileCols.isPublished).toBeDefined();

    const projectCols = getTableColumns(projects);
    expect(projectCols.id).toBeDefined();
    expect(projectCols.profileId).toBeDefined();
    expect(projectCols.slug).toBeDefined();
    expect(projectCols.sourceType).toBeDefined();
    expect(projectCols.sourceUrl).toBeDefined();
    expect(projectCols.publishedAt).toBeDefined();
    expect(projectCols.isPublished).toBeDefined();
    expect(projectCols.sortOrder).toBeDefined();

    const settingsCols = getTableColumns(portfolioSettings);
    expect(settingsCols.id).toBeDefined();
    expect(settingsCols.profileId).toBeDefined();
    expect(settingsCols.theme).toBeDefined();
    expect(settingsCols.spotlightProjectId).toBeDefined();
    expect(settingsCols.ctaEnabled).toBeDefined();
    expect(settingsCols.ctaLabel).toBeDefined();
    expect(settingsCols.ctaUrl).toBeDefined();

    const linkCols = getTableColumns(socialLinks);
    expect(linkCols.id).toBeDefined();
    expect(linkCols.platform).toBeDefined();

    const serviceCols = getTableColumns(services);
    expect(serviceCols.id).toBeDefined();
    expect(serviceCols.name).toBeDefined();

    const skillCols = getTableColumns(skills);
    expect(skillCols.id).toBeDefined();
    expect(skillCols.name).toBeDefined();

    const reportCols = getTableColumns(reports);
    expect(reportCols.id).toBeDefined();
    expect(reportCols.reporterIpHash).toBeDefined();
    expect(reportCols.profileId).toBeDefined();
    expect(reportCols.projectId).toBeDefined();
    expect(reportCols.reason).toBeDefined();
    expect(reportCols.status).toBeDefined();
  });

  it("exports exact PostgreSQL enum values", () => {
    expect(userRoleEnum.enumValues).toEqual(["creator", "admin"]);
    expect(mediaSourceTypeEnum.enumValues).toEqual(["youtube", "instagram", "google_drive"]);
    expect(socialPlatformEnum.enumValues).toEqual([
      "instagram",
      "youtube",
      "linkedin",
      "x",
      "whatsapp",
      "website",
    ]);
    expect(portfolioThemeEnum.enumValues).toEqual([
      "cinema",
      "editorial",
      "studio",
      "noir",
      "vogue",
      "atelier",
      "cyber",
    ]);
    expect(motionLevelEnum.enumValues).toEqual(["full", "reduced"]);
    expect(reportReasonEnum.enumValues).toEqual([
      "spam",
      "copyright",
      "inappropriate",
      "impersonation",
      "other",
    ]);
    expect(reportStatusEnum.enumValues).toEqual(["pending", "resolved", "dismissed"]);
  });

  it("enforces development fixture execution barrier in production", () => {
    const origVercelEnv = process.env.VERCEL_ENV;
    try {
      process.env.VERCEL_ENV = "production";
      expect(() => assertDevelopmentEnvironment()).toThrow(
        /Development fixtures and test seeds cannot be executed in a production environment/
      );
    } finally {
      process.env.VERCEL_ENV = origVercelEnv;
    }
  });
});
