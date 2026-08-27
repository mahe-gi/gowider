import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { db } from "@/lib/db";
import { projects, generationRuns } from "@/db/schema";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";
import { reserveCreditsForRun } from "@/lib/wallet/reserve";
import { getUserWallet } from "@/lib/wallet/service";
import { dispatchGenerationJob } from "@/lib/queue/dispatch";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const session = await auth();

    // 1. Authenticate requirement
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in to start localization." } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Rate limit: Max 10 generate requests per 5 minutes per user
    const rateCheck = await checkRateLimit(`rate:generate:${userId}`, 10, 300);
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

    const access = await assertProjectAccess(projectId, userId);

    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found or access denied." } },
        { status: 404 }
      );
    }

    const project = access.project;

    // 2. Validate configuration
    if (!project.sourceLanguage || !project.targetLanguages || project.targetLanguages.length === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_CONFIGURATION", message: "Please configure source and target languages first." } },
        { status: 400 }
      );
    }

    // 3. Validate Voice Rights Consent
    if (!project.voiceRightsConfirmedAt) {
      return NextResponse.json(
        {
          error: {
            code: "VOICE_RIGHTS_CONSENT_REQUIRED",
            message: "Voice ownership and dubbing rights confirmation is required.",
          },
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const idempotencyKey = body.idempotencyKey || `idem_${nanoid(16)}`;

    // Check if generation run with this idempotency key already exists
    const [existingRun] = await db
      .select()
      .from(generationRuns)
      .where(eq(generationRuns.idempotencyKey, idempotencyKey))
      .limit(1);

    if (existingRun) {
      return NextResponse.json({ success: true, data: existingRun });
    }

    // 4. Calculate authoritative price based on server-verified duration
    const duration = project.serverVerifiedDurationSeconds || project.durationSeconds || 1;
    const pricing = calculateDubbingCost(duration, project.targetLanguages.length);
    const requiredCostPaise = pricing.totalCostPaise;

    const runId = `run_${nanoid(16)}`;

    // 5. Create Generation Run record
    await db.insert(generationRuns).values({
      id: runId,
      projectId: project.id,
      userId,
      targetLanguages: project.targetLanguages,
      projectConfigSnapshot: {
        sourceLanguage: project.sourceLanguage,
        targetLanguages: project.targetLanguages,
        durationSeconds: duration,
      },
      pricingSnapshot: pricing,
      idempotencyKey,
      status: "awaiting_payment",
      dispatchState: "pending",
      estimatedCostPaise: requiredCostPaise,
      reservedCostPaise: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. Check Wallet Balance & Attempt Atomic Reservation
    const reservation = await reserveCreditsForRun({
      userId,
      projectId: project.id,
      generationRunId: runId,
      requiredCostPaise,
    });

    if (!reservation.success) {
      const wallet = await getUserWallet(userId);
      const shortfallPaise = Math.max(0, requiredCostPaise - wallet.availablePaise);

      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: `You need ${pricing.formattedTotalInr} to localize these versions.`,
            requiredCostPaise,
            availablePaise: wallet.availablePaise,
            shortfallPaise,
            generationRunId: runId,
          },
        },
        { status: 402 }
      );
    }

    // 7. Dispatch BullMQ Generation Job
    await db
      .update(projects)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(projects.id, project.id));

    const dispatchResult = await dispatchGenerationJob(runId);

    return NextResponse.json({
      success: true,
      data: {
        generationRunId: runId,
        status: "queued",
        dispatchState: dispatchResult.success ? "dispatched" : "pending",
        estimatedCostPaise: requiredCostPaise,
      },
    });
  } catch (error: any) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: { code: "GENERATE_FAILED", message: error.message || "Failed to start generation." } },
      { status: 500 }
    );
  }
}
