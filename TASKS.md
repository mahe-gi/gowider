# Tasks — GoWider (Production V1 Implementation Roadmap)

## Phase 0 — Documentation & Architecture Alignment
- [x] Reconcile `RULES.md` (Stage: GoWider Public V1, approved stack: Next.js, Auth.js, Inngest, Razorpay, R2, Neon, Sarvam).
- [x] Reconcile `PRD.md` (GoWider production V1 requirements, scope, and success criteria).
- [x] Reconcile `ARCHITECTURE.md` (Inngest durable execution, normalized database schema, private R2 storage, wallet ledger).
- [x] Reconcile `TASKS.md` (Phases 0–17 master roadmap).
- [x] Update `CURRENT_STATE.md` and `CHANGELOG.md`.

## Phase 1 — Project Scaffolding & Core Data Model
- [x] **Step 1.1 — Scaffolding & Dependencies**
  - [x] Initialize Next.js 15 App Router project with TypeScript strict mode, Tailwind CSS v4, and shadcn/ui.
  - [x] Install core dependencies: `drizzle-orm`, `@neondatabase/serverless`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `nanoid`, `zod`, `inngest`, `razorpay`, `next-auth@beta`, `lucide-react`, `clsx`, `tailwind-merge`.
  - [x] Install dev dependencies: `drizzle-kit`, `typescript`, `@types/node`, `@types/react`.
  - [x] Configure `drizzle.config.ts`, `.env.example`, and `lib/env.ts` (Zod environment variable validator).
  - [x] Configure `lib/constants.ts` with brand constants, BCP-47 language codes (`or-IN`, `as-IN`, etc.), and pricing rates.
- [x] **Step 1.2 — Database Layer**
  - [x] Implement `db/schema.ts` with all 9 normalized tables (`users`, `guest_sessions`, `projects`, `generation_runs`, `project_outputs`, `wallets`, `payment_orders`, `wallet_transactions`, `payment_webhook_events`).
  - [x] Implement `lib/db/index.ts` with Drizzle / Neon connection.

## Phase 2 — Guest Upload & Studio Preview
- [x] **Step 2.1 — Guest Session Management**
  - [x] Implement `lib/auth/guest.ts` (cryptographic raw token generation, cookie parser, SHA-256 token hashing).
- [x] **Step 2.2 — R2 Private Upload Pipeline**
  - [x] Implement `lib/r2/client.ts` and `lib/r2/uploads.ts` (presigned PUT generator with 10-minute expiry and restricted content types).
  - [x] Implement `POST /api/uploads/presign` (validate file type/size, create guest session and draft project, return presigned URL).
  - [x] Implement `POST /api/uploads/complete` (HEAD R2 check, byte size verification $\le 100\text{ MB}$, mark source completed).
- [x] **Step 2.3 — Upload Zone & Studio Video Preview**
  - [x] Build `components/upload-zone.tsx` (drag-and-drop, MP4/MOV validation, browser duration probe $\le 90\text{ s}$, real-time upload progress).
  - [x] Build `components/studio-video.tsx` (prominent 9:16 vertical video player, playback controls, replace video button).

## Phase 3 — Studio Configuration & Server Duration Verification
- [x] **Step 3.1 — Studio Controls & Pricing Calculator**
  - [x] Implement `lib/pricing/dubbing.ts` (authoritative server pricing: `billableSeconds * targetCount * GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE / 60`).
  - [x] Build `components/language-selector.tsx` (source dropdown, selectable native-script target chips, max 3, source excluded).
  - [x] Build `components/generation-summary.tsx` (duration, versions, authoritative cost estimate in ₹/credits, voice rights consent checkbox).
- [x] **Step 3.2 — Project Configuration Endpoint**
  - [x] Implement `POST /api/projects/:id/configure` (update source/target languages, voice consent confirmation).

## Phase 4 — Auth.js & Guest → Account Merge
- [x] **Step 4.1 — Auth.js with Google OAuth**
  - [x] Implement `lib/auth/auth.ts` and `app/api/auth/[...nextauth]/route.ts`.
  - [x] Build `components/auth-sheet.tsx` (*"Save your Reel and continue"* lightweight Google sign-in modal).
- [x] **Step 4.2 — Guest-to-Account Project Migration**
  - [x] Implement `lib/auth/ownership.ts` (`assertProjectAccess` helper for guest/user isolation).
  - [x] Implement `lib/auth/merge.ts` and `POST /api/auth/guest-merge` (idempotently transfer guest projects to authenticated user).

## Phase 5 — Wallet Ledger, Pricing Engine & Dev Credit Seeding
- [x] **Step 5.1 — Wallet Ledger & Atomic Reservations**
  - [x] Implement `lib/wallet/ledger.ts`, `lib/wallet/reserve.ts`, `lib/wallet/settle.ts`, `lib/wallet/service.ts`.
  - [x] Implement atomic credit locking SQL transaction.
  - [x] Implement `GET /api/wallet` and `POST /api/wallet` (dev credit seeding helper).

## Phase 6 — Durable Execution with Inngest
- [x] **Step 6.1 — Inngest Setup & Functions**
  - [x] Implement `lib/inngest/client.ts` and `app/api/inngest/route.ts`.
  - [x] Implement `generationWorkflow` in `lib/inngest/functions/generation.ts`.
