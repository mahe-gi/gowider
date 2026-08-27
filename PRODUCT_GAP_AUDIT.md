# GoWider — Product & Architecture Gap Audit

**Date:** 2026-08-27  
**Audit Purpose:** Comprehensive review of all product domains, routes, authentication states, data models, and background execution prior to end-to-end completion.

---

## 1. Executive Summary

| Domain | Status | Key Findings & Required Work |
| :--- | :--- | :--- |
| **Authentication** | **PARTIAL** | Google OAuth works in Auth.js v5, but client session state is poorly shared; pages use indirect `/api/wallet` checks with hardcoded `"Creator"` name. |
| **Guest Sessions & Merge** | **WORKING** | Guest session cookie generated; `/api/auth/guest-merge` transfers project ownership to authenticated user. Needs resume-intent URL handler. |
| **Navbar & Profile Menu** | **PARTIAL** | Navigation shows hardcoded avatar without dropdown menu. Needs `ProfileMenu` with Dashboard, My Reels, Billing, Account, Sign Out. |
| **Dashboard (`/dashboard`)** | **MISSING** | Route `/dashboard` returns 404. Must build creator dashboard displaying real name, available credits, active processing jobs, recent Reels, and empty states. |
| **Account (`/account`)** | **MISSING** | Route `/account` returns 404. Must build profile page with display name editing, read-only email, and member-since date. |
| **Billing (`/billing`)** | **MISSING** | Route `/billing` returns 404. Must build billing page showing real available/reserved/total credits, top-up modal, and readable transaction ledger. |
| **Projects Library (`/projects`)** | **PARTIAL** | Page exists but renders disconnected `<Navigation />` without passing session/wallet and lacks project filters and robust empty/error states. |
| **Project Detail (`/project/[id]`)** | **PARTIAL** | Renders processing status or results, but needs consistent authenticated shell and auto-refresh persistence. |
| **Upload & Storage (R2/CORS)** | **BROKEN / PARTIAL** | Presign endpoint works, but direct browser XHR PUT fails if R2 CORS/credentials are unconfigured or blocked by browser origin. Needs fail-closed verification + direct local fallback when testing offline. |
| **Server Media Verification** | **WORKING** | `lib/media/metadata.ts` ISO BMFF parser parses duration from `mvhd` atom (1s–90s bounds). |
| **Language & Studio Config** | **WORKING** | Source and up to 3 target languages persist to PostgreSQL via `/api/projects/[id]/configure`. |
| **Voice Rights Consent** | **WORKING** | Checkbox persists `voiceRightsConfirmedAt` in database. |
| **Pricing Engine** | **WORKING** | Authoritative integer paise ceiling formula tested in Vitest (`calculateDubbingCost`). |
| **Wallet & Invariants** | **WORKING** | Invariant check constraints (`balance >= 0`, `reserved >= 0`, `reserved <= balance`), transactional reservation, and settlement logic code-verified. |
| **Razorpay Payments** | **CODE VERIFIED / PARTIAL** | Order creation, HMAC verification, captured-state enforcement, and atomic balance crediting code-verified. Live checkout tested with test keys. |
| **Background Inngest Jobs** | **CODE VERIFIED** | Durable step checkpointing (`step.sleep("15s")`), deterministic webhook deduplication, media cleanup, and reconciliation workflows code-verified. |
| **Localization Provider** | **CODE VERIFIED** | `lib/sarvam/` client with chunk streaming and live status polling. No provider branding visible to users. |
| **Results & Downloads** | **PARTIAL** | Result studio renders multi-language tabs and download buttons; needs private signed URL verification and targeted retry UX. |
| **Rate Limiting & Security** | **WORKING** | PostgreSQL-backed sliding window limiter (`lib/security/rate-limit.ts`) and CSP headers configured. |
| **Unit & Integration Tests** | **WORKING** | 23 Vitest tests passing across pricing, metadata, ownership, language codes, and wallet invariants. |
| **Production Readiness** | **NOT READY** | Authenticated application shell, `/dashboard`, `/account`, `/billing`, and E2E browser upload/generation flows remain to be completed. |

---

## 2. Detailed Domain-by-Domain Audit

