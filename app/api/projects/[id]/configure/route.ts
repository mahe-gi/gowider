import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { SUPPORTED_LANGUAGES, MAX_TARGET_LANGUAGES } from "@/lib/constants";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";

const configureSchema = z.object({
  sourceLanguage: z.string().refine((val) => val in SUPPORTED_LANGUAGES, "Invalid source language code."),
  targetLanguages: z
    .array(z.string().refine((val) => val in SUPPORTED_LANGUAGES, "Invalid target language code."))
    .min(1, "Please select at least 1 target language.")
    .max(MAX_TARGET_LANGUAGES, `You can select up to ${MAX_TARGET_LANGUAGES} target languages.`),
  confirmVoiceRights: z.boolean().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const validated = configureSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const session = await auth();
    const access = await assertProjectAccess(projectId, session?.user?.id);

    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found or access denied." } },
        { status: 404 }
      );
    }

    const { sourceLanguage, targetLanguages, confirmVoiceRights } = validated.data;

    // Source language cannot be included in target languages
    if (targetLanguages.includes(sourceLanguage)) {
      return NextResponse.json(
        { error: { code: "SOURCE_TARGET_CONFLICT", message: "Target languages must not include the original language." } },
        { status: 400 }
      );
    }

    const project = access.project;
    const pricing = calculateDubbingCost(project.durationSeconds || 1, targetLanguages.length);

    const [updated] = await db
      .update(projects)
      .set({
        sourceLanguage,
        targetLanguages,
        voiceRightsConfirmedAt: confirmVoiceRights ? new Date() : project.voiceRightsConfirmedAt,
        voiceConsentVersion: confirmVoiceRights ? "v1.0" : project.voiceConsentVersion,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project.id))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        pricing,
      },
    });
  } catch (error: any) {
    console.error("Configure project error:", error);
    return NextResponse.json(
      { error: { code: "CONFIGURE_FAILED", message: error.message || "Failed to configure project." } },
      { status: 500 }
    );
  }
}
