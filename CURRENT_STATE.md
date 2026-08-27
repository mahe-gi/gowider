# Current State

## Last Updated
2026-08-27 19:57 IST

## Current Goal
Complete GoWider Production V1 implementation across all backend services, database migrations, Inngest durable workflows, Razorpay payment flows, Auth.js Google OAuth, private R2 storage pipelines, and the editorial creator studio frontend.

## Completed
- **Phase 0 — Documentation & Architecture Reconciled**: Updated `RULES.md`, `PRD.md`, `ARCHITECTURE.md`, `TASKS.md`, `CURRENT_STATE.md`.
- **Phase 1 — Data Models & Scaffolding**:
  - Full 9-table Drizzle schema (`users`, `guest_sessions`, `projects`, `generation_runs`, `project_outputs`, `wallets`, `payment_orders`, `wallet_transactions`, `payment_webhook_events`).
  - Drizzle + Neon PostgreSQL connection client (`lib/db/index.ts`).
  - Strict Zod environment parser (`lib/env.ts`) & configuration (`lib/constants.ts`).
- **Phase 2 — Guest Upload & Studio Preview**:
  - Anonymous guest session cookie manager with SHA-256 token hashing (`lib/auth/guest.ts`).
  - Private R2 presigned PUT upload generator (`lib/r2/uploads.ts`).
  - Direct browser upload zone with duration probe $\le 90\text{ s}$ (`components/upload-zone.tsx`).
  - Prominent 9:16 vertical video player with replace option (`components/studio-video.tsx`).
- **Phase 3 — Studio Configuration & Authoritative Pricing**:
  - Integer paise pricing engine (`lib/pricing/dubbing.ts`).
  - Native script target language selector (`components/language-selector.tsx`).
  - Pre-generation summary with voice ownership rights checkbox (`components/generation-summary.tsx`).
  - Configuration route (`app/api/projects/[id]/configure/route.ts`).
- **Phase 4 — Auth.js & Guest-to-Account Merge**:
  - Auth.js with Google OAuth provider (`lib/auth/auth.ts`, `app/api/auth/[...nextauth]/route.ts`).
  - Idempotent guest project merge handler (`lib/auth/merge.ts`, `app/api/auth/guest-merge/route.ts`).
  - Ownership access assertion helper (`lib/auth/ownership.ts`).
  - In-Studio Google login sheet (`components/auth-sheet.tsx`).
- **Phase 5 — Wallet Ledger & Atomic Reservations**:
  - Immutable transaction ledger (`lib/wallet/ledger.ts`).
  - Atomic SQL credit reservation (`lib/wallet/reserve.ts`).
  - Settlement & refund handler (`lib/wallet/settle.ts`).
  - Wallet service & dev credit seed endpoint (`lib/wallet/service.ts`, `app/api/wallet/route.ts`).
- **Phase 6 & 7 — Inngest Durable Execution & Sarvam Integration**:
  - Inngest client and server route (`lib/inngest/client.ts`, `app/api/inngest/route.ts`).
  - Complete 10-step Sarvam dubbing durable workflow (`lib/inngest/functions/generation.ts`).
  - Streaming R2 $\rightarrow$ Sarvam upload with `x-ms-blob-type: BlockBlob`.
  - Polling live status and export status (`limit=100`).
  - Archiving video and SRT outputs into private R2 (`lib/r2/outputs.ts`).
  - Generate endpoint (`app/api/projects/[id]/generate/route.ts`).
- **Phase 8 & 9 — Result Studio & Targeted Retry**:
  - Single dominant video player with language tabs (`Original`, `हिन्दी`, `தமிழ்`, `ಕನ್ನಡ`) (`components/result-studio.tsx`, `components/language-tabs.tsx`).
  - 15-minute signed GET download route for video & SRT (`app/api/projects/[id]/download/[language]/[format]/route.ts`).
  - Targeted retry route for failed languages only (`app/api/projects/[id]/retry/route.ts`).
- **Phase 10, 11 & 12 — Razorpay Payments & Auto-Resume**:
  - Pluggable `PaymentProvider` interface and `RazorpayPaymentProvider` (`lib/payments/provider.ts`, `lib/payments/razorpay.ts`).
  - Razorpay order creation route (`app/api/payments/order/route.ts`).
  - In-Studio credit top-up modal (`components/credit-sheet.tsx`).
  - HMAC SHA-256 signature verification route (`app/api/payments/verify/route.ts`).
  - Webhook route with event deduplication (`app/api/webhooks/razorpay/route.ts`, `lib/inngest/functions/payment-webhook.ts`).
  - Auto-resume post-payment logic (`lib/payments/finalize-payment.ts`).
