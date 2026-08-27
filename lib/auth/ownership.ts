import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, type Project } from "@/db/schema";

export interface ProjectAccessResult {
  hasAccess: boolean;
  project?: Project;
  isOwner: boolean;
}

/**
 * Enforces strict user isolation across all project-related operations.
 * Non-owners and unauthenticated requests receive hasAccess: false.
 */
export async function assertProjectAccess(
  projectId: string,
  userId?: string | null
): Promise<ProjectAccessResult> {
  if (!userId || !projectId) {
    return { hasAccess: false, isOwner: false };
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return { hasAccess: false, isOwner: false };
  }

  // Strict ownership check: Must belong to authenticated user
  if (project.userId === userId) {
    return { hasAccess: true, project, isOwner: true };
  }

  return { hasAccess: false, isOwner: false };
}
