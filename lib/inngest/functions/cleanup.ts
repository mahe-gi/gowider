import { inngest } from "../client";
import { lt, and, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { guestSessions, projects } from "@/db/schema";

export const mediaCleanupWorkflow = inngest.createFunction(
  { id: "gowider-media-cleanup" },
  { cron: "0 2 * * *" }, // Run daily at 2 AM
  async ({ step }) => {
    // 1. Delete expired guest sessions
    const deletedSessions = await step.run("delete-expired-guest-sessions", async () => {
      const now = new Date();
      const expired = await db
        .delete(guestSessions)
        .where(lt(guestSessions.expiresAt, now))
        .returning({ id: guestSessions.id });

      return expired.length;
    });

    // 2. Mark stale draft projects older than 48 hours as failed/expired
    const staleDrafts = await step.run("cleanup-stale-drafts", async () => {
      const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const stale = await db
        .update(projects)
        .set({ status: "failed", updatedAt: new Date() })
        .where(and(isNull(projects.userId), lt(projects.createdAt, threshold)));

      return stale;
    });

    return { deletedSessions, staleDrafts };
  }
);
