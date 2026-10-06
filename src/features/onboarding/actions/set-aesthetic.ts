"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { portfolioSettings } from "@/db/schema/auxiliary";
import { requireAuth } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types";
import { setAestheticSchema, type SetAestheticInput } from "../validation";
import { eq } from "drizzle-orm";
import type { PortfolioSettings } from "@/db/schema";

const DEFAULT_THEME_ACCENTS: Record<string, string> = {
  cinema: "#E5E5E5",
  editorial: "#FF3B30",
  studio: "#2997FF",
};

export async function setAestheticAction(
  input: SetAestheticInput
): Promise<ActionResponse<PortfolioSettings>> {
  try {
    const { user } = await requireAuth();

    const validation = setAestheticSchema.safeParse(input);
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message || "Invalid aesthetic input";
      throw AppError.validation(message);
    }

    const { theme, motionLevel, accentColor } = validation.data;
    const finalAccent =
      accentColor || DEFAULT_THEME_ACCENTS[theme] || "#E5E5E5";

    // Get user profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!profile) {
      throw AppError.notFound(
        "Profile not found. Please complete previous onboarding steps."
      );
    }

    // Upsert portfolio_settings for profile
    const [existingSettings] = await db
      .select()
      .from(portfolioSettings)
      .where(eq(portfolioSettings.profileId, profile.id))
      .limit(1);

    if (existingSettings) {
      const [updated] = await db
        .update(portfolioSettings)
        .set({
          theme,
          motionLevel,
          accentColor: finalAccent,
          updatedAt: new Date(),
        })
        .where(eq(portfolioSettings.id, existingSettings.id))
        .returning();

      return actionSuccess(updated);
    }

    const [inserted] = await db
      .insert(portfolioSettings)
      .values({
        profileId: profile.id,
        theme,
        motionLevel,
        accentColor: finalAccent,
      })
      .returning();

    return actionSuccess(inserted);
  } catch (error) {
    return actionError(error);
  }
}
