# GoWider — Full Product Surface Audit (Auth-First V1)

**Audit Date:** 2026-08-27  
**Architecture Model:** Authenticated-First V1 (Anonymous/guest uploads and merge deprecated)

---

## 1. Product Surface Audit Table

| Area | Existing | Missing | Broken | Security Risk | Required for V1 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Public Landing (`/`)** | Marketing hero, visual transformation showcase, How It Works, Language marquee, Footer | Clean marketing-only state without upload/studio clutter | Upload zone on homepage causing mixed state | Anonymous resource creation | **YES (Marketing Only)** |
| **Authentication (Google OAuth)** | Auth.js v5 handler, Google provider, JWT callbacks, `<AuthProvider>` | Pre-auth redirect preservation to `/dashboard` or `/studio/new` | None | Session token leakage if exposed (mitigated via httpOnly JWT) | **YES** |
| **Guest Sessions & Merge** | `guest_sessions` table, guest cookies, `/api/auth/guest-merge` | None (Deprecating for V1) | Fragile URL resume params and anonymous state | Unauthenticated R2 abuse & orphan uploads | **NO (Deprecated for V1)** |
| **Creator Dashboard (`/dashboard`)** | Authenticated shell, greeting, credits card, recent Reels, active jobs | Link to dedicated `/studio/new` creation route | None | Missing server auth if bypassed (mitigated via `auth()`) | **YES** |
| **Dedicated Studio (`/studio/new`)** | Studio components existed embedded on landing page | Dedicated `/studio/new` authenticated route | Landing page state entanglement | Anonymous presign abuse if unauthenticated | **YES** |
| **Project Workspace (`/project/[id]`)** | Studio canvas, dynamic 5s polling, language tabs, MP4/SRT downloads | Strict user isolation enforcement without guest fallback | None | IDOR if project ownership not verified | **YES** |
| **Project Library (`/projects`)** | User projects list, status badges, timestamps, studio links | Filter tabs (All, Completed, Processing) | None | Cross-user project leakage if unauthenticated | **YES** |
| **Billing & Ledger (`/billing`)** | Available/Reserved/Total balances, Add credits modal, human activity ledger | None | None | Client-side financial state recalculation (mitigated via server truth) | **YES** |
| **Account Settings (`/account`)** | Google avatar, editable display name (`PATCH /api/me`), read-only email | None | None | Display name XSS / length spoofing (mitigated with Zod) | **YES** |
| **Storage Architecture** | Direct S3 presign & local storage handler | Explicit `STORAGE_DRIVER=local\|r2` configuration & production guard | Silent fallback when credentials missing | Arbitrary path traversal in local storage | **YES** |
| **Server Media Verification** | ISO BMFF `mvhd` parser for MP4/MOV duration (1s–90s bounds) | None | None | Duration spoofing for unpaid billing (mitigated via server parser) | **YES** |
| **Pricing & Wallet Invariants** | Ceiling calculation in integer paise, DB check constraints (`balance >= 0`, `reserved <= balance`) | None | None | Concurrency double-reserve or race condition | **YES** |
| **Razorpay Payments** | Order creation, HMAC-SHA256 signature verification, captured-state check | None | None | Signature bypass or amount tampering (mitigated via strict verification) | **YES** |
| **Background Inngest Workflows** | Durable event dispatch, step sleeps, reconciliation, output persistence | None | None | Provider job replay / duplicate execution | **YES** |
| **User Isolation** | `assertProjectAccess` helper | Strict `userId`-only checks (zero guest session fallback) | None | Cross-user data access (IDOR) | **YES** |
| **Legal / Compliance Pages** | None | `/privacy`, `/terms`, `/refund-policy`, `/contact` placeholders | 404 on legal links | Missing statutory disclaimers for voice & video processing | **YES (P0 Placeholders)** |

---

## 2. Route Matrix

