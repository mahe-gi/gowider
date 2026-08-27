import "server-only";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, type Project } from "@/db/schema";
import { getCurrentGuestSessionId } from "./guest";

export interface ProjectAccessResult {
  hasAccess: boolean;
  project?: Project;
  isOwner: boolean;
  accessType: "user" | "guest" | "none";
}

export async function assertProjectAccess(
  projectId: string,
  userId?: string | null
): Promise<ProjectAccessResult> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return { hasAccess: false, isOwner: false, accessType: "none" };
  }

  // 1. Check Authenticated User Ownership
  if (userId && project.userId === userId) {
    return { hasAccess: true, project, isOwner: true, accessType: "user" };
  }

  // 2. Check Guest Ownership
  const currentGuestSessionId = await getCurrentGuestSessionId();
  if (
    currentGuestSessionId &&
    project.guestSessionId === currentGuestSessionId &&
    !project.userId // If project is already claimed by a user, guest cookie is insufficient
  ) {
    return { hasAccess: true, project, isOwner: true, accessType: "guest" };
  }

  return { hasAccess: false, project, isOwner: false, accessType: "none" };
}
