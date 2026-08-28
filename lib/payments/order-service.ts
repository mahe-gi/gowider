import "server-only";
import { nanoid } from "nanoid";
import { eq, and, or, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { paymentOrders, generationRuns } from "@/db/schema";
import { paymentProvider as defaultPaymentProvider } from "@/lib/payments/razorpay";
import type { PaymentProvider } from "@/lib/payments/provider";
import { env } from "@/lib/env";

export interface CreatePaymentOrderInput {
  userId: string;
  paymentIntentId: string;
  amountPaise: number;
  generationRunId?: string;
  providerOverride?: PaymentProvider;
}

export interface CreatePaymentOrderResult {
  paymentOrderId: string;
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export class PaymentIntentConflictError extends Error {
  code = "INTENT_CONFLICT";
  constructor(message: string) {
    super(message);
    this.name = "PaymentIntentConflictError";
  }
}

export async function createOrGetPaymentOrder(
  input: CreatePaymentOrderInput
): Promise<CreatePaymentOrderResult> {
  const { userId, paymentIntentId, amountPaise, generationRunId, providerOverride } = input;
  const provider = providerOverride || defaultPaymentProvider;

  // 1. Verify linked generation run belongs to user if provided
  if (generationRunId) {
    const [run] = await db
      .select()
      .from(generationRuns)
      .where(eq(generationRuns.id, generationRunId))
      .limit(1);

    if (!run || run.userId !== userId) {
      throw new Error("FORBIDDEN: Linked generation run does not belong to user.");
    }
  }

  // 2. Check if an order already exists for this (userId, paymentIntentId)
  const [existingOrder] = await db
    .select()
    .from(paymentOrders)
    .where(and(eq(paymentOrders.userId, userId), eq(paymentOrders.paymentIntentId, paymentIntentId)))
    .limit(1);

  if (existingOrder) {
    // Invariant: Immutable Intent Association
    if (existingOrder.amountPaise !== amountPaise) {
      throw new PaymentIntentConflictError(
        `Payment intent ${paymentIntentId} was already initiated for ${existingOrder.amountPaise} paise. Conflicting amount: ${amountPaise} paise.`
      );
    }

    const existingRunId = existingOrder.generationRunId || undefined;
    const requestedRunId = generationRunId || undefined;
    if (existingRunId !== requestedRunId) {
      throw new PaymentIntentConflictError(
        `Payment intent ${paymentIntentId} was already linked to generation run ${existingRunId || "none"}. Conflicting run: ${requestedRunId || "none"}.`
      );
    }

    // Fast-path: If provider order ID is already persisted, return immediately
    if (existingOrder.providerOrderId) {
      return {
        paymentOrderId: existingOrder.id,
        providerOrderId: existingOrder.providerOrderId,
        amountPaise: existingOrder.amountPaise,
        currency: existingOrder.currency,
        keyId: env.RAZORPAY_KEY_ID || "",
      };
    }
  }

  const paymentId = existingOrder?.id || `pay_${nanoid(16)}`;
  const idempotencyKey = `ord_idem_${paymentId}`;

  // 3. Ensure local PostgreSQL row exists with status = 'creating'
  if (!existingOrder) {
    try {
      await db
        .insert(paymentOrders)
        .values({
          id: paymentId,
          userId,
          paymentIntentId,
          generationRunId: generationRunId || null,
          provider: "razorpay",
          amountPaise,
          currency: "INR",
          status: "creating",
          idempotencyKey,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing({ target: [paymentOrders.userId, paymentOrders.paymentIntentId] });
    } catch (insertErr: any) {
      console.warn("Payment order insert conflict handled:", insertErr.message);
    }
  }

  // 4. PostgreSQL Atomic Claim Lease: Only ONE process/pod/worker wins the lease to call Razorpay
  const leaseToken = nanoid(16);
  const leaseDurationMs = 30 * 1000; // 30 seconds
  const now = new Date();
  const leaseExpiry = new Date(Date.now() + leaseDurationMs);

  const [claimedOrder] = await db
    .update(paymentOrders)
    .set({
      providerCreationLeaseUntil: leaseExpiry,
      providerCreationToken: leaseToken,
      updatedAt: now,
    })
    .where(
      and(
        eq(paymentOrders.userId, userId),
        eq(paymentOrders.paymentIntentId, paymentIntentId),
        isNull(paymentOrders.providerOrderId),
        or(
          isNull(paymentOrders.providerCreationLeaseUntil),
          lt(paymentOrders.providerCreationLeaseUntil, now)
        )
      )
    )
    .returning();

  if (!claimedOrder) {
    // Another concurrent process holds an active lease. Poll briefly for providerOrderId.
    const pollStart = Date.now();
    while (Date.now() - pollStart < 8000) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const [current] = await db
        .select()
        .from(paymentOrders)
        .where(and(eq(paymentOrders.userId, userId), eq(paymentOrders.paymentIntentId, paymentIntentId)))
        .limit(1);

      if (current?.providerOrderId) {
        return {
          paymentOrderId: current.id,
          providerOrderId: current.providerOrderId,
          amountPaise: current.amountPaise,
          currency: current.currency,
          keyId: env.RAZORPAY_KEY_ID || "",
        };
      }

      // If active lease expired while waiting, break out and re-try claim
      if (current?.providerCreationLeaseUntil && current.providerCreationLeaseUntil < new Date()) {
        break;
      }
    }
  }

  // Double-check if providerOrderId was written in the meantime
  const [finalCheck] = await db
    .select()
    .from(paymentOrders)
    .where(and(eq(paymentOrders.userId, userId), eq(paymentOrders.paymentIntentId, paymentIntentId)))
    .limit(1);

  if (finalCheck?.providerOrderId) {
    return {
      paymentOrderId: finalCheck.id,
      providerOrderId: finalCheck.providerOrderId,
      amountPaise: finalCheck.amountPaise,
      currency: finalCheck.currency,
      keyId: env.RAZORPAY_KEY_ID || "",
    };
  }

  const targetId = claimedOrder ? claimedOrder.id : paymentId;

  // 5. Crash Recovery: Check if provider already created an order with receipt = paymentIntentId
  if (provider.findOrderByReceipt) {
    try {
      const existingRemote = await provider.findOrderByReceipt(paymentIntentId);
      if (existingRemote && existingRemote.id) {
        await db
          .update(paymentOrders)
          .set({
            providerOrderId: existingRemote.id,
            status: "created",
            providerCreationLeaseUntil: null,
            providerCreationToken: null,
            updatedAt: new Date(),
          })
          .where(eq(paymentOrders.id, targetId));

        return {
          paymentOrderId: targetId,
          providerOrderId: existingRemote.id,
          amountPaise: existingRemote.amountPaise || amountPaise,
          currency: "INR",
          keyId: env.RAZORPAY_KEY_ID || "",
        };
      }
    } catch (findErr: any) {
      console.warn("Receipt reconciliation lookup error:", findErr.message);
    }
  }

  // 6. Execute Provider Call OUTSIDE the database transaction
  const rzpOrder = await provider.createOrder({
    userId,
    amountPaise,
    currency: "INR",
    receipt: paymentIntentId,
    notes: {
      userId,
      paymentId: targetId,
      paymentIntentId,
      generationRunId: generationRunId || "",
    },
  });

  // 7. Persist providerOrderId and clear the lease
  await db
    .update(paymentOrders)
    .set({
      providerOrderId: rzpOrder.providerOrderId,
      status: "created",
      providerCreationLeaseUntil: null,
      providerCreationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(paymentOrders.id, targetId));

  return {
    paymentOrderId: targetId,
    providerOrderId: rzpOrder.providerOrderId,
    amountPaise: rzpOrder.amountPaise,
    currency: rzpOrder.currency,
    keyId: rzpOrder.keyId || env.RAZORPAY_KEY_ID || "",
  };
}
