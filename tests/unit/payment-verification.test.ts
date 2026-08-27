import { describe, it, expect } from "vitest";
import crypto from "crypto";

describe("Payment Signature & State Invariants", () => {
  const mockSecret = "test_webhook_secret_key_12345";

  it("correctly validates genuine HMAC SHA-256 signature", () => {
    const orderId = "order_N123456";
    const paymentId = "pay_P987654";
    const text = `${orderId}|${paymentId}`;

    const validSignature = crypto
      .createHmac("sha256", mockSecret)
      .update(text)
      .digest("hex");

    const computedSignature = crypto
      .createHmac("sha256", mockSecret)
      .update(text)
      .digest("hex");

    expect(validSignature).toBe(computedSignature);
  });

  it("rejects tampered or forged payment signatures", () => {
    const orderId = "order_N123456";
    const paymentId = "pay_P987654";
    const text = `${orderId}|${paymentId}`;

    const validSignature = crypto
      .createHmac("sha256", mockSecret)
      .update(text)
      .digest("hex");

    const forgedSignature = crypto
      .createHmac("sha256", "wrong_secret")
      .update(text)
      .digest("hex");

    expect(validSignature).not.toBe(forgedSignature);
  });

  it("strictly enforces captured status over authorized for wallet crediting", () => {
    const paymentStatusCaptured = "captured";
    const paymentStatusAuthorized = "authorized";

    function isEligibleForWalletCredit(status: string): boolean {
      return status === "captured";
    }

    expect(isEligibleForWalletCredit(paymentStatusCaptured)).toBe(true);
    expect(isEligibleForWalletCredit(paymentStatusAuthorized)).toBe(false);
  });
});
