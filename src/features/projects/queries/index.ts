import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { eq, and, asc, desc } from "drizzle-orm";
import type { Project } from "@/db/schema";

/**
 * Returns all projects for a given profile, sorted by sortOrder ascending, then createdAt descending.
 */
export async function getProjectsForProfile(
  profileId: string
): Promise<Project[]> {
  if (!profileId) return [];

  return db
    .select()
    .from(projects)
    .where(eq(projects.profileId, profileId))
    .orderBy(asc(projects.sortOrder), desc(projects.createdAt));
}

/**
 * Resolves a single project by ID, optionally scoped to a profileId.
 */
export async function getProjectById(
  projectId: string,
  profileId?: string
): Promise<Project | null> {
  if (!projectId) return null;

  const conditions = [eq(projects.id, projectId)];
  if (profileId) {
    conditions.push(eq(projects.profileId, profileId));
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(...conditions))
    .limit(1);

  return project ?? null;
}
