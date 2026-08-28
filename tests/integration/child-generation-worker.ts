import "@/workers/shims/server-only";
import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import { generationRuns } from "@/db/schema";
import { eq, and, or, isNull, lt, inArray } from "drizzle-orm";

process.on("message", async (msg: any) => {
  const { runId } = msg;
  const staleLeaseCutoff = new Date(Date.now() - 2 * 60 * 1000);

  try {
    const [claimedRun] = await db
      .update(generationRuns)
      .set({
        status: "uploading_to_sarvam",
        currentStep: "uploading",
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(generationRuns.id, runId),
          or(
            inArray(generationRuns.status, ["queued", "awaiting_payment"]),
            and(
              eq(generationRuns.status, "uploading_to_sarvam"),
              isNull(generationRuns.sarvamJobId),
              lt(generationRuns.updatedAt, staleLeaseCutoff)
            )
          )
        )
      )
      .returning();

    if (!claimedRun) {
      if (process.send) {
        process.send({ success: true, claimed: false, message: "Skipped duplicate claim" });
      }
      return;
    }

    // Simulate provider call delay
    await new Promise((r) => setTimeout(r, 60));
    const mockSarvamJobId = `sarvam_mp_job_${runId}`;

    await db
      .update(generationRuns)
      .set({
        sarvamJobId: mockSarvamJobId,
        status: "processing",
        currentStep: "dubbing",
        updatedAt: new Date(),
      })
      .where(eq(generationRuns.id, runId));

    if (process.send) {
      process.send({ success: true, claimed: true, sarvamJobId: mockSarvamJobId });
    }
  } catch (err: any) {
    if (process.send) {
      process.send({ success: false, error: err.message });
    }
  }
});
