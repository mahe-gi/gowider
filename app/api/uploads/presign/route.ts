import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth/auth";
import { getOrCreateGuestSession } from "@/lib/auth/guest";
import { createPresignedUploadUrl } from "@/lib/r2/uploads";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from "@/lib/constants";

const presignSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.enum(ACCEPTED_MIME_TYPES, {
    errorMap: () => ({ message: "Only MP4 and MOV files are supported." }),
  }),
  fileSizeBytes: z.number().max(MAX_FILE_SIZE_BYTES, "Video size must not exceed 100 MB."),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = presignSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const session = await auth();
    let userId: string | undefined = session?.user?.id;
    let guestSessionId: string | undefined;

    if (!userId) {
      const guest = await getOrCreateGuestSession();
      guestSessionId = guest.sessionId;
    }

    const projectId = `proj_${nanoid(16)}`;
    const randomFileId = nanoid(12);
    const ext = validated.data.contentType === "video/quicktime" ? "mov" : "mp4";
    const ownerScope = userId || guestSessionId || "anonymous";
    const sourceR2Key = `sources/${ownerScope}/${projectId}/${randomFileId}.${ext}`;

    // Generate short-lived presigned PUT URL
    const uploadUrl = await createPresignedUploadUrl({
      key: sourceR2Key,
      contentType: validated.data.contentType,
      expiresInSeconds: 600, // 10 minutes
    });

    // Create draft project in PostgreSQL
    await db.insert(projects).values({
      id: projectId,
      userId: userId || null,
      guestSessionId: guestSessionId || null,
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
