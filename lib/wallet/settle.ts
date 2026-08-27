import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { wallets, generationRuns } from "@/db/schema";
import { recordWalletTransaction } from "./ledger";

export async function settleGenerationRun(params: {
  userId: string;
  projectId: string;
  generationRunId: string;
  reservedCostPaise: number;
  finalCostPaise: number;
}): Promise<void> {
  const { userId, projectId, generationRunId, reservedCostPaise, finalCostPaise } = params;

  if (reservedCostPaise <= 0 && finalCostPaise <= 0) {
    return;
  }

  // 1. Deduct final cost from balance and release reservation atomically
  await db.execute(sql`
    UPDATE wallets
    SET balance_paise = balance_paise - ${finalCostPaise},
        reserved_paise = GREATEST(0, reserved_paise - ${reservedCostPaise}),
        updated_at = NOW()
    WHERE user_id = ${userId};
  `);

  // 2. Record usage transaction if finalCost > 0
  if (finalCostPaise > 0) {
    await recordWalletTransaction({
      userId,
      type: "usage",
      amountPaise: finalCostPaise,
      projectId,
      generationRunId,
      status: "completed",
    });
  }

  // 3. Record release transaction if unused reservation existed (e.g. partial failure or full failure refund)
  const unspentPaise = reservedCostPaise - finalCostPaise;
  if (unspentPaise > 0) {
    await recordWalletTransaction({
      userId,
      type: "release",
      amountPaise: unspentPaise,
      projectId,
      generationRunId,
      status: "completed",
      metadata: { reason: "unspent_or_failed_language_refund" },
    });
  }
}

export async function releaseFullReservation(params: {
  userId: string;
  projectId: string;
  generationRunId: string;
  reservedCostPaise: number;
  reason?: string;
}): Promise<void> {
  const { userId, projectId, generationRunId, reservedCostPaise, reason } = params;

  if (reservedCostPaise <= 0) return;

  await db.execute(sql`
    UPDATE wallets
    SET reserved_paise = GREATEST(0, reserved_paise - ${reservedCostPaise}),
        updated_at = NOW()
    WHERE user_id = ${userId};
  `);

  await recordWalletTransaction({
    userId,
    type: "release",
    amountPaise: reservedCostPaise,
    projectId,
    generationRunId,
    status: "completed",
    metadata: { reason: reason || "job_failed_or_cancelled" },
  });
}
