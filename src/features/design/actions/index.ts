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
import { isUniqueConstraintError } from "@/lib/db-errors";
import {
  portfolioSettingsSchema,
  updateUsernameSchema,
  toggleVisibilitySchema,
} from "../validation";
import type { PortfolioSettings } from "@/db/schema";

import { isProProfile } from "@/features/billing/subscription-service";

const PRO_THEMES = ["noir", "vogue", "atelier", "cyber"];

/**
 * Updates or upserts portfolio appearance settings (theme, motionLevel, accentColor, hideBranding, spotlight, CTA).
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

    const {
      theme,
      motionLevel,
      accentColor,
      hideBranding,
      spotlightProjectId,
      ctaEnabled,
      ctaLabel,
      ctaUrl,
    } = parsed.data;

    const isPro = await isProProfile(profileId);

    // Enforce Pro tier gate for Pro-exclusive themes (Noir, Vogue, Atelier, Cyber)
    if (theme && PRO_THEMES.includes(theme) && !isPro) {
      const themeNames: Record<string, string> = {
        noir: "Noir",
        vogue: "Vogue",
        atelier: "Atelier",
        cyber: "Cyber",
      };
      throw AppError.forbidden(
        `The ${themeNames[theme] || theme} theme is exclusive to GoWider Pro creators. Upgrade to GoWider Pro to activate it.`
      );
    }

    // Enforce Pro tier gate for hiding GoWider branding
    if (hideBranding === true && !isPro) {
      throw AppError.forbidden(
        "Removing GoWider branding is a Pro tier feature. Upgrade to GoWider Pro to hide the badge."
      );
    }

    // Enforce Pro tier gate for Hero Showreel Spotlight
    if (spotlightProjectId && !isPro) {
      throw AppError.forbidden(
        "Hero Showreel Spotlight is a Pro tier feature. Upgrade to GoWider Pro to pin your signature showreel."
      );
    }

    // Enforce Pro tier gate for Direct Client Booking CTA
    if (ctaEnabled === true && !isPro) {
      throw AppError.forbidden(
        "Direct Client Booking & Inquiry Action Button is a Pro tier feature. Upgrade to GoWider Pro to activate."
      );
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
          spotlightProjectId: isPro
            ? spotlightProjectId !== undefined
              ? spotlightProjectId
              : existingSettings.spotlightProjectId
            : null,
          ctaEnabled: isPro
            ? ctaEnabled ?? existingSettings.ctaEnabled
            : false,
          ctaLabel: isPro
            ? ctaLabel !== undefined
              ? ctaLabel
              : existingSettings.ctaLabel
            : null,
          ctaUrl: isPro
            ? ctaUrl !== undefined
              ? ctaUrl
              : existingSettings.ctaUrl
            : null,
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
          hideBranding: isPro ? (hideBranding ?? false) : false,
          spotlightProjectId: isPro ? (spotlightProjectId ?? null) : null,
          ctaEnabled: isPro ? (ctaEnabled ?? false) : false,
          ctaLabel: isPro ? (ctaLabel ?? null) : null,
          ctaUrl: isPro ? (ctaUrl ?? null) : null,
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

    try {
      await db
        .update(profiles)
        .set({
          username: newUsername,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, profileId));
    } catch (dbErr: unknown) {
      if (isUniqueConstraintError(dbErr)) {
        throw AppError.conflict("That username is already taken. Please choose another.");
      }
      throw dbErr;
    }

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
