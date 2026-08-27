# File-by-File Change Documentation

## Production Correctness & Security Remediation (Phase 1)

### `app/api/wallet/route.ts`
- **Action:** Modified
- **What changed:** Removed public `POST` handler that allowed arbitrary balance mutations. Endpoint now only exports `GET` for authenticated users.
- **Why:** Prevent users from crediting their own wallets for free.
- **Related task:** #2 Public free-credit vulnerability fix.
- **Verification:** Verified route exports only GET; TypeScript check + Next.js build.

### `scripts/seed-dev-credits.ts`
- **Action:** Created
- **What changed:** Added a secure standalone CLI script to manually seed developer wallet credits for testing (`npm run dev:seed-credits -- user@example.com 50000`).
- **Why:** Safely provide local test credits without exposing a production API attack surface. Hard-fails in production unless `ENABLE_DEV_CREDIT_SEED=true`.
- **Related task:** #2 Public free-credit vulnerability fix.
- **Verification:** Tested command parser and user lookup logic.

### `db/schema.ts`
- **Action:** Modified
- **What changed:** Added PostgreSQL constraints (`balance_paise >= 0`, `reserved_paise >= 0`, `reserved_paise <= balance_paise`), unique indexes on `payment_orders.provider_payment_id`, `generation_runs.settled_at`, `generation_runs.dispatch_state`, `rate_limits` table, and `webhook_status` enum.
- **Why:** Enforce financial and execution invariants at the database level rather than trusting JavaScript memory.
- **Related task:** #3 Database-Level Payment Idempotency, #8 Wallet Reservation, #9 Settlement, #31 Rate Limiting.
- **Verification:** Generated migration with `drizzle-kit generate`; TypeScript check + build.

### `db/migrations/0000_faithful_nico_minoru.sql`
- **Action:** Created
- **What changed:** Generated Drizzle SQL migration with all tables, constraints, enums, and indexes.
- **Why:** Version control schema changes and apply database constraints.
- **Related task:** #49 Database Migrations.
- **Verification:** Inspected SQL definitions for correctness.

### `lib/payments/provider.ts`
- **Action:** Modified
- **What changed:** Added explicit `ProviderPaymentStatus` enum (`created`, `authorized`, `captured`, `failed`, `refunded`, `unknown`) and `isCaptured` boolean flag.
- **Why:** Prevent `authorized` payment state from being treated as `captured` / `paid`.
- **Related task:** #6 Razorpay Authorized != Paid & #7 Payment Provider Types.
- **Verification:** TypeScript check + unit test `tests/unit/payment-verification.test.ts`.

### `lib/payments/razorpay.ts`
- **Action:** Modified
- **What changed:** Updated `verifyPayment` to require HMAC signature validity AND verified `captured` payment status from Razorpay API. Added `getOrder` method.
- **Why:** Prevent false crediting when payments are merely authorized or pending.
- **Related task:** #6 Razorpay Authorized != Paid & #28 Payment Reconciliation.
- **Verification:** Unit tests in `tests/unit/payment-verification.test.ts` + TypeScript check.

### `lib/payments/finalize-payment.ts`
- **Action:** Modified
- **What changed:** Wrapped payment order status update, wallet balance increment, and purchase ledger insertion in a single atomic PostgreSQL transaction. Enforced authoritative `order.amountPaise === amountPaise` check. Added auto-resume dispatch via `dispatchGenerationRun`.
- **Why:** Eliminate race conditions between frontend verify callbacks and Razorpay webhooks that could cause double crediting.
- **Related task:** #3 Truly Atomic Payment Finalization & #5 Verify Payment Amount.
- **Verification:** Verified transaction atomicity logic; unit tests + build.

### `lib/wallet/reserve.ts`
- **Action:** Modified
- **What changed:** Wrapped balance reservation in a single PostgreSQL transaction with strict `(balance_paise - reserved_paise) >= requiredCost` lock. Added idempotency check on `(generationRunId, 'reservation')`.
- **Why:** Prevent duplicate reservations on concurrent generation attempts or retried requests.
- **Related task:** #8 Transactional & Idempotent Wallet Reservation.
- **Verification:** Unit tests in `tests/unit/wallet-invariants.test.ts` + TypeScript check.

### `lib/wallet/settle.ts`
- **Action:** Modified
- **What changed:** Added `settledAt` checkpoint check, transactional `balance_paise` and `reserved_paise` deductions, separate usage and release ledger transactions, and enforced invariant `finalCostPaise <= reservedCostPaise`.
- **Why:** Make wallet settlement retry-safe for Inngest step retries without leaking unspent credits.
- **Related task:** #9 Retry-Safe Wallet Settlement & #10 Financial Invariants.
- **Verification:** Unit tests in `tests/unit/wallet-invariants.test.ts`.

