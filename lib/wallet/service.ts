import "server-only";
import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { wallets, walletTransactions, type Wallet, type WalletTransaction } from "@/db/schema";
import { recordWalletTransaction } from "./ledger";

export interface WalletSummary {
  balancePaise: number;
  reservedPaise: number;
  availablePaise: number;
  formattedAvailableInr: string;
  recentTransactions: WalletTransaction[];
}

export async function getUserWallet(userId: string): Promise<WalletSummary> {
  let [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  if (!wallet) {
    const id = `wal_${nanoid(16)}`;
    await db.insert(wallets).values({
      id,
      userId,
      balancePaise: 0,
      reservedPaise: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    wallet = {
      id,
      userId,
      balancePaise: 0,
      reservedPaise: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const transactions = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(desc(walletTransactions.createdAt))
    .limit(20);

  const availablePaise = Math.max(0, wallet.balancePaise - wallet.reservedPaise);

  return {
    balancePaise: wallet.balancePaise,
    reservedPaise: wallet.reservedPaise,
    availablePaise,
    formattedAvailableInr: `₹${(availablePaise / 100).toFixed(2)}`,
    recentTransactions: transactions,
  };
}

export async function creditUserWallet(params: {
  userId: string;
  amountPaise: number;
  type: "purchase" | "manual_adjustment" | "refund";
  paymentOrderId?: string;
  metadata?: Record<string, any>;
}): Promise<{ newBalancePaise: number; transactionId: string }> {
  const { userId, amountPaise, type, paymentOrderId, metadata } = params;

  // Ensure wallet exists
  await getUserWallet(userId);

  // Update wallet balance using atomic SQL
  const updateResult: any = await db.execute(sql`
    UPDATE wallets
    SET balance_paise = balance_paise + ${amountPaise},
        updated_at = NOW()
    WHERE user_id = ${userId}
    RETURNING balance_paise;
  `);

  const rawRows = updateResult?.rows || updateResult;
  const updated = rawRows ? (rawRows[0] as { balance_paise: number } | undefined) : undefined;

  const txnId = await recordWalletTransaction({
    userId,
    type,
    amountPaise,
    paymentOrderId,
    status: "completed",
    metadata,
  });

  return {
    newBalancePaise: updated?.balance_paise || 0,
    transactionId: txnId,
  };
}

export async function seedDevCredits(userId: string, amountPaise = 50000): Promise<WalletSummary> {
  await creditUserWallet({
    userId,
    amountPaise,
    type: "manual_adjustment",
    metadata: { reason: "dev_credit_seed" },
  });

  return getUserWallet(userId);
}