- **Phase 13, 14 & 15 — Library, Maintenance & Security**:
  - Minimal user Reels library page (`app/projects/page.tsx`).
  - Scheduled Inngest cleanup and payment reconciliation jobs (`lib/inngest/functions/cleanup.ts`, `lib/inngest/functions/reconciliation.ts`).
  - `server-only` guards across sensitive server modules.
- **Phase 16 & 17 — Verification & Editorial Frontend**:
  - High-end typography (`Instrument Serif`, `Geist Sans`, `Geist Mono`).
  - Full landing page composition with interactive hero Reel expansion, transformation visual, how it works, voice cloning identity, and pan-India language marquee.
  - TypeScript compilation: 0 errors (`npx tsc --noEmit`).
  - Production build: Succeeded in 2.3s across all 14 routes (`npm run build`).

## In Progress
- Completed all tasks.

## Known Issues
- None.

## Important Decisions
- **Durable Engine:** Inngest handles all long-running asynchronous workflows (Sarvam streaming, polling, export downloading, R2 caching, settlement, reconciliation).
- **Guest-First Studio:** Zero friction for upload and configuration; auth triggered on Generate; wallet top-up auto-resumes generation.
- **All Money in Integer Paise:** Authoritative server-side pricing and atomic balance locking.
- **Billing Policy:** Creators are charged only for successful video exports; unused reservations for failed targets are immediately refunded.
- **Private R2 Storage:** Sources and outputs remain private; 15-minute presigned GET URLs generated on demand.

## Files Changed
- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `drizzle.config.ts`
- `.env.example`
- `db/schema.ts`
- `lib/env.ts`
- `lib/constants.ts`
- `lib/db/index.ts`
- `lib/auth/guest.ts`
- `lib/auth/ownership.ts`
- `lib/auth/merge.ts`
- `lib/auth/auth.ts`
- `lib/pricing/dubbing.ts`
- `lib/r2/client.ts`
- `lib/r2/uploads.ts`
- `lib/r2/outputs.ts`
- `lib/sarvam/types.ts`
- `lib/sarvam/client.ts`
- `lib/sarvam/dubbing.ts`
- `lib/wallet/ledger.ts`
- `lib/wallet/reserve.ts`
- `lib/wallet/settle.ts`
- `lib/wallet/service.ts`
- `lib/payments/provider.ts`
- `lib/payments/razorpay.ts`
- `lib/payments/finalize-payment.ts`
- `lib/inngest/client.ts`
- `lib/inngest/functions/generation.ts`
- `lib/inngest/functions/payment-webhook.ts`
- `lib/inngest/functions/cleanup.ts`
- `lib/inngest/functions/reconciliation.ts`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/project/[id]/page.tsx`
- `app/projects/page.tsx`
- `app/api/inngest/route.ts`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/auth/guest-merge/route.ts`
- `app/api/uploads/presign/route.ts`
- `app/api/uploads/complete/route.ts`
- `app/api/projects/route.ts`
- `app/api/projects/[id]/route.ts`
- `app/api/projects/[id]/configure/route.ts`
- `app/api/projects/[id]/generate/route.ts`
- `app/api/projects/[id]/retry/route.ts`
- `app/api/projects/[id]/download/[language]/[format]/route.ts`
- `app/api/wallet/route.ts`
- `app/api/payments/order/route.ts`
- `app/api/payments/verify/route.ts`
- `app/api/webhooks/razorpay/route.ts`
- `components/navigation.tsx`
- `components/hero.tsx`
- `components/hero-reel-transform.tsx`
- `components/transformation-section.tsx`
- `components/upload-zone.tsx`
- `components/studio-video.tsx`
- `components/language-selector.tsx`
- `components/generation-summary.tsx`
- `components/auth-sheet.tsx`
- `components/credit-sheet.tsx`
- `components/processing-status.tsx`
- `components/result-studio.tsx`
- `components/language-tabs.tsx`
- `components/offline-banner.tsx`
- `components/how-it-works.tsx`
- `components/voice-section.tsx`
- `components/language-marquee.tsx`
- `components/footer.tsx`
- `TASKS.md`
- `CURRENT_STATE.md`
- `CHANGELOG.md`