### `lib/wallet/ledger.ts`
- **Action:** Modified
- **What changed:** Updated transaction status enum to strictly match schema (`completed`, `failed`, `pending`, `reversed`).
- **Why:** Maintain type safety across immutable financial ledger insertions.
- **Related task:** #10 Financial Invariants.
- **Verification:** TypeScript compilation (`npx tsc --noEmit`).

### `lib/media/metadata.ts`
- **Action:** Created
- **What changed:** Built lightweight ISO BMFF / QuickTime MP4 atom parser that extracts authoritative video duration from `mvhd` box.
- **Why:** Eliminate trust in client-submitted browser video duration and enforce 1s–90s limits server-side before billing.
- **Related task:** #18 Trusted Server-Side Video Duration.
- **Verification:** Unit tests in `tests/unit/metadata.test.ts` using synthetic MP4 atom buffers.

### `app/api/uploads/complete/route.ts`
- **Action:** Modified
- **What changed:** Reads initial video header chunks from R2, calls `parseMp4MovMetadata`, and records `serverVerifiedDurationSeconds` in PostgreSQL.
- **Why:** Store authoritative server-derived duration for billing calculations.
- **Related task:** #18 Server-Side Video Duration & #19 Duration Mismatch.
- **Verification:** TypeScript compilation + Next.js build.

### `lib/inngest/dispatch.ts`
- **Action:** Created
- **What changed:** Reusable Inngest event dispatcher that sets `dispatchState` to `dispatched` or `failed` without swallowing exceptions or faking generation start.
- **Why:** Prevent orphaned queued jobs and allow reconciliation cron to safely recover pending dispatches.
- **Related task:** #13 Do Not Swallow Inngest Dispatch Failure & #14 Dispatch Recovery.
- **Verification:** TypeScript compilation + unit tests.

### `lib/inngest/functions/generation.ts`
- **Action:** Modified
- **What changed:** Fixed multi-language output lookup to query by `(projectId, targetLanguage)` composite key. Replaced long `setTimeout` loop with durable Inngest step-level polling (`step.sleep`). Added Sarvam job resumption on retried events.
- **Why:** Fix multi-language output overwrite bug and make background execution resilient to restarts and timeouts.
- **Related task:** #11 Multi-Language project_outputs Bug, #15 Durable Sarvam Polling, #17 Generation Run Idempotency.
- **Verification:** TypeScript check + build verification.

### `lib/inngest/functions/payment-webhook.ts`
- **Action:** Modified
- **What changed:** Marked `paymentWebhookEvents.status = 'processed'` upon successful payment finalization.
- **Why:** Maintain accurate lifecycle state for incoming provider webhooks.
- **Related task:** #21 Webhook Event Loss Hole.
- **Verification:** TypeScript check + build.

### `app/api/webhooks/razorpay/route.ts`
- **Action:** Modified
- **What changed:** Added deterministic event ID derivation (no random IDs), webhook status transitions (`received`, `dispatch_pending`, `dispatched`, `processed`), and safe re-dispatch on retried webhooks.
- **Why:** Prevent lost webhook events if Inngest is temporarily unreachable.
- **Related task:** #21 Webhook Event Loss Hole & #23 Never Invent Razorpay Event IDs.
- **Verification:** TypeScript compilation + build.

### `lib/inngest/functions/cleanup.ts`
- **Action:** Modified
- **What changed:** Implemented real R2 deletion for eligible expired guest source videos and output files via `deleteR2Object`. Updated project status to `expired`.
- **Why:** Actually clean up cloud storage per retention policy without affecting active runs.
- **Related task:** #25 Real Media Cleanup & #26 Explicit Expiration State.
- **Verification:** TypeScript compilation + build.

### `lib/r2/uploads.ts`
- **Action:** Modified
- **What changed:** Added `deleteR2Object(key)` helper.
- **Why:** Support storage cleanup operations.
- **Related task:** #25 Real Media Cleanup.
- **Verification:** TypeScript compilation.

### `lib/inngest/functions/reconciliation.ts`
- **Action:** Modified
- **What changed:** Added reconciliation for stuck `queued` generation runs (re-dispatches with same `generationRunId`) and pending payment orders.
- **Why:** Auto-recover stuck runs and abandoned payment intents.
- **Related task:** #14 Dispatch Recovery, #27 Generation Reconciliation, #28 Payment Reconciliation.
- **Verification:** TypeScript compilation + build.

