"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";

export async function unpublishProfileModerationAction(
  profileId: string
): Promise<ActionResponse<{ profileId: string; isPublished: boolean }>> {
  try {
    await requireAdmin();

    const [existingProfile] = await db
      .select({
        id: profiles.id,
        username: profiles.username,
      })
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    if (!existingProfile) {
      throw AppError.notFound("Profile not found");
    }

    await db
      .update(profiles)
      .set({ isPublished: false })
      .where(eq(profiles.id, profileId));

    revalidatePath(`/${existingProfile.username}`);
    revalidatePath("/explore");
    revalidatePath("/admin/profiles");

    return actionSuccess({ profileId, isPublished: false });
  } catch (error) {
    return actionError(error);
  }
}
