# GoWider — Authentication, Credits & Payment Architecture

## 1. Core Principles
1. **Value First:** Complete studio configuration, video upload, duration check, and cost estimation are available to guests before authentication.
2. **Identity on Intent:** Auth is triggered when the user clicks `Generate` (or accesses account features).
3. **Automatic Progression:** Login → Guest Merge → (if needed) Top-Up → Payment Verification → Credit Reservation → Sarvam Job Dispatch happens smoothly without resetting the user's progress.
4. **All Money in Integer Paise:** All wallet balances, pricing, order amounts, and transaction ledgers use integer paise ($100\text{ paise} = ₹1.00$).

---

## 2. Decoupled Payment Architecture

### `PaymentProvider` Interface
To allow switching providers (e.g., Razorpay → Cashfree) without rewriting wallet or studio logic:

```typescript
// lib/payments/provider.ts
export interface CreateOrderInput {
  userId: string;
  amountPaise: number;
  currency: "INR";
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  keyId: string; // Public client key
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
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<PaymentOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifiedPayment>;
  getPayment(providerPaymentId: string): Promise<{ status: string; amountPaise: number }>;
}
```

### Razorpay Implementation (`lib/payments/razorpay.ts`)
- Server-side order creation using `razorpay` Node SDK.
- HMAC SHA256 signature verification for frontend callbacks and webhooks (`crypto.createHmac("sha256", secret)`).
- Webhook route: `POST /api/webhooks/razorpay` processes `order.paid` / `payment.captured` events idempotently.

---

## 3. Wallet Ledger & Atomic Concurrency (`lib/wallet/`)

### Ledger Table: `wallet_transactions`
Tracks all balance movements:
- `purchase`: Credits added via verified payment order.
- `reservation`: Credits locked prior to Sarvam job dispatch.
- `usage`: Finalized cost deducted upon job completion.
- `release`: Reserved credits returned to available balance on job failure or cancellation.
- `refund`: Unused reserved credits returned on partial failures.
- `manual_adjustment`: Admin credits/seeding.

### Concurrency Protection & Credit Reservation
When starting a generation:
```sql
-- Atomic credit reservation
UPDATE wallets
SET reserved_paise = reserved_paise + :requiredCost,
    updated_at = NOW()
WHERE user_id = :userId
  AND (balance_paise - reserved_paise) >= :requiredCost
RETURNING balance_paise, reserved_paise;
```
If 0 rows returned, the transaction fails with `INSUFFICIENT_CREDITS`.

---

## 4. Authoritative Pricing Engine (`lib/pricing/dubbing.ts`)

```typescript
export const PRICING_CONFIG = {
  // e.g. ₹40 per minute = 4000 paise per 60 seconds ≈ 66.67 paise/sec
  pricePerMinutePaise: parseInt(process.env.SARVAM_DUBBING_PRICE_PER_MINUTE_PAISE || "4000", 10),
  minimumDurationSeconds: 10,
};

export function calculateEstimatedCost(durationSeconds: number, targetLanguageCount: number): number {
  const duration = Math.max(durationSeconds, PRICING_CONFIG.minimumDurationSeconds);
  const costPerTarget = Math.ceil((duration / 60) * PRICING_CONFIG.pricePerMinutePaise);
  return costPerTarget * targetLanguageCount;
}
```

---

## 5. 20-Step Recommended Build Sequence

```text
01. Video upload to R2 (presigned URL)
02. Studio video preview & duration detection
03. Language configuration & cost estimation
04. Sarvam end-to-end dubbing pipeline
05. Processing & Result Studio (Tabbed player)
06. Anonymous guest session & cookie management
07. Managed authentication (Clerk / Supabase Auth)
08. Guest → Account project migration
09. Wallet schema & transaction ledger
10. Authoritative pricing calculator
11. Dev / POC credit seeding & access gate
12. Atomic credit reservation on generate
13. Razorpay order creation API
14. Razorpay frontend checkout modal
15. Razorpay webhook verification & ledger crediting
16. Wallet auto-resume on payment completion
17. Payment recovery & idempotency
18. Partial failure reconciliation & refunds
19. Minimal User Projects page (`/projects`)
20. Complete edge-case QA & visual verification
```
