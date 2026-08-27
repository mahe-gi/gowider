import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { paymentProvider } from "@/lib/payments/razorpay";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "User not authenticated." } }, { status: 401 });
    }

    const body = await req.json();
    const validated = verifySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Missing required payment verification fields." } },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validated.data;

    // 1. Verify HMAC SHA-256 Signature
    const verification = await paymentProvider.verifyPayment({
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
      providerSignature: razorpay_signature,
    });

    if (!verification.success) {
      return NextResponse.json(
        { error: { code: "INVALID_SIGNATURE", message: "Payment signature verification failed." } },
        { status: 400 }
      );
    }

    // 2. Finalize Captured Payment (Atomic DB transaction + Auto-Resume)
    const finalized = await finalizeCapturedPayment({
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
      amountPaise: verification.amountPaise,
    });

    if (!finalized.success) {
      return NextResponse.json(
        { error: { code: "FINALIZATION_FAILED", message: finalized.error || "Failed to finalize payment." } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentOrderId: finalized.paymentOrder.id,
        status: "paid",
        autoResumedRunId: finalized.autoResumedRunId,
      },
    });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: { code: "VERIFY_FAILED", message: error.message || "Payment verification error." } },
      { status: 500 }
    );
  }
}
