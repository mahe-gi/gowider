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
  ProviderPaymentDetails,
  ProviderPaymentStatus,
} from "./provider";

let razorpayClient: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (razorpayClient) return razorpayClient;

  const keyId = env.RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Razorpay credentials are not configured in production.");
    }
  }

  razorpayClient = new Razorpay({
    key_id: keyId || "test_key_placeholder",
    key_secret: keySecret || "test_secret_placeholder",
  });

  return razorpayClient;
}

function normalizeRazorpayStatus(status: string): ProviderPaymentStatus {
  switch (status) {
    case "captured":
      return "captured";
    case "authorized":
      return "authorized";
    case "created":
      return "created";
    case "failed":
      return "failed";
    case "refunded":
      return "refunded";
    default:
      return "unknown";
  }
}

export class RazorpayPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<PaymentOrderResult> {
    const rzp = getRazorpayClient();
    const keyId = env.RAZORPAY_KEY_ID || "";

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
    const keySecret = env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      throw new Error("Razorpay key secret is not configured.");
    }

    const text = `${input.providerOrderId}|${input.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    const isSignatureValid = expectedSignature === input.providerSignature;

    if (!isSignatureValid) {
      return {
        success: false,
        providerPaymentId: input.providerPaymentId,
        amountPaise: 0,
        currency: "INR",
        status: "failed",
        isCaptured: false,
      };
    }

    // Fetch real payment state from Razorpay API
    const payment = await this.getPayment(input.providerPaymentId);
    const isCaptured = payment.status === "captured";

    return {
      success: isSignatureValid && isCaptured,
      providerPaymentId: input.providerPaymentId,
      amountPaise: payment.amountPaise,
      currency: payment.currency,
      status: payment.status,
      isCaptured,
    };
  }

  async getPayment(providerPaymentId: string): Promise<ProviderPaymentDetails> {
    try {
      const rzp = getRazorpayClient();
      const payment = await rzp.payments.fetch(providerPaymentId);

      return {
        status: normalizeRazorpayStatus(payment.status),
        amountPaise: Number(payment.amount),
        currency: payment.currency,
        providerOrderId: payment.order_id,
      };
    } catch (error) {
      console.error("Error fetching Razorpay payment details:", error);
      return { status: "unknown", amountPaise: 0, currency: "INR" };
    }
  }

  async getOrder(providerOrderId: string): Promise<{ id: string; status: string; amountPaise: number }> {
    const rzp = getRazorpayClient();
    const order = await rzp.orders.fetch(providerOrderId);
    return {
      id: order.id,
      status: order.status,
      amountPaise: Number(order.amount),
    };
  }
}

export const paymentProvider: PaymentProvider = new RazorpayPaymentProvider();