### 2.1 Authentication & Session Management
- **Current State:** `auth.ts` uses Auth.js v5 with Google provider and JWT strategy. `signIn()` creates/updates `users` and `wallets`.
- **Gaps Identified:**
  1. Frontend pages (`app/page.tsx`, `app/projects/page.tsx`, etc.) do not wrap the app in a shared Session context.
  2. `app/page.tsx` sets `setUser({ name: "Creator" })` upon `GET /api/wallet` success instead of using actual user name/image from `session`.
  3. No interactive Profile dropdown exists when user clicks their avatar.
  4. Logging in from the top navbar doesn't direct the user to `/dashboard`.

### 2.2 Dashboard (`/dashboard`)
- **Current State:** Missing (returns 404).
- **Gaps Identified:**
  1. Needs `app/dashboard/page.tsx` protected by server-side `auth()`.
  2. Needs real user greeting (`Hello, Mahesh`).
  3. Needs real available wallet credits pill with `Add credits` button.
  4. Needs active processing banner if user has runs in `queued`, `processing`, or `exporting`.
  5. Needs recent Reels grid (latest 4–6 projects) with status badges and "Open Studio" CTA.
  6. Needs empty state for brand-new users (`Localize your first Reel`).

### 2.3 Account (`/account`) & Billing (`/billing`)
- **Current State:** Missing (returns 404).
- **Gaps Identified:**
  1. Needs `app/account/page.tsx`: Displays Google avatar, editable display name (with server action or `PATCH /api/me`), read-only email, and member-since timestamp.
  2. Needs `app/billing/page.tsx`: Displays available, reserved, and total balance, `Add credits` button (opening `CreditSheet`), and readable `wallet_transactions` ledger with translated human types (`Added credits`, `Credits reserved`, `Reel localization`, `Credits returned`).

### 2.4 Upload & Direct Storage (R2/CORS)
- **Current State:** Browser direct PUT presigned URLs are generated in `/api/uploads/presign`, but without active R2 credentials or CORS configuration on the bucket, browser XHR fails with network error.
- **Gaps Identified:**
  1. Must handle missing R2 configuration gracefully in development with a reliable local upload handler or clear diagnostics.
  2. Ensure CORS allows `PUT`, `GET`, `HEAD` from `http://localhost:3000`.
  3. Ensure `/api/uploads/complete` verifies `serverVerifiedDurationSeconds` before project status transitions to `ready`.

### 2.5 Post-Auth Intent Resumption
- **Current State:** If a guest uploads and clicks Generate, `AuthSheet` opens. After OAuth redirect, user lands on the homepage without automatic project resumption.
- **Gaps Identified:**
  1. Must preserve `?resumeProject=proj_xxx&intent=generate` in OAuth `callbackUrl`.
  2. On return: Call `/api/auth/guest-merge`, verify project ownership, check wallet, and either auto-queue generation or open `CreditSheet` with exact shortfall.

---

## 3. Implementation Plan by Phase

- **Phase 2: Auth State Foundation & Shared Shell**
  - Create `components/auth-provider.tsx` wrapping `SessionProvider`.
  - Create shared authenticated navigation shell (`components/navigation.tsx` & `components/profile-menu.tsx`).
  - Create `app/api/me/route.ts` (GET / PATCH display name).
- **Phase 3 & 4: Dashboard (`/dashboard`)**
  - Implement `app/dashboard/page.tsx` with active processing cards, recent projects, wallet balance, and clean empty state.
- **Phase 5 & 6: Account (`/account`) & Billing (`/billing`)**
  - Implement `app/account/page.tsx` and `app/billing/page.tsx`.
- **Phase 7 & 8: Projects Integration & Post-Auth Continuation**
  - Refactor `app/projects/page.tsx` and `app/page.tsx` to use the shared auth shell and URL intent resumption (`/?resumeProject=...`).
- **Phase 9: Robust Upload Pipeline**
  - Ensure presigned uploads and server duration extraction work reliably.
- **Phase 10–13: Studio, Payment & Results Integration**
  - Ensure Razorpay checkout, generation dispatch, results studio, and targeted retry are seamlessly connected.
- **Phase 14–17: Testing, Build & Final Verification Report**
  - Run full Vitest suite, TypeScript compilation, Next.js production build, and create `E2E_VERIFICATION.md`.
