import "server-only";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { walletTransactions, type NewWalletTransaction } from "@/db/schema";

export async function recordWalletTransaction(params: {
  userId: string;
  type: "purchase" | "reservation" | "usage" | "release" | "refund" | "manual_adjustment";
  amountPaise: number;
  projectId?: string;
  generationRunId?: string;
  paymentOrderId?: string;
  status?: "pending" | "completed" | "failed" | "cancelled";
  metadata?: Record<string, any>;
}): Promise<string> {
  const id = `txn_${nanoid(16)}`;

  await db.insert(walletTransactions).values({
    id,
    userId: params.userId,
    type: params.type,
    amountPaise: Math.abs(params.amountPaise), // Amounts are always positive integers
    projectId: params.projectId || null,
    generationRunId: params.generationRunId || null,
    paymentOrderId: params.paymentOrderId || null,
    status: params.status || "completed",
    metadata: params.metadata || null,
    createdAt: new Date(),
  });

  return id;
}
