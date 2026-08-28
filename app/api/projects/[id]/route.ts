import { NextResponse } from "next/server";
import { eq, desc, and, isNull, or, lt, not, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { db } from "@/lib/db";
import { projects, generationRuns, projectOutputs } from "@/db/schema";
import { createPresignedDownloadUrl } from "@/lib/r2/outputs";
import { deleteR2Object } from "@/lib/r2/uploads";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const session = await auth();
    const access = await assertProjectAccess(projectId, session?.user?.id);

    if (!access.hasAccess || !access.project || access.project.deletedAt || access.project.deletionStartedAt) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "That Reel isn't here." } },
        { status: 404 }
      );
    }

    const project = access.project;

    // Fetch outputs
    const outputs = await db
      .select()
      .from(projectOutputs)
      .where(eq(projectOutputs.projectId, project.id));

    // Fetch latest generation run
    const [latestRun] = await db
      .select()
      .from(generationRuns)
      .where(eq(generationRuns.projectId, project.id))
      .orderBy(desc(generationRuns.createdAt))
      .limit(1);

    // Create a temporary 15-min presigned URL for previewing the original source video
    let sourcePreviewUrl: string | undefined;
    try {
      sourcePreviewUrl = await createPresignedDownloadUrl({
        key: project.sourceR2Key,
        expiresInSeconds: 900,
      });
    } catch {
      // If storage credentials not set in dev, ignore
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        sourcePreviewUrl,
        outputs,
        latestRun,
      },
    });
  } catch (error: any) {
    console.error("Fetch project error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: error.message || "Failed to retrieve project." } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to delete this Reel." } },
        { status: 401 }
      );
    }

    const access = await assertProjectAccess(projectId, session.user.id, true);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "That Reel isn't here." } },
        { status: 404 }
      );
    }

    const project = access.project;

    // Idempotent fast-path if already fully deleted
    if (project.deletedAt) {
      return NextResponse.json({
        success: true,
        message: "Reel deleted successfully.",
        alreadyDeleted: true,
      });
    }

    const claimToken = `del_claim_${nanoid(16)}`;
    const staleClaimThreshold = new Date(Date.now() - 120 * 1000); // 120s lease for safe multi-file R2 deletion

    // 1. Durable PostgreSQL Deletion Claim
    // Atomically claim deletion lease. Stale claims (>120s) can be safely reclaimed.
    const [claimedProject] = await db
      .update(projects)
      .set({
        deletionStartedAt: new Date(),
        deletionClaimToken: claimToken,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.userId, session.user.id),
          isNull(projects.deletedAt),
          not(inArray(projects.status, ["processing", "uploading"])),
          or(
            isNull(projects.deletionStartedAt),
            lt(projects.deletionStartedAt, staleClaimThreshold)
          )
        )
      )
      .returning();

    if (!claimedProject) {
      // Re-inspect DB row to determine why claim was not acquired
      const [currentProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

      if (!currentProject || currentProject.deletedAt) {
        return NextResponse.json({
          success: true,
          message: "Reel deleted successfully.",
          alreadyDeleted: true,
        });
      }

      if (currentProject.status === "processing" || currentProject.status === "uploading") {
        return NextResponse.json(
          {
            error: {
              code: "LOCALIZATION_IN_PROGRESS",
              message: "Localization is currently in progress. You can delete this Reel once processing finishes.",
            },
          },
          { status: 400 }
        );
      }

      // Another concurrent DELETE holds the active deletion lease: wait briefly and converge
      const startWait = Date.now();
      while (Date.now() - startWait < 6000) {
        await new Promise((r) => setTimeout(r, 200));
        const [pollProj] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
        if (!pollProj || pollProj.deletedAt) {
          return NextResponse.json({
            success: true,
            message: "Reel deleted successfully.",
            alreadyDeleted: true,
          });
        }
      }

      // If still not deleted, return non-terminal HTTP 202
      return NextResponse.json(
        {
          success: false,
          status: "deletion_in_progress",
          message: "Deletion is still in progress.",
        },
        { status: 202 }
      );
    }

    // 2. Check latest generation run status: Prevent deleting while provider processing is active
    const [latestRun] = await db
      .select()
      .from(generationRuns)
      .where(eq(generationRuns.projectId, project.id))
      .orderBy(desc(generationRuns.createdAt))
      .limit(1);

    const activeRunStatuses = ["queued", "uploading_to_sarvam", "processing", "exporting"];
    const isRunActive = latestRun && activeRunStatuses.includes(latestRun.status);

    if (isRunActive) {
      // Release deletion claim using fencing token if active run was detected
      await db
        .update(projects)
        .set({ deletionStartedAt: null, deletionClaimToken: null, updatedAt: new Date() })
        .where(and(eq(projects.id, projectId), eq(projects.deletionClaimToken, claimToken)));

      return NextResponse.json(
        {
          error: {
            code: "LOCALIZATION_IN_PROGRESS",
            message: "Localization is currently in progress. You can delete this Reel once processing finishes.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Cancel any pending 'awaiting_payment' runs so concurrent/future payments do not auto-resume this deleted Reel
    await db
      .update(generationRuns)
      .set({
        status: "cancelled",
        errorMessage: "Project was deleted before payment completed.",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(generationRuns.projectId, projectId), eq(generationRuns.status, "awaiting_payment")));

    // 4. Fetch all associated output media keys
    const outputs = await db
      .select()
      .from(projectOutputs)
      .where(eq(projectOutputs.projectId, projectId));

    const mediaKeysToDelete: string[] = [];
    if (claimedProject.sourceR2Key) mediaKeysToDelete.push(claimedProject.sourceR2Key);

    for (const out of outputs) {
      if (out.videoR2Key) mediaKeysToDelete.push(out.videoR2Key);
      if (out.srtR2Key) mediaKeysToDelete.push(out.srtR2Key);
    }

    // 5. Delete ALL media objects from private storage (outside DB transaction)
    const deletionResults = await Promise.allSettled(
      mediaKeysToDelete.map((key) => deleteR2Object(key))
    );

    const failedDeletions = deletionResults.filter((r) => r.status === "rejected");
    if (failedDeletions.length > 0) {
      const firstError = (failedDeletions[0] as PromiseRejectedResult).reason;
      console.error(
        `[Delete R2 Error] Failed to delete ${failedDeletions.length} media object(s) for project ${projectId}:`,
        firstError?.message || firstError
      );

      // Release claim lease using fencing token so user can retry deletion immediately
      await db
        .update(projects)
        .set({ deletionStartedAt: null, deletionClaimToken: null, updatedAt: new Date() })
        .where(and(eq(projects.id, projectId), eq(projects.deletionClaimToken, claimToken)));

      return NextResponse.json(
        {
          error: {
            code: "STORAGE_DELETE_FAILED",
            message: "Failed to delete one or more media files from storage. Metadata has been preserved for retry.",
          },
        },
        { status: 500 }
      );
    }

    // 6. Atomic PostgreSQL Transaction: Fencing token check + Delete projectOutputs + Mark project soft-deleted
    await db.transaction(async (tx) => {
      const [updatedProject] = await tx
        .update(projects)
        .set({
          deletedAt: new Date(),
          status: "expired",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(projects.id, projectId),
            eq(projects.deletionClaimToken, claimToken),
            isNull(projects.deletedAt)
          )
        )
        .returning();

      if (!updatedProject) {
        throw new Error("DELETION_CLAIM_LOST: Deletion lease was reclaimed by another worker or expired.");
      }

      await tx.delete(projectOutputs).where(eq(projectOutputs.projectId, projectId));
    });

    return NextResponse.json({
      success: true,
      message: "Reel deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: error.message || "Failed to delete Reel." } },
      { status: 500 }
    );
  }
}
