import "server-only";
import { eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { wallets, generationRuns, walletTransactions } from "@/db/schema";

export interface SettleRunInput {
  userId: string;
  projectId: string;
  generationRunId: string;
  reservedCostPaise: number;
  finalCostPaise: number;
}

export interface SettleRunResult {
  success: boolean;
  finalChargedPaise: number;
  releasedPaise: number;
  alreadySettled?: boolean;
  errorCode?: string;
  error?: string;
}

export async function settleGenerationRun(input: SettleRunInput): Promise<SettleRunResult> {
  const userId = input.userId;
  const projectId = input.projectId || "";
  const generationRunId = input.generationRunId;
  const reservedCostPaise = input.reservedCostPaise ?? input.finalCostPaise;
  const finalCostPaise = input.finalCostPaise;

  // Invariant 1: Final cost must never exceed reserved cost
  if (finalCostPaise > reservedCostPaise) {
    console.error(
      `🚨 FINANCIAL_INVARIANT_VIOLATION: finalCost (${finalCostPaise}) > reservedCost (${reservedCostPaise}) for run ${generationRunId}`
    );
    throw new Error(
      `FINANCIAL_INVARIANT_VIOLATION: finalCostPaise (${finalCostPaise}) exceeds reservedCostPaise (${reservedCostPaise})`
    );
  }

  // 1. Idempotency Check: check if generation run is already settled
  const [run] = await db
    .select()
    .from(generationRuns)
    .where(eq(generationRuns.id, generationRunId))
    .limit(1);

  if (run?.settledAt) {
    const unspent = Math.max(0, (run.reservedCostPaise || 0) - (run.finalCostPaise || 0));
    return {
      success: true,
      finalChargedPaise: run.finalCostPaise || 0,
      releasedPaise: unspent,
      alreadySettled: true,
    };
  }

  const unspentReleasePaise = reservedCostPaise - finalCostPaise;

  // 2. Transactional Settlement
  try {
    const result = await db.transaction(async (tx) => {
      // Deduct finalCost from balance, release all reservedCost from reserved
      const updateResult: any = await tx.execute(sql`
        UPDATE wallets
        SET balance_paise = balance_paise - ${finalCostPaise},
            reserved_paise = reserved_paise - ${reservedCostPaise},
            updated_at = NOW()
        WHERE user_id = ${userId}
          AND reserved_paise >= ${reservedCostPaise}
          AND balance_paise >= ${finalCostPaise}
        RETURNING id, balance_paise, reserved_paise;
      `);

      const rawRows = updateResult?.rows || updateResult;
      const updatedWallet = rawRows ? (rawRows[0] as { id: string; balance_paise: number; reserved_paise: number } | undefined) : undefined;

      if (!updatedWallet && reservedCostPaise > 0) {
        throw new Error(
          `FINANCIAL_INVARIANT_VIOLATION: Wallet balance or reserved amount smaller than required settlement. User: ${userId}`
        );
      }

      // Record Usage Ledger (Actual Spend for Successful Exports)
      if (finalCostPaise > 0) {
        const usageTxnId = `txn_${nanoid(16)}`;
        await tx.insert(walletTransactions).values({
          id: usageTxnId,
          userId,
          generationRunId,
          type: "usage",
          amountPaise: finalCostPaise,
          status: "completed",
          metadata: {
            projectId,
            settledAt: new Date().toISOString(),
          },
          createdAt: new Date(),
        });
      }

      // Record Release Ledger (Unspent Reserved Credits for Failed/Unprocessed Targets)
      if (unspentReleasePaise > 0) {
        const releaseTxnId = `txn_${nanoid(16)}`;
        await tx.insert(walletTransactions).values({
          id: releaseTxnId,
          userId,
          generationRunId,
          type: "release",
          amountPaise: unspentReleasePaise,
          status: "completed",
          metadata: {
            projectId,
            reason: "unspent_partial_or_full_failure",
            settledAt: new Date().toISOString(),
          },
          createdAt: new Date(),
        });
      }

      // Mark generation run settled
      await tx
        .update(generationRuns)
        .set({
          finalCostPaise,
          settledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, generationRunId));

      return {
        success: true,
        finalChargedPaise: finalCostPaise,
        releasedPaise: unspentReleasePaise,
      };
    });

    return result;
  } catch (err: any) {
    // If concurrent race threw duplicate key violation on wallet_txns_run_type_idx
    const [existingRun] = await db
      .select()
      .from(generationRuns)
      .where(eq(generationRuns.id, generationRunId))
      .limit(1);

    if (existingRun?.settledAt) {
      const unspent = Math.max(0, (existingRun.reservedCostPaise || 0) - (existingRun.finalCostPaise || 0));
      return {
        success: true,
        finalChargedPaise: existingRun.finalCostPaise || 0,
        releasedPaise: unspent,
        alreadySettled: true,
      };
    }

    console.error(`❌ Settlement transaction failed for run ${generationRunId}:`, err);
    throw err;
  }
}

export async function releaseFullReservation(params: {
  userId: string;
  projectId: string;
  generationRunId: string;
  reservedCostPaise: number;
  reason: string;
}): Promise<SettleRunResult> {
  return settleGenerationRun({
    userId: params.userId,
    projectId: params.projectId,
    generationRunId: params.generationRunId,
    reservedCostPaise: params.reservedCostPaise,
    finalCostPaise: 0,
  });
}
