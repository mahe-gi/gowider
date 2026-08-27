import "server-only";
import { eq, and, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { wallets, generationRuns, walletTransactions } from "@/db/schema";

export interface ReserveCreditsInput {
  userId: string;
  projectId: string;
  generationRunId: string;
  requiredCostPaise: number;
}

export interface ReserveCreditsResult {
  success: boolean;
  reservedCostPaise: number;
  remainingAvailablePaise: number;
  alreadyReserved?: boolean;
  errorCode?: string;
  error?: string;
}

export async function reserveCreditsForRun(input: ReserveCreditsInput): Promise<ReserveCreditsResult> {
  const { userId, projectId, generationRunId, requiredCostPaise } = input;

  if (requiredCostPaise <= 0) {
    return {
      success: true,
      reservedCostPaise: 0,
      remainingAvailablePaise: 0,
    };
  }

  // 1. Idempotency Check: check if this run already has a reservation ledger
  const [existingReservation] = await db
    .select()
    .from(walletTransactions)
    .where(
      and(
        eq(walletTransactions.generationRunId, generationRunId),
        eq(walletTransactions.type, "reservation")
      )
    )
    .limit(1);

  if (existingReservation) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    const available = wallet ? Math.max(0, wallet.balancePaise - wallet.reservedPaise) : 0;
    return {
      success: true,
      reservedCostPaise: existingReservation.amountPaise,
      remainingAvailablePaise: available,
      alreadyReserved: true,
    };
  }

  // 2. Transactional Atomic Reservation Lock
  try {
    const result = await db.transaction(async (tx) => {
      // Atomic reservation with check: (balance_paise - reserved_paise) >= requiredCost
      const updateResult = await tx.execute(sql`
        UPDATE wallets
        SET reserved_paise = reserved_paise + ${requiredCostPaise},
            updated_at = NOW()
        WHERE user_id = ${userId}
          AND (balance_paise - reserved_paise) >= ${requiredCostPaise}
        RETURNING id, balance_paise, reserved_paise;
      `);

      const updatedWallet = (updateResult.rows || updateResult)[0] as
        | { id: string; balance_paise: number; reserved_paise: number }
        | undefined;

      if (!updatedWallet) {
        return {
          success: false,
          errorCode: "INSUFFICIENT_BALANCE",
          error: "Insufficient available balance to reserve credits.",
        };
      }

      // Financial Invariant Verification
      if (
        updatedWallet.balance_paise < 0 ||
        updatedWallet.reserved_paise < 0 ||
        updatedWallet.reserved_paise > updatedWallet.balance_paise
      ) {
        throw new Error(
          `FINANCIAL_INVARIANT_VIOLATION: balance=${updatedWallet.balance_paise}, reserved=${updatedWallet.reserved_paise}`
        );
      }

      // Update generation run reservedCostPaise
      await tx
        .update(generationRuns)
        .set({
          reservedCostPaise: requiredCostPaise,
          updatedAt: new Date(),
        })
        .where(eq(generationRuns.id, generationRunId));

      // Record transaction ledger
      const txnId = `txn_${nanoid(16)}`;
      await tx.insert(walletTransactions).values({
        id: txnId,
        userId,
        generationRunId,
        type: "reservation",
        amountPaise: requiredCostPaise,
        status: "completed",
        metadata: {
          projectId,
          reservedAt: new Date().toISOString(),
        },
        createdAt: new Date(),
      });

      const remainingAvailable = updatedWallet.balance_paise - updatedWallet.reserved_paise;

      return {
        success: true,
        reservedCostPaise: requiredCostPaise,
        remainingAvailablePaise: remainingAvailable,
      };
    });

    return result as ReserveCreditsResult;
  } catch (err: any) {
    console.error(`❌ Wallet reservation transaction failed for run ${generationRunId}:`, err);
    return {
      success: false,
      reservedCostPaise: 0,
      remainingAvailablePaise: 0,
      errorCode: "RESERVATION_FAILED",
      error: err.message || "Failed to reserve credits.",
    };
  }
}
