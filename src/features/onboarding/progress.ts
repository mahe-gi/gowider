import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { projects } from "@/db/schema/projects";
import { portfolioSettings } from "@/db/schema/auxiliary";
import { eq, sql } from "drizzle-orm";
import type { Profile, PortfolioSettings } from "@/db/schema";

export type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export interface OnboardingProgress {
  currentStep: OnboardingStep;
  isComplete: boolean;
  profile: Profile | null;
  projectsCount: number;
  settings: PortfolioSettings | null;
}

/**
 * Derives current onboarding step (1 to 5) server-side from existing tables
 * without requiring a dedicated onboarding database table.
 *
 * - Step 1: No profile record -> Claim username.
 * - Step 2: Profile exists but missing displayName OR headline -> Identity setup.
 * - Step 3: Zero projects for profile -> First work creation.
 * - Step 4: Settings record missing or unconfigured -> Aesthetic theme selection.
 * - Step 5: Profile exists with all above but is_published = false -> Preview & Publish live.
 */
export async function getOnboardingProgress(
  userId: string
): Promise<OnboardingProgress> {
  // 1. Query profile
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!profile) {
    return {
      currentStep: 1,
      isComplete: false,
      profile: null,
      projectsCount: 0,
      settings: null,
    };
  }

  // 2. Profile exists: check identity fields
  const hasDisplayName = Boolean(profile.displayName && profile.displayName.trim().length > 0);
  const hasHeadline = Boolean(profile.headline && profile.headline.trim().length > 0);

  if (!hasDisplayName || !hasHeadline) {
    return {
      currentStep: 2,
      isComplete: false,
      profile,
      projectsCount: 0,
      settings: null,
    };
  }

  // 3. Check projects count for profile
  const [projectCountResult] = await db
    .select({
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(projects)
    .where(eq(projects.profileId, profile.id));

  const projectsCount = projectCountResult ? Number(projectCountResult.count) : 0;

  if (projectsCount === 0) {
    return {
      currentStep: 3,
      isComplete: false,
      profile,
      projectsCount: 0,
      settings: null,
    };
  }

  // 4. Check portfolio settings
  const [settings] = await db
    .select()
    .from(portfolioSettings)
    .where(eq(portfolioSettings.profileId, profile.id))
    .limit(1);

  if (!settings) {
    return {
      currentStep: 4,
      isComplete: false,
      profile,
      projectsCount,
      settings: null,
    };
  }

  // 5. Check published status
  if (!profile.isPublished) {
    return {
      currentStep: 5,
      isComplete: false,
      profile,
      projectsCount,
      settings,
    };
  }

  // Already completed
  return {
    currentStep: 5,
    isComplete: true,
    profile,
    projectsCount,
    settings,
  };
}
