"use server";

import { revalidatePath } from "next/cache";
import { eq, and, ne, sql, max } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { profiles } from "@/db/schema/profiles";
import { requireAuth, requireProfileOwner } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionSuccess, actionError, type ActionResponse } from "@/lib/types";
import { parseMediaUrl } from "@/features/media";
import {
  createProjectSchema,
  updateProjectSchema,
  reorderProjectsSchema,
} from "../validation";
import { resolveUniqueProjectSlug } from "../utils";
import { canPublishMoreProjects } from "@/features/billing/subscription-service";
import type { Project } from "@/db/schema";

/**
 * Creates a new project under the authenticated user's profile.
 */
export async function createProjectAction(
  rawInput: unknown
): Promise<ActionResponse<Project>> {
  try {
    const { session } = await requireAuth();

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (!profile) {
      throw AppError.notFound("Profile not found for current user");
    }

    const parsed = createProjectSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid project details");
    }

    const {
      title,
      sourceUrl,
      sourceType: explicitSourceType,
      thumbnailUrl,
      category,
      client,
      year,
      description,
      tools,
      featured,
      isPublished,
      slug: explicitSlug,
    } = parsed.data;

    // Detect media source type if not explicitly passed
    const parsedMedia = parseMediaUrl(sourceUrl);
    const sourceType = explicitSourceType || parsedMedia.sourceType;

    // Resolve deterministic unique slug
    const slug = explicitSlug
      ? explicitSlug
      : await resolveUniqueProjectSlug(profile.id, title);

    // Verify slug uniqueness if explicitly provided
    if (explicitSlug) {
      const [existingSlug] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(eq(projects.profileId, profile.id), eq(projects.slug, explicitSlug))
        )
        .limit(1);

      if (existingSlug) {
        throw AppError.conflict("A project with this slug already exists");
      }
    }

    // Determine dense sortOrder: append to end
    const [maxOrderResult] = await db
      .select({ maxOrder: max(projects.sortOrder) })
      .from(projects)
      .where(eq(projects.profileId, profile.id));

    const sortOrder =
      maxOrderResult?.maxOrder !== null && maxOrderResult?.maxOrder !== undefined
        ? maxOrderResult.maxOrder + 1
        : 0;

    // Enforce Pro tier project publishing limit
    if (isPublished) {
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(
          and(eq(projects.profileId, profile.id), eq(projects.isPublished, true))
        );
      const currentCount = countResult?.count ?? 0;
      const gate = await canPublishMoreProjects(profile.id, currentCount);
      if (!gate.allowed) {
        throw AppError.forbidden(
          gate.message ||
            "Free plan limit reached. Upgrade to GoWider Pro for unlimited projects."
        );
      }
    }

    const publishedAt = isPublished ? new Date() : null;

    const [newProject] = await db
      .insert(projects)
      .values({
        profileId: profile.id,
        slug,
        title,
        description: description || null,
        sourceType,
        sourceUrl,
        thumbnailUrl: thumbnailUrl || null,
        category,
        client: client || null,
        year: year || null,
        tools: tools || [],
        featured: featured ?? false,
        isPublished: isPublished ?? false,
        publishedAt,
        sortOrder,
      })
      .returning();

    revalidatePath("/dashboard/work");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
    }

    return actionSuccess(newProject);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Updates an existing project.
 * Strictly enforces slug immutability once published_at IS NOT NULL.
 */
export async function updateProjectAction(
  rawInput: unknown
): Promise<ActionResponse<Project>> {
  try {
    const parsed = updateProjectSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid project details");
    }

    const { id, slug, isPublished, ...rest } = parsed.data;

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (!existing) {
      throw AppError.notFound("Project not found");
    }

    const { profile } = await requireProfileOwner(existing.profileId);

    // Published slug immutability enforcement
    if (existing.publishedAt !== null && slug !== undefined && slug !== existing.slug) {
      throw AppError.validation(
        "Published project slugs are immutable and cannot be changed"
      );
    }

    let nextSlug = existing.slug;
    if (slug !== undefined && slug !== existing.slug) {
      const [conflict] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(
          and(
            eq(projects.profileId, existing.profileId),
            eq(projects.slug, slug),
            ne(projects.id, existing.id)
          )
        )
        .limit(1);

      if (conflict) {
        throw AppError.conflict("A project with this slug already exists");
      }
      nextSlug = slug;
    }

    // Publish state lifecycle:
    // When isPublished transitions to true and project has never been published before, stamp publishedAt = now().
    // Never reset publishedAt to null if isPublished transitions to false.
    let publishedAt = existing.publishedAt;
    const nextIsPublished =
      isPublished !== undefined ? isPublished : existing.isPublished;

    if (nextIsPublished && !publishedAt) {
      publishedAt = new Date();
    }

    const updatePayload: Partial<typeof projects.$inferInsert> = {
      ...rest,
      slug: nextSlug,
      isPublished: nextIsPublished,
      publishedAt,
      updatedAt: new Date(),
    };

    if (rest.sourceUrl && !rest.sourceType) {
      const parsedMedia = parseMediaUrl(rest.sourceUrl);
      updatePayload.sourceType = parsedMedia.sourceType;
    }

    const [updated] = await db
      .update(projects)
      .set(updatePayload)
      .where(eq(projects.id, id))
      .returning();

    revalidatePath("/dashboard/work");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
      revalidatePath(`/${profile.username}/work/${existing.slug}`);
      if (nextSlug !== existing.slug) {
        revalidatePath(`/${profile.username}/work/${nextSlug}`);
      }
    }

    return actionSuccess(updated);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Toggles a project's published state.
 * Stamps published_at = now() on first publication, never resets to null.
 */
