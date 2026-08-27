import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { storage } from "@/lib/storage";
import { parseMediaFromStorage } from "@/lib/media/metadata";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";

const completeSchema = z.object({
  projectId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to complete upload." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = completeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const access = await assertProjectAccess(validated.data.projectId, session.user.id);
    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found or access denied." } },
        { status: 404 }
      );
    }

    const project = access.project;

    // 1. Verify object actually exists in storage & check size
    const headCheck = await storage.checkObjectExists(project.sourceR2Key);
    if (!headCheck.exists || !headCheck.sizeBytes) {
      return NextResponse.json(
        { error: { code: "OBJECT_NOT_FOUND", message: "Video file was not found in storage. Please try uploading again." } },
        { status: 404 }
      );
    }

    if (headCheck.sizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: "Uploaded file exceeds 100 MB limit." } },
        { status: 400 }
      );
    }

    // 2. Server-side authoritative media verification via random-access range reading
    const metadata = await parseMediaFromStorage(storage, project.sourceR2Key, headCheck.sizeBytes);

    if (!metadata.valid || !metadata.durationSeconds) {
      return NextResponse.json(
        {
          error: {
            code: metadata.errorCode || "VIDEO_METADATA_INVALID",
            message: metadata.errorMessage || "Unable to verify video duration. Please upload a valid MP4 or MOV file.",
          },
        },
        { status: 400 }
      );
    }

    const authoritativeDuration = metadata.durationSeconds;

    // 3. Mark project ready and store server-verified duration
    const [updated] = await db
      .update(projects)
      .set({
        durationSeconds: authoritativeDuration,
        serverVerifiedDurationSeconds: authoritativeDuration,
        sourceFileSizeBytes: headCheck.sizeBytes,
        status: "ready",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project.id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("Complete upload error:", error);
    return NextResponse.json(
      { error: { code: "COMPLETE_FAILED", message: error.message || "Failed to complete upload." } },
      { status: 500 }
    );
  }
}
