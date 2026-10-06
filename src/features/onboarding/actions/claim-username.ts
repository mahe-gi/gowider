"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { requireAuth } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types";
import { claimUsernameSchema } from "../validation";
import { isReservedUsername, normalizeUsername } from "../constants";
import { enforceRateLimit } from "../rate-limit";
import { eq } from "drizzle-orm";
import type { Profile } from "@/db/schema";

export async function checkUsernameAvailabilityAction(
  rawUsername: string
): Promise<ActionResponse<{ available: boolean; reason?: string }>> {
  try {
    const normalized = normalizeUsername(rawUsername);

    if (!normalized || normalized.length < 3) {
      return actionSuccess({
        available: false,
        reason: "Must be at least 3 characters",
      });
    }

    if (normalized.length > 30) {
      return actionSuccess({
        available: false,
        reason: "Must not exceed 30 characters",
      });
    }

    const parseResult = claimUsernameSchema.safeParse({ username: normalized });
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return actionSuccess({
        available: false,
        reason: issue?.message || "Invalid format",
      });
    }

    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.username, normalized))
      .limit(1);

    if (existing) {
      return actionSuccess({
        available: false,
        reason: "Username is already taken",
      });
    }

    return actionSuccess({ available: true });
  } catch (error) {
    return actionError(error);
  }
}

export async function claimUsernameAction(
  rawUsername: string
): Promise<ActionResponse<Profile>> {
  try {
    const { user } = await requireAuth();

    // Enforce rate limit (30 req/min per user)
    enforceRateLimit(`claim-username:${user.id}`, 30, 60 * 1000);

    const validation = claimUsernameSchema.safeParse({ username: rawUsername });
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message || "Invalid username format";
      throw AppError.validation(message);
    }

    const username = validation.data.username;

    if (isReservedUsername(username)) {
      throw AppError.conflict("This username is reserved and cannot be claimed");
    }

    // Check if user already has a profile
    const [existingUserProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (existingUserProfile) {
      // If user already claimed a username, check if they are trying to update or if it's already set
      if (existingUserProfile.username === username) {
        return actionSuccess(existingUserProfile);
      }
      // If not published yet, allow updating the username
      if (!existingUserProfile.isPublished) {
        try {
          const [updated] = await db
            .update(profiles)
            .set({ username, updatedAt: new Date() })
            .where(eq(profiles.id, existingUserProfile.id))
            .returning();
          return actionSuccess(updated);
        } catch (dbErr: unknown) {
          const pgCode = (dbErr as { code?: string })?.code;
          if (pgCode === "23505") {
            throw AppError.conflict("Username is already taken");
          }
          throw dbErr;
        }
      }
      throw AppError.conflict("Profile already exists and cannot be re-claimed");
    }

    // Insert new profile row
    try {
      const [newProfile] = await db
        .insert(profiles)
        .values({
          userId: user.id,
          username,
          displayName: user.name || username,
          headline: "Video Editor & Filmmaker",
          isPublished: false,
        })
        .returning();

      return actionSuccess(newProfile);
    } catch (dbErr: unknown) {
      const pgCode = (dbErr as { code?: string })?.code;
      if (pgCode === "23505") {
        throw AppError.conflict("Username is already taken");
      }
      throw dbErr;
    }
  } catch (error) {
    return actionError(error);
  }
}
