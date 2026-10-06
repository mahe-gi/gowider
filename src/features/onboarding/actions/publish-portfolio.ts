"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { projects } from "@/db/schema/projects";
import { requireAuth } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import type { Profile } from "@/db/schema";

export async function publishOnboardingPortfolioAction(): Promise<
  ActionResponse<{ profile: Profile; publishedUrl: string }>
> {
  try {
    const { user } = await requireAuth();

    // Fetch user profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile) {
      throw AppError.notFound("Profile not found. Claim a username first.");
    }

    // Minimum publish check:
    // 1. Claimed username
    if (!profile.username || !profile.username.trim()) {
      throw AppError.badRequest("A claimed username is required to publish.");
    }

    // 2. Non-empty displayName and headline
    if (
      !profile.displayName ||
      !profile.displayName.trim() ||
      !profile.headline ||
      !profile.headline.trim()
    ) {
      throw AppError.badRequest(
        "Display name and headline are required before publishing."
      );
    }

    // 3. At least 1 project
    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.profileId, profile.id))
      .limit(1);

    if (userProjects.length === 0) {
      throw AppError.badRequest(
        "At least one project is required before publishing."
      );
    }

    // Atomic transaction:
    // 1. projects.is_published = true, projects.published_at = now()
    // 2. profiles.is_published = true
    const now = new Date();

    const updatedProfile = await db.transaction(async (tx) => {
      // Publish unpublished projects for this profile
      await tx
        .update(projects)
        .set({
          isPublished: true,
          publishedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(projects.profileId, profile.id),
            eq(projects.isPublished, false)
          )
        );

      // Publish profile
      const [pubProfile] = await tx
        .update(profiles)
        .set({
          isPublished: true,
          updatedAt: now,
        })
        .where(eq(profiles.id, profile.id))
        .returning();

      return pubProfile;
    });

    // Revalidate public route
    try {
      revalidatePath(`/${profile.username}`);
      revalidatePath("/");
    } catch {
      // In non-server runtime or test environment, revalidatePath can safely be ignored
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const publishedUrl = `${appUrl}/${profile.username}`;

    return actionSuccess({
      profile: updatedProfile,
      publishedUrl,
    });
  } catch (error) {
    return actionError(error);
  }
}
