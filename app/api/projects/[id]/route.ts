import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { db } from "@/lib/db";
import { generationRuns, projectOutputs } from "@/db/schema";
import { createPresignedDownloadUrl } from "@/lib/r2/outputs";

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
      // If R2 credentials not set in dev, ignore
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
