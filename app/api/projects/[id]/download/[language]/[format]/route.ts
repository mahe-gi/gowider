import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { db } from "@/lib/db";
import { projectOutputs } from "@/db/schema";
import { createPresignedDownloadUrl } from "@/lib/r2/outputs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; language: string; format: string }> }
) {
  try {
    const { id: projectId, language, format } = await params;
    const session = await auth();
    const access = await assertProjectAccess(projectId, session?.user?.id);

    if (!access.hasAccess || !access.project) {
      return NextResponse.json({ error: { code: "FORBIDDEN", message: "Access denied." } }, { status: 403 });
    }

    const [output] = await db
      .select()
      .from(projectOutputs)
      .where(and(eq(projectOutputs.projectId, projectId), eq(projectOutputs.targetLanguage, language)))
      .limit(1);

    if (!output || output.status !== "completed") {
      return NextResponse.json(
        { error: { code: "NOT_READY", message: "Requested localized file is not ready." } },
        { status: 404 }
      );
    }

    const r2Key = format === "srt" ? output.srtR2Key : output.videoR2Key;
    const ext = format === "srt" ? "srt" : "mp4";
    const fileName = `${access.project.displayName || "gowider-reel"}_${language}.${ext}`;

    if (!r2Key) {
      return NextResponse.json(
        { error: { code: "FILE_UNAVAILABLE", message: `The ${format.toUpperCase()} file is not available.` } },
        { status: 404 }
      );
    }

    const downloadUrl = await createPresignedDownloadUrl({
      key: r2Key,
      fileName,
      expiresInSeconds: 900, // 15 minutes
    });

    const urlObj = new URL(req.url);
    const redirect = urlObj.searchParams.get("redirect") !== "false";

    if (redirect) {
      return NextResponse.redirect(downloadUrl);
    }

    return NextResponse.json({ success: true, downloadUrl });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: { code: "DOWNLOAD_FAILED", message: error.message || "Failed to generate download link." } },
      { status: 500 }
    );
  }
}
