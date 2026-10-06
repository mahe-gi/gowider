"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { services, skills, socialLinks } from "@/db/schema/auxiliary";
import { requireProfileOwner } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";
import {
  updateProfileSchema,
  manageServicesSchema,
  manageSkillsSchema,
  manageSocialLinksSchema,
} from "../validation";
import type { Profile, Service, Skill, SocialLink } from "@/db/schema";

/**
 * Updates profile identity fields (displayName, headline, location, bio, availability, avatarUrl).
 */
export async function updateProfileAction(
  profileId: string,
  rawInput: unknown
): Promise<ActionResponse<Profile>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    const parsed = updateProfileSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid profile data");
    }

    const { displayName, headline, location, bio, availability, avatarUrl } =
      parsed.data;

    const [updated] = await db
      .update(profiles)
      .set({
        displayName,
        headline,
        location: location || null,
        bio: bio || null,
        availability: availability || null,
        avatarUrl: avatarUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
      .returning();

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }

    return actionSuccess(updated);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Manages (replaces/syncs) services with dense 0..N-1 sortOrder in an atomic transaction.
 */
export async function manageServicesAction(
  profileId: string,
  rawServices: unknown
): Promise<ActionResponse<Service[]>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    const parsed = manageServicesSchema.safeParse({
      profileId,
      services: rawServices,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid services data");
    }

    const items = parsed.data.services;

    const result = await db.transaction(async (tx) => {
      // Clear existing services for this profile
      await tx.delete(services).where(eq(services.profileId, profileId));

      if (items.length === 0) {
        return [];
      }

      // Insert new services with dense sort orders
      const valuesToInsert = items.map((item, index) => ({
        profileId,
        name: item.name,
        sortOrder: index,
      }));

      return await tx.insert(services).values(valuesToInsert).returning();
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }

    return actionSuccess(result);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Manages (replaces/syncs) skills with dense 0..N-1 sortOrder in an atomic transaction.
 */
export async function manageSkillsAction(
  profileId: string,
  rawSkills: unknown
): Promise<ActionResponse<Skill[]>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    const parsed = manageSkillsSchema.safeParse({
      profileId,
      skills: rawSkills,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid skills data");
    }

    const items = parsed.data.skills;

    const result = await db.transaction(async (tx) => {
      await tx.delete(skills).where(eq(skills.profileId, profileId));

      if (items.length === 0) {
        return [];
      }

      const valuesToInsert = items.map((item, index) => ({
        profileId,
        name: item.name,
        sortOrder: index,
      }));

      return await tx.insert(skills).values(valuesToInsert).returning();
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }

    return actionSuccess(result);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Manages (replaces/syncs) social links with dense 0..N-1 sortOrder in an atomic transaction.
 * Enforces unique platform per profile and https:// URLs.
 */
export async function manageSocialLinksAction(
  profileId: string,
  rawSocialLinks: unknown
): Promise<ActionResponse<SocialLink[]>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    const parsed = manageSocialLinksSchema.safeParse({
      profileId,
      socialLinks: rawSocialLinks,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid social links data");
    }

    const items = parsed.data.socialLinks;

    const result = await db.transaction(async (tx) => {
      await tx.delete(socialLinks).where(eq(socialLinks.profileId, profileId));

      if (items.length === 0) {
        return [];
      }

      const valuesToInsert = items.map((item, index) => ({
        profileId,
        platform: item.platform,
        url: item.url,
        sortOrder: index,
      }));

      return await tx.insert(socialLinks).values(valuesToInsert).returning();
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }

    return actionSuccess(result);
  } catch (error) {
    return actionError(error);
  }
}
