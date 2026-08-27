import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { assertProjectAccess } from "@/lib/auth/ownership";
import { db } from "@/lib/db";
import { projects, generationRuns } from "@/db/schema";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";
import { reserveCreditsForRun } from "@/lib/wallet/reserve";
import { getUserWallet } from "@/lib/wallet/service";
import { dispatchGenerationRun } from "@/lib/inngest/dispatch";

const retrySchema = z.object({
  targetLanguages: z.array(z.string()).min(1, "Select at least 1 language to retry."),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { code: "AUTH_REQUIRED", message: "Sign in to retry generation." } },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const access = await assertProjectAccess(projectId, userId);

    if (!access.hasAccess || !access.project) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Project not found or access denied." } },
        { status: 404 }
      );
    }

    const project = access.project;
    const body = await req.json();
    const validated = retrySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const targetLanguages = validated.data.targetLanguages;
    const duration = project.serverVerifiedDurationSeconds || project.durationSeconds || 1;

    // Calculate price only for retried languages
    const pricing = calculateDubbingCost(duration, targetLanguages.length);
    const requiredCostPaise = pricing.totalCostPaise;

    const runId = `run_${nanoid(16)}`;
    const idempotencyKey = `retry_${runId}`;

    // Create a new generation run for retried targets
    await db.insert(generationRuns).values({
      id: runId,
      projectId: project.id,
      userId,
      targetLanguages,
      projectConfigSnapshot: {
        sourceLanguage: project.sourceLanguage,
        targetLanguages,
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

    // Check & reserve credits
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
            message: `You need ${pricing.formattedTotalInr} to retry ${targetLanguages.length} version(s).`,
            requiredCostPaise,
            availablePaise: wallet.availablePaise,
            shortfallPaise,
            generationRunId: runId,
          },
        },
        { status: 402 }
      );
    }

    await db
      .update(projects)
      .set({ status: "processing", updatedAt: new Date() })
      .where(eq(projects.id, project.id));

    const dispatchResult = await dispatchGenerationRun(runId);

    return NextResponse.json({
      success: true,
      data: {
        generationRunId: runId,
        status: "queued",
        dispatchState: dispatchResult.success ? "dispatched" : "pending",
        targetLanguages,
        estimatedCostPaise: requiredCostPaise,
      },
    });
  } catch (error: any) {
    console.error("Retry error:", error);
    return NextResponse.json(
      { error: { code: "RETRY_FAILED", message: error.message || "Failed to retry generation." } },
      { status: 500 }
    );
  }
}
