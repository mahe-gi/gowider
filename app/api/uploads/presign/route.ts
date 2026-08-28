import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { createPresignedUploadUrl } from "@/lib/r2/uploads";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES } from "@/lib/constants";
import { checkRateLimit } from "@/lib/security/rate-limit";

const presignSchema = z.object({
  fileName: z.string().min(1, "fileName is required."),
  contentType: z.enum(ACCEPTED_MIME_TYPES, {
    errorMap: () => ({ message: "Only MP4 and MOV files are supported." }),
  }),
  fileSizeBytes: z.number().max(MAX_FILE_SIZE_BYTES, "Video size must not exceed 100 MB."),
  uploadIntentId: z.string().min(1, "uploadIntentId is required."),
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

    // Rate Limit: Max 30 presigns per 5 minutes per user
    const rateCheck = await checkRateLimit(`rate:presign:${userId}`, 30, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Upload rate limit exceeded. Please wait a moment." } },
        { status: 429 }
      );
    }

    const { fileName, contentType, fileSizeBytes, uploadIntentId } = validated.data;

    // 1. Check if a project for this (userId, uploadIntentId) already exists
    const [existing] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.userId, userId), eq(projects.uploadIntentId, uploadIntentId)))
      .limit(1);

    if (existing) {
      // 2. Immutable Metadata Validation: Reject conflicting metadata for same upload intent
      if (
        existing.sourceFileName !== fileName ||
        existing.sourceMimeType !== contentType ||
        existing.sourceFileSizeBytes !== fileSizeBytes
      ) {
        return NextResponse.json(
          {
            error: {
              code: "INTENT_METADATA_MISMATCH",
              message: `Upload intent ${uploadIntentId} was already initiated with conflicting metadata. Original: ${existing.sourceFileName} (${existing.sourceMimeType}, ${existing.sourceFileSizeBytes} bytes). Received: ${fileName} (${contentType}, ${fileSizeBytes} bytes).`,
            },
          },
          { status: 409 }
        );
      }

      // Re-sign fresh presigned upload URL for the same existing key
      const uploadUrl = await createPresignedUploadUrl({
        key: existing.sourceR2Key,
        contentType,
        expiresInSeconds: 600,
      });

      return NextResponse.json({
        success: true,
        data: {
          projectId: existing.id,
          uploadUrl,
          key: existing.sourceR2Key,
        },
      });
    }

    // 3. Brand-new upload intent: insert with atomic PostgreSQL uniqueness on (userId, uploadIntentId)
    const projectId = `proj_${nanoid(16)}`;
    const randomFileId = nanoid(12);
    const ext = contentType === "video/quicktime" ? "mov" : "mp4";
    const sourceR2Key = `sources/${userId}/${projectId}/${randomFileId}.${ext}`;

    let finalProjectId = projectId;
    let finalSourceR2Key = sourceR2Key;

    try {
      const [inserted] = await db
        .insert(projects)
        .values({
          id: projectId,
          userId,
          uploadIntentId,
          displayName: fileName,
          sourceR2Key,
          sourceFileName: fileName,
          sourceMimeType: contentType,
          sourceFileSizeBytes: fileSizeBytes,
          status: "upload_pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing({ target: [projects.userId, projects.uploadIntentId] })
        .returning();

      if (!inserted) {
        // Parallel insertion race: load the winner and verify metadata
        const [winner] = await db
          .select()
          .from(projects)
          .where(and(eq(projects.userId, userId), eq(projects.uploadIntentId, uploadIntentId)))
          .limit(1);

        if (winner) {
          if (
            winner.sourceFileName !== fileName ||
            winner.sourceMimeType !== contentType ||
            winner.sourceFileSizeBytes !== fileSizeBytes
          ) {
            return NextResponse.json(
              {
                error: {
                  code: "INTENT_METADATA_MISMATCH",
                  message: `Upload intent ${uploadIntentId} was already initiated with conflicting metadata.`,
                },
              },
              { status: 409 }
            );
          }
          finalProjectId = winner.id;
          finalSourceR2Key = winner.sourceR2Key;
        }
      }
    } catch (insertErr: any) {
      // Handle concurrent insert race fallback
      const [winner] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.userId, userId), eq(projects.uploadIntentId, uploadIntentId)))
        .limit(1);

      if (winner) {
        if (
          winner.sourceFileName !== fileName ||
          winner.sourceMimeType !== contentType ||
          winner.sourceFileSizeBytes !== fileSizeBytes
        ) {
          return NextResponse.json(
            {
              error: {
                code: "INTENT_METADATA_MISMATCH",
                message: `Upload intent ${uploadIntentId} was already initiated with conflicting metadata.`,
              },
            },
            { status: 409 }
          );
        }
        finalProjectId = winner.id;
        finalSourceR2Key = winner.sourceR2Key;
      } else {
        throw insertErr;
      }
    }

    // 4. Generate fresh presigned upload URL
    const uploadUrl = await createPresignedUploadUrl({
      key: finalSourceR2Key,
      contentType,
      expiresInSeconds: 600,
    });

    return NextResponse.json({
      success: true,
      data: {
        projectId: finalProjectId,
        uploadUrl,
        key: finalSourceR2Key,
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
