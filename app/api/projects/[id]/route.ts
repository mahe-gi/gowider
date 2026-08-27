import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
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

    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found or access denied." } },
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
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Sign in to delete project." } }, { status: 401 });
    }

    const access = await assertProjectAccess(projectId, session.user.id);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Project not found or access denied." } }, { status: 404 });
    }

    const project = access.project;

    // Prevent deleting while localization is actively processing in background
    if (project.status === "processing" || project.status === "uploading") {
      return NextResponse.json(
        { error: { code: "PROJECT_PROCESSING", message: "Cannot delete a project while localization is in progress." } },
        { status: 400 }
      );
    }

    // 1. Delete associated media from storage
    if (project.sourceR2Key) {
      await deleteR2Object(project.sourceR2Key).catch(() => {});
    }

    // 2. Delete database records
    await db.delete(projectOutputs).where(eq(projectOutputs.projectId, projectId));
    await db.delete(generationRuns).where(eq(generationRuns.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true, message: "Project deleted successfully." });
  } catch (error: any) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: { code: "DELETE_FAILED", message: error.message || "Failed to delete project." } },
      { status: 500 }
    );
  }
}