- [x] **Step 6.2 — Generate Endpoint**
  - [x] Implement `POST /api/projects/:id/generate` (verify voice consent, create `generation_run`, check wallet, reserve credits, dispatch Inngest event or return `INSUFFICIENT_CREDITS`).

## Phase 7 — Sarvam Dubbing Integration & R2 Archiving
- [x] **Step 7.1 — Sarvam Dubbing Client**
  - [x] Implement `lib/sarvam/client.ts`, `lib/sarvam/dubbing.ts`, `lib/sarvam/types.ts` (`POST /dubbing/jobs/`, stream R2 to Sarvam, `POST /dubbing/jobs/:id/start`, `GET /live-status`, `GET /export-status?limit=100`).
- [x] **Step 7.2 — Inngest Generation Workflow**
  - [x] Implemented full Inngest step pipeline: create job $\rightarrow$ stream upload $\rightarrow$ start job $\rightarrow$ poll live status (15s intervals) $\rightarrow$ poll export status $\rightarrow$ download video/SRT $\rightarrow$ archive to private R2 (`lib/r2/outputs.ts`) $\rightarrow$ update `project_outputs` $\rightarrow$ atomic wallet settlement (bill only successful videos, release failed reservations) $\rightarrow$ finalize run.

## Phase 8 — Result Studio, Language Tabs & Signed Downloads
- [x] **Step 8.1 — Result Studio & Tabbed Player**
  - [x] Build `components/result-studio.tsx` and `components/language-tabs.tsx` (single dominant video player switching streams across `Original`, `हिन्दी`, `தமிழ்`, `ಕನ್ನಡ`).
  - [x] Build `components/processing-status.tsx` (phase-based progress reading PostgreSQL state).
- [x] **Step 8.2 — Private Download Endpoint**
  - [x] Implement `GET /api/projects/:id/download/:language/:format` (verifies ownership, generates 15-minute presigned GET URL for video/SRT).

## Phase 9 — Targeted Retry
- [x] **Step 9.1 — Targeted Retry Endpoint**
  - [x] Implement `POST /api/projects/:id/retry` taking `{ targetLanguages: string[] }`.
  - [x] Creates a new `generation_run` for failed languages only, reserves cost only for selected targets, and launches Inngest workflow.

## Phase 10 — Payments (Razorpay Provider & Checkout)
- [x] **Step 10.1 — PaymentProvider Interface & Razorpay**
  - [x] Implement `lib/payments/provider.ts` and `lib/payments/razorpay.ts`.
  - [x] Implement `POST /api/payments/order` (create local `payment_orders` record + Razorpay order).
  - [x] Build `components/credit-sheet.tsx` (in-Studio top-up modal with +₹100, +₹250, +₹500 options).

## Phase 11 — Razorpay Verification & Webhook Finalization
- [x] **Step 11.1 — Payment Verification Endpoint**
  - [x] Implement `POST /api/payments/verify` (HMAC SHA-256 signature verification).
  - [x] Implement shared idempotent `finalizeCapturedPayment` helper.
- [x] **Step 11.2 — Raw Webhook Handler**
  - [x] Implement `POST /api/webhooks/razorpay` (raw body signature check, deduplication via `payment_webhook_events`, emit Inngest event).

## Phase 12 — Auto-Resume Generation Post-Payment
- [x] **Step 12.1 — Auto-Resume Pipeline**
  - [x] When payment is finalized, if `generationRunId` is linked and `awaiting_payment`, automatically reserve credits, queue run, and emit `generation.requested`.

## Phase 13 — Minimal User Projects Library
- [x] **Step 13.1 — Projects View**
  - [x] Implement `app/projects/page.tsx` (minimal list of user's past Reels with status chips, date, and link to Studio).

## Phase 14 — Inngest Scheduled Cleanup & Reconciliation
- [x] **Step 14.1 — Maintenance Functions**
  - [x] Implement `lib/inngest/functions/cleanup.ts` (delete expired guest sessions/stale draft inputs per retention policy).
  - [x] Implement `lib/inngest/functions/reconciliation.ts` (repair stuck runs, finalize abandoned pending payments).

## Phase 15 — Security Audit & Environment Hardening
- [x] **Step 15.1 — Security Headers & Server-Only Enforcement**
  - [x] Added `import "server-only";` across sensitive server modules (`lib/sarvam/`, `lib/r2/`, `lib/wallet/`, `lib/db/`, `lib/auth/`).
  - [x] Strict Zod environment variable parsing (`lib/env.ts`).

## Phase 16 — Comprehensive Testing & Edge Case Matrix
- [x] **Step 16.1 — Verification Matrix**
  - [x] Ran strict TypeScript check (`npx tsc --noEmit`) $\rightarrow$ 0 errors.
  - [x] Ran production build (`npm run build`) $\rightarrow$ 14/14 routes compiled and static pages generated.

## Phase 17 — Visual Polish & Responsive Pass
- [x] **Step 17.1 — High-End Editorial Styling**
  - [x] Implemented `components/hero.tsx`, `components/navigation.tsx`, `components/offline-banner.tsx`, `components/transformation-section.tsx`, `components/how-it-works.tsx`, `components/voice-section.tsx`, `components/language-marquee.tsx`, `components/footer.tsx` following `FRONTEND_BRIEF.md`.
  - [x] Integrated `Instrument Serif`, `Geist Sans`, `Geist Mono` typography and warm ivory/vermilion design tokens.
