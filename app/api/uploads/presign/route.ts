import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth/auth";
import { createPresignedUploadUrl } from "@/lib/r2/uploads";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from "@/lib/constants";
import { checkRateLimit } from "@/lib/security/rate-limit";

const presignSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(ACCEPTED_MIME_TYPES, {
    errorMap: () => ({ message: "Only MP4 and MOV files are supported." }),
  }),
  fileSizeBytes: z.number().max(MAX_FILE_SIZE_BYTES, "Video size must not exceed 100 MB."),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Sign in to upload Reels." } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const body = await req.json();
    const validated = presignSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    // Rate Limit: Max 20 presigns per 5 minutes per user
    const rateCheck = await checkRateLimit(`rate:presign:${userId}`, 20, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Upload rate limit exceeded. Please wait a moment." } },
        { status: 429 }
      );
    }

    const projectId = `proj_${nanoid(16)}`;
    const randomFileId = nanoid(12);
    const ext = validated.data.contentType === "video/quicktime" ? "mov" : "mp4";
    const sourceR2Key = `sources/${userId}/${projectId}/${randomFileId}.${ext}`;

    // Generate short-lived upload target URL (R2 presigned PUT or authenticated local storage target)
    const uploadUrl = await createPresignedUploadUrl({
      key: sourceR2Key,
      contentType: validated.data.contentType,
      expiresInSeconds: 600, // 10 minutes
    });

    // Create draft project in PostgreSQL owned by session user
    await db.insert(projects).values({
      id: projectId,
      userId,
      displayName: validated.data.fileName,
      sourceR2Key,
      sourceFileName: validated.data.fileName,
      sourceMimeType: validated.data.contentType,
      sourceFileSizeBytes: validated.data.fileSizeBytes,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        projectId,
        uploadUrl,
        key: sourceR2Key,
      },
    });
  } catch (error: any) {
    console.error("Presign upload error:", error);
    return NextResponse.json(
      { error: { code: "PRESIGN_FAILED", message: error.message || "Failed to generate upload URL." } },
      { status: 500 }
    );
  }
}
