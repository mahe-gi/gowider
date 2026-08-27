import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { paymentOrders } from "@/db/schema";
import { paymentProvider } from "@/lib/payments/razorpay";

const orderSchema = z.object({
  amountPaise: z.number().min(1000, "Minimum top-up is ₹10 (1000 paise).").max(1000000, "Maximum top-up is ₹10,000."),
  generationRunId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const validated = orderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const { amountPaise, generationRunId } = validated.data;
    const paymentId = `pay_${nanoid(16)}`;
    const idempotencyKey = `ord_idem_${paymentId}`;

    // 1. Create initial local payment record
    await db.insert(paymentOrders).values({
      id: paymentId,
      userId,
      generationRunId: generationRunId || null,
      provider: "razorpay",
      amountPaise,
      currency: "INR",
      status: "creating",
      idempotencyKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 2. Call Razorpay API to create order
    const rzpOrder = await paymentProvider.createOrder({
      userId,
      amountPaise,
      currency: "INR",
      receipt: paymentId,
      notes: {
        userId,
        paymentId,
        generationRunId: generationRunId || "",
      },
    });

    // 3. Update local payment record with Razorpay Order ID
    await db
      .update(paymentOrders)
      .set({
        providerOrderId: rzpOrder.providerOrderId,
        status: "created",
        updatedAt: new Date(),
      })
      .where(eq(paymentOrders.id, paymentId));

    return NextResponse.json({
      success: true,
      data: {
        paymentOrderId: paymentId,
        providerOrderId: rzpOrder.providerOrderId,
        amountPaise: rzpOrder.amountPaise,
        currency: rzpOrder.currency,
        keyId: rzpOrder.keyId,
      },
    });
  } catch (error: any) {
    console.error("Create payment order error:", error);
    return NextResponse.json(
      { error: { code: "ORDER_CREATION_FAILED", message: error.message || "Failed to create payment order." } },
      { status: 500 }
    );
  }
}
