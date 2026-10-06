"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects, profiles } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";

export async function unpublishProjectModerationAction(
  projectId: string
): Promise<ActionResponse<{ projectId: string; isPublished: boolean }>> {
  try {
    await requireAdmin();

    const [existingProject] = await db
      .select({
        id: projects.id,
        slug: projects.slug,
        profileId: projects.profileId,
      })
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      throw AppError.notFound("Project not found");
    }

    const [ownerProfile] = await db
      .select({
        username: profiles.username,
      })
      .from(profiles)
      .where(eq(profiles.id, existingProject.profileId))
      .limit(1);

    await db
      .update(projects)
      .set({ isPublished: false })
      .where(eq(projects.id, projectId));

    if (ownerProfile) {
      revalidatePath(`/${ownerProfile.username}`);
      revalidatePath(`/${ownerProfile.username}/work/${existingProject.slug}`);
    }
    revalidatePath("/explore");
    revalidatePath("/admin/projects");

    return actionSuccess({ projectId, isPublished: false });
  } catch (error) {
    return actionError(error);
  }
}