export async function toggleProjectPublishAction(
  projectId: string
): Promise<ActionResponse<Project>> {
  try {
    if (!projectId) {
      throw AppError.validation("Project ID is required");
    }

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existing) {
      throw AppError.notFound("Project not found");
    }

    const { profile } = await requireProfileOwner(existing.profileId);

    const nextIsPublished = !existing.isPublished;
    let publishedAt = existing.publishedAt;

    if (nextIsPublished) {
      // Enforce Pro tier project publishing limit
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(projects)
        .where(
          and(eq(projects.profileId, existing.profileId), eq(projects.isPublished, true))
        );
      const currentCount = countResult?.count ?? 0;
      const gate = await canPublishMoreProjects(existing.profileId, currentCount);
      if (!gate.allowed) {
        throw AppError.forbidden(
          gate.message ||
            "Free plan limit reached. Upgrade to GoWider Pro for unlimited projects."
        );
      }

      if (!publishedAt) {
        publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(projects)
      .set({
        isPublished: nextIsPublished,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    revalidatePath("/dashboard/work");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
      revalidatePath(`/${profile.username}/work/${existing.slug}`);
    }

    return actionSuccess(updated);
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Concurrency-safe project reordering via pg_advisory_xact_lock.
 * Validates IDs belonging to profile and assigns dense 0..N-1 sort orders.
 */
export async function reorderProjectsAction(
  rawInput: unknown
): Promise<ActionResponse<{ reordered: true; count: number }>> {
  try {
    const parsed = reorderProjectsSchema.safeParse(rawInput);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw AppError.validation(issue?.message || "Invalid reorder parameters");
    }

    const { profileId, projectIds } = parsed.data;
    await requireProfileOwner(profileId);

    return await db.transaction(async (tx) => {
      // Transaction-level advisory lock on hashed profile UUID
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtext(${profileId}))`
      );

      // Validate all IDs belong to this profile
      const currentProjects = await tx
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.profileId, profileId));

      const currentIdSet = new Set(currentProjects.map((p) => p.id));

      if (projectIds.length !== currentProjects.length) {
        throw AppError.validation(
          "Project list count does not match current profile projects count"
        );
      }

      for (const id of projectIds) {
        if (!currentIdSet.has(id)) {
          throw AppError.validation(
            `Project ID ${id} does not belong to this profile`
          );
        }
      }

      // Assign dense 0..N-1 sortOrder
      for (let i = 0; i < projectIds.length; i++) {
        await tx
          .update(projects)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(
            and(
              eq(projects.id, projectIds[i]),
              eq(projects.profileId, profileId)
            )
          );
      }

      revalidatePath("/dashboard/work");
      revalidatePath("/dashboard/preview");

      return actionSuccess({ reordered: true, count: projectIds.length });
    });
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Deletes a project and removes it from the profile.
 */
export async function deleteProjectAction(
  projectId: string
): Promise<ActionResponse<{ deleted: true; id: string }>> {
  try {
    if (!projectId) {
      throw AppError.validation("Project ID is required");
    }

    const [existing] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!existing) {
      throw AppError.notFound("Project not found");
    }

    const { profile } = await requireProfileOwner(existing.profileId);

    await db.delete(projects).where(eq(projects.id, projectId));

    revalidatePath("/dashboard/work");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/preview");
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
      revalidatePath(`/${profile.username}/work/${existing.slug}`);
    }

    return actionSuccess({ deleted: true, id: projectId });
  } catch (error) {
    return actionError(error);
  }
}
