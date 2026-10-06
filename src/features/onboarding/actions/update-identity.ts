"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { requireAuth } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types";
import { updateIdentitySchema, type UpdateIdentityInput } from "../validation";
import { eq } from "drizzle-orm";
import type { Profile } from "@/db/schema";

export async function updateIdentityAction(
  input: UpdateIdentityInput
): Promise<ActionResponse<Profile>> {
  try {
    const { user } = await requireAuth();

    const validation = updateIdentitySchema.safeParse(input);
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message || "Invalid identity input";
      throw AppError.validation(message);
    }

    const { displayName, headline, location, bio } = validation.data;

    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!existingProfile) {
      throw AppError.notFound(
        "Profile not found. Please claim a username first."
      );
    }

    // Ownership check (profile.userId === user.id) is guaranteed by query
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        displayName,
        headline,
        location: location ? location.trim() : null,
        bio: bio ? bio.trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, existingProfile.id))
      .returning();

    return actionSuccess(updatedProfile);
  } catch (error) {
    return actionError(error);
  }
}