### `lib/security/rate-limit.ts`
- **Action:** Created
- **What changed:** Implemented PostgreSQL-backed sliding window rate limiter (`checkRateLimit`).
- **Why:** Protect sensitive API endpoints against spam and automated abuse in serverless production without requiring Redis.
- **Related task:** #31 Production Rate Limiting & #32 Payment/Generate Abuse Limits.
- **Verification:** TypeScript compilation + build.

### `app/api/projects/[id]/generate/route.ts`
- **Action:** Modified
- **What changed:** Added rate limiting (max 10 requests/5 min), used server-verified duration for pricing, and integrated `dispatchGenerationRun`.
- **Why:** Protect generation endpoint and ensure reliable dispatch error handling.
- **Related task:** #13 Inngest Dispatch & #32 Rate Limiting.
- **Verification:** TypeScript compilation + build.

### `app/api/projects/[id]/retry/route.ts`
- **Action:** Modified
- **What changed:** Added rate limiting, used server-verified duration for targeted retry pricing, and integrated `dispatchGenerationRun`.
- **Why:** Ensure retry operations are safe and durable.
- **Related task:** #12 Targeted Retry Integrity & #13 Inngest Dispatch.
- **Verification:** TypeScript compilation + build.

### `app/api/payments/order/route.ts`
- **Action:** Modified
- **What changed:** Added rate limiting and verified user ownership of linked `generationRunId`.
- **Why:** Prevent unauthorized order generation and payment automation abuse.
- **Related task:** #32 Payment Abuse Limits & #35 Payment API Security.
- **Verification:** TypeScript compilation + build.

### `app/api/payments/verify/route.ts`
- **Action:** Modified
- **What changed:** Checked `isCaptured` status and used `finalized.paymentOrder?.id`.
- **Why:** Guarantee payment capture before returning success.
- **Related task:** #6 Razorpay Authorized != Paid & #35 Payment Verification.
- **Verification:** TypeScript compilation + build.

### `app/api/uploads/presign/route.ts`
- **Action:** Modified
- **What changed:** Added rate limiting (max 20 presigns/5 min per client).
- **Why:** Prevent storage presign abuse.
- **Related task:** #31 Production Rate Limiting.
- **Verification:** TypeScript compilation + build.

### `next.config.ts`
- **Action:** Modified
- **What changed:** Added production Content-Security-Policy (restricted to Razorpay, Google, and R2), X-Content-Type-Options, Referrer-Policy, and Permissions-Policy headers.
- **Why:** Prevent XSS, clickjacking, and injection attacks.
- **Related task:** #33 Security Headers / CSP.
- **Verification:** Next.js build verification (`14/14 routes compiled`).

### `components/credit-sheet.tsx`
- **Action:** Modified
- **What changed:** Removed optimistic balance calculation. After payment verification, fetches authoritative server balance via `GET /api/wallet`.
- **Why:** Ensure UI never derives financial balance truth.
- **Related task:** #36 Fix CreditSheet's Optimistic Balance.
- **Verification:** TypeScript compilation + build.

### `lib/pricing/dubbing.ts`
- **Action:** Modified
- **What changed:** Handled 0 target languages gracefully returning ₹0.00.
- **Why:** Prevent division/calculation errors when 0 languages are passed.
- **Related task:** #40 Unit Tests.
- **Verification:** Unit test `tests/unit/pricing.test.ts`.

### `vitest.config.ts`
- **Action:** Created
- **What changed:** Vitest test runner configuration with `@/` path alias and `server-only` test mock.
- **Why:** Enable fast local unit and integration testing.
- **Related task:** #39 Add Real Test Infrastructure.
- **Verification:** Ran `npm run test` (23 tests passed).

### `tests/unit/pricing.test.ts`
- **Action:** Created
- **What changed:** Unit tests for pricing formula (1s, 59s, 60s, 61s, 90s, 1 target, 3 targets, 0 targets).
- **Why:** Guarantee integer paise arithmetic correctness.
- **Related task:** #40 Unit Tests.
- **Verification:** Ran via Vitest (6 tests passed).

### `tests/unit/metadata.test.ts`
- **Action:** Created
- **What changed:** Unit tests for ISO BMFF MP4/MOV atom header parsing (timescale conversion, rounding, max duration boundary).
- **Why:** Guarantee server video duration parser integrity.
- **Related task:** #40 Unit Tests.
- **Verification:** Ran via Vitest (4 tests passed).

### `tests/unit/language-codes.test.ts`
- **Action:** Created
- **What changed:** Unit tests for BCP-47 language codes (`or-IN` for Odia, `as-IN` for Assamese, 12 language pairs).
- **Why:** Guarantee Sarvam API compatibility.
- **Related task:** #40 Unit Tests.
- **Verification:** Ran via Vitest (3 tests passed).

