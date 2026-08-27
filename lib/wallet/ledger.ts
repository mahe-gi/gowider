import "server-only";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { walletTransactions, type WalletTransaction } from "@/db/schema";

export interface RecordTransactionParams {
  userId: string;
  type: "purchase" | "reservation" | "usage" | "release" | "refund" | "manual_adjustment";
  amountPaise: number;
  paymentOrderId?: string;
  generationRunId?: string;
  status?: "pending" | "completed" | "failed" | "reversed";
  metadata?: Record<string, any>;
}

export async function recordWalletTransaction(params: RecordTransactionParams): Promise<string> {
  const txnId = `txn_${nanoid(16)}`;

  await db.insert(walletTransactions).values({
    id: txnId,
    userId: params.userId,
    paymentOrderId: params.paymentOrderId || null,
    generationRunId: params.generationRunId || null,
    type: params.type,
    amountPaise: params.amountPaise,
    status: params.status || "completed",
    metadata: params.metadata || null,
    createdAt: new Date(),
  });

  return txnId;
}
