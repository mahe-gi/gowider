import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { projects } from "@/db/schema/projects";
import {
  services,
  skills,
  socialLinks,
  portfolioSettings,
} from "@/db/schema/auxiliary";
import { eq, asc, desc } from "drizzle-orm";
import type { Profile } from "@/db/schema";
import type { PortfolioData } from "@/features/portfolio/types";

/**
 * Loads the complete draft portfolio for internal dashboard preview.
 * Includes all projects (published AND drafts) retaining database UUIDs.
 * Accepts optional existingProfile to eliminate duplicate profile queries.
 */
export async function getDraftPortfolio(
  profileId: string,
  existingProfile?: Profile | null
): Promise<PortfolioData | null> {
  if (!profileId) return null;

  let profile = existingProfile;
  if (!profile) {
    const [fetchedProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);
    profile = fetchedProfile;
  }

  if (!profile) return null;

  const [
    allProjects,
    loadedSocialLinks,
    loadedServices,
    loadedSkills,
    [settings],
  ] = await Promise.all([
    db
      .select()
      .from(projects)
      .where(eq(projects.profileId, profileId))
      .orderBy(asc(projects.sortOrder), desc(projects.createdAt)),
    db
      .select()
      .from(socialLinks)
      .where(eq(socialLinks.profileId, profileId))
      .orderBy(asc(socialLinks.sortOrder)),
    db
      .select()
      .from(services)
      .where(eq(services.profileId, profileId))
      .orderBy(asc(services.sortOrder)),
    db
      .select()
      .from(skills)
      .where(eq(skills.profileId, profileId))
      .orderBy(asc(skills.sortOrder)),
    db
      .select()
      .from(portfolioSettings)
      .where(eq(portfolioSettings.profileId, profileId))
      .limit(1),
  ]);

  return {
    profile,
    projects: allProjects,
    socialLinks: loadedSocialLinks,
    services: loadedServices,
    skills: loadedSkills,
    settings: settings ?? null,
  };
}
