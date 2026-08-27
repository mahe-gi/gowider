import "server-only";
import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { getCurrentGuestSessionId } from "./guest";

export async function mergeGuestProjectsToUser(userId: string): Promise<{ mergedCount: number; projectIds: string[] }> {
  const guestSessionId = await getCurrentGuestSessionId();
  if (!guestSessionId) {
    return { mergedCount: 0, projectIds: [] };
  }

  // Find all projects belonging to this guest session that are not yet claimed
  const guestProjects = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.guestSessionId, guestSessionId), isNull(projects.userId)));

  if (guestProjects.length === 0) {
    return { mergedCount: 0, projectIds: [] };
  }

  const projectIds = guestProjects.map((p) => p.id);

  // Transfer ownership to user
  await db
    .update(projects)
    .set({
      userId,
      guestSessionId: null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.guestSessionId, guestSessionId), isNull(projects.userId)));

  return { mergedCount: projectIds.length, projectIds };
}
