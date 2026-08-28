import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createOrGetPaymentOrder, PaymentIntentConflictError } from "@/lib/payments/order-service";

const orderSchema = z.object({
  amountPaise: z.number().min(1000, "Minimum top-up is ₹10 (1000 paise).").max(1000000, "Maximum top-up is ₹10,000."),
  paymentIntentId: z.string().min(1, "paymentIntentId is required."),
  generationRunId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate Limit: Max 30 payment orders per 5 minutes per user
    const rateCheck = await checkRateLimit(`rate:pay_order:${userId}`, 30, 300);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: { code: "RATE_LIMITED", message: "Too many payment requests. Please wait a moment." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = orderSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: validated.error.errors[0].message } },
        { status: 400 }
      );
    }

    const orderResult = await createOrGetPaymentOrder({
      userId,
      paymentIntentId: validated.data.paymentIntentId,
      amountPaise: validated.data.amountPaise,
      generationRunId: validated.data.generationRunId,
    });

    return NextResponse.json({
      success: true,
      data: orderResult,
    });
  } catch (error: any) {
    if (error instanceof PaymentIntentConflictError || error.message?.includes("Payment intent")) {
      return NextResponse.json(
        { error: { code: "INTENT_CONFLICT", message: error.message } },
        { status: 409 }
      );
    }

    if (error.message?.startsWith("FORBIDDEN")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: error.message } },
        { status: 403 }
      );
    }

    console.error("Create payment order error:", error);
    return NextResponse.json(
      { error: { code: "ORDER_CREATION_FAILED", message: error.message || "Failed to create payment order." } },
      { status: 500 }
    );
  }
}
