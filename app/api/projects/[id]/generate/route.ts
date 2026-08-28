import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createOrResumeGeneration } from "@/lib/generation/generate-service";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in to start localization." } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limit: Max 20 generate requests per 5 minutes per user
    const rateCheck = await checkRateLimit(`rate:generate:${userId}`, 20, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many localization requests. Please wait a few moments before trying again.",
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const idempotencyKey = body.idempotencyKey;

    const result = await createOrResumeGeneration({
      userId,
      projectId,
      idempotencyKey,
    });

    if (!result.success && result.insufficientCredits) {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: `You need ${result.pricing?.formattedTotalInr || "more credits"} to localize these versions.`,
            requiredCostPaise: result.estimatedCostPaise,
            availablePaise: result.availablePaise,
            shortfallPaise: result.shortfallPaise,
            generationRunId: result.generationRunId,
          },
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        generationRunId: result.generationRunId,
        status: result.status,
        dispatchState: result.dispatchState,
        estimatedCostPaise: result.estimatedCostPaise,
      },
    });
  } catch (error: any) {
    if (error.message?.startsWith("NOT_FOUND")) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: error.message } }, { status: 404 });
    }
    if (error.message?.startsWith("INVALID_CONFIGURATION") || error.message?.startsWith("VOICE_RIGHTS_CONSENT_REQUIRED")) {
      return NextResponse.json({ error: { code: "INVALID_REQUEST", message: error.message } }, { status: 400 });
    }

    console.error("Generate error:", error);
    return NextResponse.json(
      { error: { code: "GENERATE_FAILED", message: error.message || "Failed to start generation." } },
      { status: 500 }
    );
  }
}
