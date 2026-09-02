import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { paymentProvider } from "@/lib/payments/razorpay";
import { finalizeCapturedPayment } from "@/lib/payments/finalize-payment";

const verifySchema = z
  .object({
    razorpay_order_id: z.string().optional(),
    razorpay_payment_id: z.string().optional(),
    razorpay_signature: z.string().optional(),
    providerOrderId: z.string().optional(),
    providerPaymentId: z.string().optional(),
    providerSignature: z.string().optional(),
    paymentIntentId: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(data.razorpay_order_id || data.providerOrderId) &&
      Boolean(data.razorpay_payment_id || data.providerPaymentId) &&
      Boolean(data.razorpay_signature || data.providerSignature),
    { message: "Missing required payment verification fields." }
  );

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

    const razorpay_order_id = (validated.data.razorpay_order_id || validated.data.providerOrderId)!;
    const razorpay_payment_id = (validated.data.razorpay_payment_id || validated.data.providerPaymentId)!;
    const razorpay_signature = (validated.data.razorpay_signature || validated.data.providerSignature)!;

    // 1. Verify HMAC SHA-256 Signature & Captured State
    const verification = await paymentProvider.verifyPayment({
      providerOrderId: razorpay_order_id,
      providerPaymentId: razorpay_payment_id,
      providerSignature: razorpay_signature,
    });

    if (!verification.success || !verification.isCaptured) {
      return NextResponse.json(
        { error: { code: "PAYMENT_NOT_CAPTURED", message: "Payment signature invalid or payment was not captured." } },
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
        { error: { code: finalized.errorCode || "FINALIZATION_FAILED", message: finalized.error || "Failed to finalize payment." } },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentOrderId: finalized.paymentOrder?.id || "",
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