### `tests/unit/payment-verification.test.ts`
- **Action:** Created
- **What changed:** Unit tests for Razorpay HMAC SHA-256 signature verification and captured state checking.
- **Why:** Guarantee payment verification security.
- **Related task:** #40 Unit Tests.
- **Verification:** Ran via Vitest (3 tests passed).

### `tests/unit/wallet-invariants.test.ts`
- **Action:** Created
- **What changed:** Unit tests for wallet mathematical invariants, available balance calculation, and partial failure usage/release accounting.
- **Why:** Guarantee financial safety under all edge cases.
- **Related task:** #10 Financial Invariants & #40 Unit Tests.
- **Verification:** Ran via Vitest (3 tests passed).

### `tests/unit/ownership.test.ts`
- **Action:** Created
- **What changed:** Unit tests for guest vs authenticated user ownership access control.
- **Why:** Ensure claimed projects cannot be hijacked via old guest cookies.
- **Related task:** #40 Unit Tests.
- **Verification:** Ran via Vitest (4 tests passed).

## Local Environment Configuration (Google OAuth)

### `.env.local`
- **Action:** Created / Modified (Git Ignored)
- **What changed:** Configured local development environment with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- **Why:** Enable local testing of Google OAuth sign-in and guest project merge.
- **Related task:** Local Auth Verification.
- **Verification:** Verified file is git-ignored; dev server restarted and loaded on `http://localhost:3000`.

## Local Docker PostgreSQL Integration

### `docker-compose.yml`
- **Action:** Created
- **What changed:** Added Docker Compose service running `postgres:16-alpine` container named `gowider-postgres` on port `5432:5432` with persistent volume `postgres_data`.
- **Why:** Provide a lightweight, isolated local PostgreSQL database.
- **Related task:** Local Database Setup.
- **Verification:** Ran `docker compose up -d` and confirmed all 10 schema tables applied via `npx drizzle-kit push`.

### `lib/db/index.ts`
- **Action:** Modified
- **What changed:** Dual driver support — utilizes `postgres.js` for local Docker PostgreSQL and `@neondatabase/serverless` for Neon cloud.
- **Why:** Ensure seamless development against local Docker PostgreSQL without breaking serverless production deployments.
- **Related task:** Local Database Setup.
- **Verification:** Verified live table queries against `gowider-postgres`.

## Auth.js Discovery & PKCE Resolution

### `lib/auth/auth.ts`
- **Action:** Modified
- **What changed:** Removed placeholder fallback defaults and enabled `trustHost: true`.
- **Why:** Ensure Auth.js strictly binds to the provided Google OAuth credentials and trusts localhost origin headers.
- **Related task:** Google OAuth Local Verification.
- **Verification:** Verified OIDC discovery and PKCE authorization redirect to `https://accounts.google.com/o/oauth2/v2/auth` (`302 Found`).

## Navbar Logo & Auth Modal Copy Polish

### `components/navigation.tsx`
- **Action:** Modified
- **What changed:** Updated the brand logo container to target width ~136px (desktop) / ~120px (mobile) and height ~34px (desktop) / ~30px (mobile) using tightly cropped `/brand/logo-wordmark.png` with `object-contain object-left`.
- **Why:** The previous logo rendered too small in the navbar because of excess transparent padding in the 16:9 canvas.
- **Related task:** Fix Navbar Logo.
- **Verification:** TypeScript compilation + production build + browser viewport layout inspection.

### `public/brand/logo-wordmark.png`
- **Action:** Created
- **What changed:** Generated a tightly cropped wordmark asset (960x260, 3.69:1 aspect ratio) from the master brand artwork.
- **Why:** Ensure the `gowider` wordmark fills the target navbar dimensions without aspect ratio distortion or excessive transparent whitespace.
- **Related task:** Fix Navbar Logo.
- **Verification:** Image dimension analysis (`sips`) + visual presentation check.

### `components/footer.tsx`
- **Action:** Modified
- **What changed:** Updated footer to use `/brand/logo-wordmark.png` with proportional dimensions.
- **Why:** Maintain consistent brand wordmark rendering across the application.
- **Related task:** Fix Navbar Logo.
- **Verification:** TypeScript compilation + build.

### `components/auth-sheet.tsx`
- **Action:** Modified
- **What changed:** Replaced permanent-storage description with `"Sign in with Google to continue localization and access your projects from your account."`, added crisp inline Google SVG icon to the `Continue with Google` button, and updated reassurance text to `"Your progress will be saved."` with shield icon.
- **Why:** Eliminate unsupported permanent storage promises, fix Google icon rendering, and simplify reassurance copy.
- **Related task:** Fix Auth Modal Copy.
- **Verification:** Manual browser verification + TypeScript check + Next.js build.
