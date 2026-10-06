"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema/profiles";
import { projects } from "@/db/schema/projects";
import { requireAuth } from "@/lib/auth-guards";
import { AppError } from "@/lib/errors";
import { actionError, actionSuccess, type ActionResponse } from "@/lib/types";
import { parseMediaUrl } from "@/features/media";
import { createFirstProjectSchema, type CreateFirstProjectInput } from "../validation";
import { eq } from "drizzle-orm";
import type { Project } from "@/db/schema";
import { generateDeterministicProjectSlug } from "../utils";

export async function createFirstProjectAction(
  input: CreateFirstProjectInput
): Promise<ActionResponse<Project>> {
  try {
    const { user } = await requireAuth();

    const validation = createFirstProjectSchema.safeParse(input);
    if (!validation.success) {
      const message =
        validation.error.issues[0]?.message || "Invalid project input";
      throw AppError.validation(message);
    }

    const { title, sourceUrl, category, client, year, tools } = validation.data;

    // Validate and parse media URL
    const parsedMedia = parseMediaUrl(sourceUrl);

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

    // Insert project with deterministic slug and retry-on-23505 loop
    let insertedProject: Project | null = null;
    const maxAttempts = 10;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const slug = generateDeterministicProjectSlug(title, attempt);

      try {
        const [project] = await db
          .insert(projects)
          .values({
            profileId: profile.id,
            slug,
            title,
            description: null,
            sourceType: parsedMedia.sourceType,
            sourceUrl: parsedMedia.canonicalUrl,
            thumbnailUrl: parsedMedia.thumbnailUrl,
            category,
            client: client ? client.trim() : null,
            year: year || null,
            tools: tools || [],
            featured: true,
            isPublished: false,
            publishedAt: null,
            sortOrder: 0,
          })
          .returning();

        insertedProject = project;
        break;
      } catch (dbErr: unknown) {
        const pgCode = (dbErr as { code?: string })?.code;
        // Postgres 23505 = unique_violation (e.g. uq_profile_project_slug)
        if (pgCode === "23505") {
          continue;
        }
        throw dbErr;
      }
    }

    if (!insertedProject) {
      throw AppError.conflict(
        "Could not generate a unique slug for this project. Please try a different title."
      );
    }

    return actionSuccess(insertedProject);
  } catch (error) {
    return actionError(error);
  }
}
