export interface CreateOrderInput {
  userId: string;
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
}

export interface VerifiedPayment {
  success: boolean;
  providerPaymentId: string;
  amountPaise: number;
  status: "paid" | "failed";
  currency: string;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifiedPayment>;
  getPayment(providerPaymentId: string): Promise<{ status: string; amountPaise: number; currency: string }>;
}
