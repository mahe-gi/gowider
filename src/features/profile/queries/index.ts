import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { services } from "@/db/schema/auxiliary";
import { skills } from "@/db/schema/auxiliary";
import { socialLinks } from "@/db/schema/auxiliary";
import { eq, asc } from "drizzle-orm";
import type { Profile } from "@/db/schema";
import type { ProfileWithAuxiliary } from "../types";

/**
 * Loads a profile with all associated auxiliary records (services, skills, social links)
 * ordered deterministically by sortOrder.
 * Accepts optional existingProfile to eliminate duplicate profile queries.
 */
export async function getProfileWithAuxiliary(
  profileId: string,
  existingProfile?: Profile | null
): Promise<ProfileWithAuxiliary | null> {
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

  const [loadedServices, loadedSkills, loadedSocialLinks] = await Promise.all([
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
      .from(socialLinks)
      .where(eq(socialLinks.profileId, profileId))
      .orderBy(asc(socialLinks.sortOrder)),
  ]);

  return {
    profile,
    services: loadedServices,
    skills: loadedSkills,
    socialLinks: loadedSocialLinks,
  };
}
