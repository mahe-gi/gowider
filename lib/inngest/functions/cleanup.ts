import { inngest } from "../client";
import { lt, and, isNull, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { guestSessions, projects, projectOutputs } from "@/db/schema";
import { deleteR2Object } from "@/lib/r2/uploads";

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
        .returning();

      return expired.length;
    });

    // 2. Identify expired unowned guest drafts older than 48 hours and delete R2 media
    const deletedMediaCount = await step.run("cleanup-expired-guest-media", async () => {
      const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const expiredProjects = await db
        .select()
        .from(projects)
        .where(
          and(
            isNull(projects.userId),
            lt(projects.createdAt, threshold),
            eq(projects.status, "draft")
          )
        )
        .limit(50);

      let deletedCount = 0;

      for (const p of expiredProjects) {
        // Delete source video from R2
        if (p.sourceR2Key) {
          await deleteR2Object(p.sourceR2Key);
          deletedCount++;
        }

        // Delete any associated outputs from R2
        const outputs = await db
          .select()
          .from(projectOutputs)
          .where(eq(projectOutputs.projectId, p.id));

        for (const out of outputs) {
          if (out.videoR2Key) await deleteR2Object(out.videoR2Key);
          if (out.srtR2Key) await deleteR2Object(out.srtR2Key);
        }

        // Mark project and outputs expired
        await db
          .update(projects)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(projects.id, p.id));

        await db
          .update(projectOutputs)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(projectOutputs.projectId, p.id));
      }

      return deletedCount;
    });

    return { deletedSessions, deletedMediaCount };
  }
);
