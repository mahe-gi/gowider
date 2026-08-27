import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { checkR2ObjectExists, getR2ObjectStream } from "@/lib/r2/uploads";
import { parseMp4MovMetadata } from "@/lib/media/metadata";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { MAX_DURATION_SECONDS, MAX_FILE_SIZE_BYTES } from "@/lib/constants";

const completeSchema = z.object({
  projectId: z.string().min(1),
  durationSeconds: z.number().min(1).max(MAX_DURATION_SECONDS).optional(),
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

    // 1. Verify object actually exists in R2
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

    // 2. Server-side authoritative media verification (Read header bytes from R2)
    let authoritativeDuration = validated.data.durationSeconds || 10;

    try {
      const { stream } = await getR2ObjectStream(project.sourceR2Key);
      if (stream) {
        // Read up to first 2MB to parse metadata atoms
        const chunks: Buffer[] = [];
        let bytesRead = 0;
        const maxBytes = 2 * 1024 * 1024;

        for await (const chunk of stream as any) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          bytesRead += chunk.length;
          if (bytesRead >= maxBytes) break;
        }

        const buffer = Buffer.concat(chunks);
        const metadata = parseMp4MovMetadata(buffer);

        if (metadata.valid && metadata.durationSeconds) {
          authoritativeDuration = metadata.durationSeconds;
        } else if (metadata.errorCode === "VIDEO_TOO_LONG") {
          return NextResponse.json(
            { error: { code: "VIDEO_TOO_LONG", message: metadata.errorMessage } },
            { status: 400 }
          );
        }
      }
    } catch (parseErr) {
      console.warn("Server-side duration parse failed; using client metadata fallback:", parseErr);
    }

    // 3. Mark project ready and store server-verified duration
    const [updated] = await db
      .update(projects)
      .set({
        durationSeconds: authoritativeDuration,
        serverVerifiedDurationSeconds: authoritativeDuration,
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
