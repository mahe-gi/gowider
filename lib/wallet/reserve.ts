import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { wallets } from "@/db/schema";
import { recordWalletTransaction } from "./ledger";

export interface ReserveCreditsResult {
  success: boolean;
  reservedPaise?: number;
  availablePaise?: number;
  error?: string;
}

export async function reserveCreditsForRun(params: {
  userId: string;
  projectId: string;
  generationRunId: string;
  requiredCostPaise: number;
}): Promise<ReserveCreditsResult> {
  const { userId, projectId, generationRunId, requiredCostPaise } = params;

  if (requiredCostPaise <= 0) {
    return { success: true, reservedPaise: 0 };
  }

  // Atomic reservation update: lock required amount only if balance - reserved >= required
  const updateResult = await db.execute(sql`
    UPDATE wallets
    SET reserved_paise = reserved_paise + ${requiredCostPaise},
        updated_at = NOW()
    WHERE user_id = ${userId}
      AND (balance_paise - reserved_paise) >= ${requiredCostPaise}
    RETURNING id, balance_paise, reserved_paise;
  `);

  const updatedWallet = (updateResult.rows || updateResult)[0] as {
    id: string;
    balance_paise: number;
    reserved_paise: number;
  } | undefined;

  if (!updatedWallet) {
    // Query current balance to return accurate shortfall info
    const walletResult = await db.execute(sql`
      SELECT balance_paise, reserved_paise FROM wallets WHERE user_id = ${userId} LIMIT 1;
    `);
    const current = (walletResult.rows || walletResult)[0] as {
      balance_paise: number;
      reserved_paise: number;
    } | undefined;

    const available = current ? current.balance_paise - current.reserved_paise : 0;

    return {
      success: false,
      availablePaise: available,
      error: "INSUFFICIENT_CREDITS",
    };
  }

  // Record reservation transaction
  await recordWalletTransaction({
    userId,
    type: "reservation",
    amountPaise: requiredCostPaise,
    projectId,
    generationRunId,
    status: "completed",
    metadata: {
      availableAfterReservation: updatedWallet.balance_paise - updatedWallet.reserved_paise,
    },
  });

  return {
    success: true,
    reservedPaise: requiredCostPaise,
    availablePaise: updatedWallet.balance_paise - updatedWallet.reserved_paise,
  };
}