| Route | Public / Auth | Purpose | Current Status | Missing / Action Required | Security Level | Keep / Remove |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Public | Marketing landing page | Exists (had studio embedded) | Remove upload & studio state; CTA directs to Google login / `/dashboard` | Public | **KEEP (Refactored)** |
| `/dashboard` | Authenticated | Creator home | Exists | Route "New Reel" CTA to `/studio/new` | Authenticated | **KEEP** |
| `/studio/new` | Authenticated | Dedicated creation workspace | Missing | Create route with upload, config, consent, and generate | Authenticated | **ADD (New)** |
| `/projects` | Authenticated | Library of creator's Reels | Exists | Strict `userId` scoping | Authenticated | **KEEP** |
| `/project/[id]` | Authenticated | Processing status & results | Exists | Enforce `assertProjectAccess(id, userId)` | Authenticated | **KEEP** |
| `/billing` | Authenticated | Wallet balances & transaction ledger | Exists | Server-authoritative data | Authenticated | **KEEP** |
| `/account` | Authenticated | Profile & Google identity | Exists | Display name validation | Authenticated | **KEEP** |
| `/privacy` | Public | Privacy & Voice Data Policy | Missing | Create statutory placeholder | Public | **ADD (New)** |
| `/terms` | Public | Terms of Service & Licensing | Missing | Create statutory placeholder | Public | **ADD (New)** |
| `/refund-policy` | Public | Credit refund & billing policy | Missing | Create statutory placeholder | Public | **ADD (New)** |
| `/contact` | Public | Support & creator contact | Missing | Create support contact page | Public | **ADD (New)** |
| `/api/auth/guest-merge` | Authenticated | Merging guest projects | Exists | Deprecate & disable in Auth-First V1 | Deprecated | **DEPRECATE** |
| `/api/uploads/direct-storage/[...key]` | Authenticated | Local dev storage PUT | Exists | Enforce auth, path traversal bounds, file size | Authenticated (Local only) | **HARDEN** |
| `/api/uploads/presign` | Authenticated | Generate upload target | Exists | Require session `userId` (no guest/anon presign) | Authenticated | **HARDEN** |
| `/api/uploads/complete` | Authenticated | Verify upload & duration | Exists | Require session `userId` and ownership check | Authenticated | **HARDEN** |
| `/api/projects` | Authenticated | List user projects | Exists | Returns only `session.user.id` records | Authenticated | **KEEP** |
| `/api/projects/[id]` | Authenticated | Retrieve project details | Exists | Enforce `assertProjectAccess(id, userId)` | Authenticated | **HARDEN** |
| `/api/projects/[id]/configure` | Authenticated | Set source & target languages | Exists | Enforce `assertProjectAccess(id, userId)` | Authenticated | **HARDEN** |
| `/api/projects/[id]/generate` | Authenticated | Dispatch dubbing workflow | Exists | Enforce `assertProjectAccess(id, userId)` | Authenticated | **HARDEN** |
| `/api/projects/[id]/retry` | Authenticated | Targeted retry for failed lang | Exists | Enforce `assertProjectAccess(id, userId)` | Authenticated | **HARDEN** |
| `/api/projects/[id]/download/[language]/[format]` | Authenticated | Download MP4 / SRT | Exists | Enforce `assertProjectAccess(id, userId)` | Authenticated | **HARDEN** |
| `/api/me` | Authenticated | Profile & wallet fetch/update | Exists | Zod validated | Authenticated | **KEEP** |
| `/api/wallet` | Authenticated | Wallet balance query | Exists | Server-verified | Authenticated | **KEEP** |
| `/api/payments/order` | Authenticated | Create Razorpay order | Exists | User-linked order creation | Authenticated | **KEEP** |
| `/api/payments/verify` | Authenticated | Verify payment signature | Exists | Atomic wallet crediting | Authenticated | **KEEP** |
| `/api/webhooks/razorpay` | Public (HMAC Verified) | Durable payment webhook | Exists | Idempotent ledger entry | Public + HMAC | **KEEP** |
