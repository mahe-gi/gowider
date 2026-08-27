import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { checkR2ObjectExists } from "@/lib/r2/uploads";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { MAX_DURATION_SECONDS, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

const completeSchema = z.object({
  projectId: z.string().min(1),
  durationSeconds: z.number().min(1).max(MAX_DURATION_SECONDS, `Duration must be under ${MAX_DURATION_SECONDS} seconds.`),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = completeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const session = await auth();
    const access = await assertProjectAccess(validated.data.projectId, session?.user?.id);

    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "You do not have access to this project." } },
        { status: 403 }
      );
    }

    const project = access.project;

    // Verify object actually exists in R2
    const headCheck = await checkR2ObjectExists(project.sourceR2Key);
    if (!headCheck.exists) {
      return NextResponse.json(
        { error: { code: "OBJECT_NOT_FOUND", message: "Video file was not found in storage. Please try uploading again." } },
        { status: 404 }
      );
    }

    if (headCheck.sizeBytes && headCheck.sizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: { code: "FILE_TOO_LARGE", message: "Uploaded file exceeds 100 MB limit." } },
        { status: 400 }
      );
    }

    // Mark project ready
    const [updated] = await db
      .update(projects)
      .set({
        durationSeconds: Math.ceil(validated.data.durationSeconds),
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
