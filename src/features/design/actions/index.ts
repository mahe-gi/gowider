"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { user as userTable } from "@/db/schema/auth";
import { portfolioSettings } from "@/db/schema/auxiliary";
import { requireAuth, requireProfileOwner } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";
import {
  portfolioSettingsSchema,
  updateUsernameSchema,
  toggleVisibilitySchema,
} from "../validation";
import type { PortfolioSettings } from "@/db/schema";

import { canHideBranding, isProProfile } from "@/features/billing/subscription-service";

const PRO_THEMES = ["noir", "vogue"];

/**
 * Updates or upserts portfolio appearance settings (theme, motionLevel, accentColor, hideBranding).
 */
export async function updatePortfolioSettingsAction(
  profileId: string,
  rawInput: unknown
): Promise<ActionResponse<PortfolioSettings>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    const parsed = portfolioSettingsSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid settings input");
    }

    const { theme, motionLevel, accentColor, hideBranding } = parsed.data;

    // Enforce Pro tier gate for Pro-exclusive themes (Noir, Vogue)
    if (theme && PRO_THEMES.includes(theme)) {
      const isPro = await isProProfile(profileId);
      if (!isPro) {
        const themeName = theme === "noir" ? "Noir" : "Vogue";
        throw AppError.forbidden(
          `The ${themeName} theme is exclusive to GoWider Pro creators. Upgrade to GoWider Pro to activate it.`
        );
      }
    }

    // Enforce Pro tier gate for hiding GoWider branding
    if (hideBranding === true) {
      const gate = await canHideBranding(profileId);
      if (!gate.allowed) {
        throw AppError.forbidden(
          "Removing GoWider branding is a Pro tier feature. Upgrade to GoWider Pro to hide the badge."
        );
      }
    }

    const [existingSettings] = await db
      .select()
      .from(portfolioSettings)
      .where(eq(portfolioSettings.profileId, profileId))
      .limit(1);

    let savedSettings: PortfolioSettings;

    if (existingSettings) {
      const [updated] = await db
        .update(portfolioSettings)
        .set({
          theme,
          motionLevel,
          accentColor,
          hideBranding: hideBranding ?? existingSettings.hideBranding,
          updatedAt: new Date(),
        })
        .where(eq(portfolioSettings.profileId, profileId))
        .returning();
      savedSettings = updated;
    } else {
      const [created] = await db
        .insert(portfolioSettings)
        .values({
          profileId,
          theme,
          motionLevel,
          accentColor,
          hideBranding: hideBranding ?? false,
        })
        .returning();
      savedSettings = created;
    }

    revalidatePath("/dashboard/design");
    revalidatePath("/dashboard/preview");
    revalidatePath("/dashboard");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }

    return actionSuccess(savedSettings);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Updates the user's portfolio username with collision handling.
 * Revalidates old and new public paths.
 */
export async function updateUsernameAction(
  profileId: string,
  rawInput: unknown
): Promise<ActionResponse<{ username: string }>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    const parsed = updateUsernameSchema.safeParse(
      typeof rawInput === "string" ? { username: rawInput } : rawInput
    );

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid username format");
    }

    const newUsername = parsed.data.username;
    const oldUsername = profile.username;

    if (newUsername === oldUsername.toLowerCase()) {
      return actionSuccess({ username: oldUsername });
    }

    // Check collision across all profiles except current
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(
        and(
          eq(sql`lower(${profiles.username})`, newUsername),
          ne(profiles.id, profileId)
        )
      )
      .limit(1);

    if (existing) {
      throw AppError.conflict("This username is already taken");
    }

    await db
      .update(profiles)
      .set({
        username: newUsername,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId));

    // Revalidate old and new paths
    revalidatePath(`/${oldUsername}`);
    revalidatePath(`/${newUsername}`);
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");

    return actionSuccess({ username: newUsername });
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Toggles the public portfolio visibility flag (published vs draft).
 */
export async function togglePortfolioVisibilityAction(
  profileId: string,
  rawInput?: unknown
): Promise<ActionResponse<{ isPublished: boolean }>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);

    let nextPublished: boolean;
    if (rawInput !== undefined) {
      const parsed = toggleVisibilitySchema.safeParse(
        typeof rawInput === "boolean" ? { isPublished: rawInput } : rawInput
      );
      if (!parsed.success) {
        throw AppError.validation("Invalid visibility parameter");
      }
      nextPublished =
        parsed.data.isPublished !== undefined
          ? parsed.data.isPublished
          : !profile.isPublished;
    } else {
      nextPublished = !profile.isPublished;
    }

    await db
      .update(profiles)
      .set({
        isPublished: nextPublished,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId));

    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }
    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");

    return actionSuccess({ isPublished: nextPublished });
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Deletes the user account and cascades all associated data.
 */
export async function deleteAccountAction(
  profileId: string
): Promise<ActionResponse<{ deleted: true }>> {
  try {
    if (!profileId) {
      throw AppError.validation("Profile ID is required");
    }

    const { profile } = await requireProfileOwner(profileId);
    const { session } = await requireAuth();

    // Verify session user owns the profile being deleted
    if (session.user.id !== profile.userId) {
      throw AppError.forbidden("Cannot delete an account you do not own");
    }

    // Cascade delete via user table
    await db.delete(userTable).where(eq(userTable.id, session.user.id));

    return actionSuccess({ deleted: true });
  } catch (error) {
    return actionError(error);
  }
}
