import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "@/lib/env";
import type {
  PaymentProvider,
  CreateOrderInput,
  PaymentOrderResult,
  VerifyPaymentInput,
  VerifiedPayment,
} from "./provider";

let razorpayClient: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (razorpayClient) return razorpayClient;

  const keyId = env.RAZORPAY_KEY_ID || "rzp_test_mock";
  const keySecret = env.RAZORPAY_KEY_SECRET || "mock_secret";

  razorpayClient = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayClient;
}

export class RazorpayPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<PaymentOrderResult> {
    const rzp = getRazorpayClient();
    const keyId = env.RAZORPAY_KEY_ID || "rzp_test_mock";

    const options = {
      amount: input.amountPaise,
      currency: input.currency || "INR",
      receipt: input.receipt,
      notes: input.notes || {},
    };

    const order = await rzp.orders.create(options);

    return {
      providerOrderId: order.id,
      amountPaise: Number(order.amount),
      currency: order.currency,
      keyId,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifiedPayment> {
    const keySecret = env.RAZORPAY_KEY_SECRET || "mock_secret";

    const text = `${input.providerOrderId}|${input.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isMatch = expectedSignature === input.providerSignature;

    if (!isMatch) {
      return {
        success: false,
        providerPaymentId: input.providerPaymentId,
        amountPaise: 0,
        currency: "INR",
        status: "failed",
      };
    }

    // Fetch payment details to verify captured state
    const payment = await this.getPayment(input.providerPaymentId);

    return {
      success: payment.status === "captured" || payment.status === "authorized",
      providerPaymentId: input.providerPaymentId,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      status: payment.status === "captured" || payment.status === "authorized" ? "paid" : "failed",
    };
  }

  async getPayment(providerPaymentId: string): Promise<{ status: string; amountPaise: number; currency: string }> {
    try {
      const rzp = getRazorpayClient();
      const payment = await rzp.payments.fetch(providerPaymentId);

      return {
        status: payment.status,
        amountPaise: Number(payment.amount),
        currency: payment.currency,
      };
    } catch (error) {
      console.error("Error fetching Razorpay payment:", error);
      return { status: "unknown", amountPaise: 0, currency: "INR" };
    }
  }
}

export const paymentProvider: PaymentProvider = new RazorpayPaymentProvider();
