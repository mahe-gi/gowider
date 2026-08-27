# GoWider — Full Product, Routing & Codebase Audit

**Audit Date:** 2026-08-27  
**Scope:** Repository Inventory, Architecture, Runtime Routing, and User Journey Consistency

---

## 1. Executive Summary

| Domain / Feature | Status | Core Responsibility | Current Gaps & Inconsistencies | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Public Landing (`/`)** | **LOCAL VERIFIED** | Marketing product explanation, value proposition, video transformation showcase, How It Works, Language marquee | Unauthenticated navigation needed dedicated clean state | Keep pure marketing; CTA opens auth |
| **Public vs App Navigation** | **PARTIAL** | Separating marketing navbar from authenticated creator app navbar | Single `Navigation` component was mixing `How it works`/`Languages` with authenticated session; Logo always went to `/` | Split/Variant: App nav with `Dashboard`, `New Reel`, `My Reels`, Credits, Avatar; Public nav with `How it works`, `Languages`, `Sign in`, `Get started` |
| **Dashboard (`/dashboard`)** | **LOCAL VERIFIED** | Returning-user creator home; shows wallet balance, active processing runs, recent Reels | Contained promotional "Multi-Language Reach" banner | Remove promotional card; make purely operational |
| **Studio Creation (`/studio/new`)** | **LOCAL VERIFIED** | Dedicated authenticated upload, video canvas, language selector, voice rights consent, and generation dispatch | In `/projects/page.tsx` and unauthenticated navbar, links pointed to `/#studio` instead of `/studio/new` | Fix all link targets to `/studio/new` |
| **Projects Library (`/projects`)** | **PARTIAL** | Library of creator's Reels with statuses | "Localize New Reel" button had `href="/#studio"`; draft duplicates accumulated | Fix CTAs to `/studio/new`; add draft deletion/cleanup |
| **Project Workspace (`/project/[id]`)** | **LOCAL VERIFIED** | Studio workspace, 5s live polling, multi-language tabs, MP4/SRT downloads, targeted retry | Error return linked to `/` instead of `/dashboard` | Fix back link to `/dashboard` |
| **Account Settings (`/account`)** | **LOCAL VERIFIED** | Profile display name editor (`PATCH /api/me`), read-only email, Google OAuth provider | None | Keep focused on identity |
| **Credits & Billing (`/billing`)** | **LOCAL VERIFIED** | Available/Reserved/Total balances, Add credits modal, transaction ledger | None | Keep server financial authority |
| **Storage Architecture** | **LOCAL VERIFIED** | Unified `StorageProvider` (`STORAGE_DRIVER=local\|r2`) | In `uploads/complete`, fallback duration was permissive | Enforce fail-closed duration parsing (reject if server cannot parse) |
| **User Isolation & IDOR** | **UNIT VERIFIED** | `assertProjectAccess` strictly verifies `project.userId === session.user.id` | Tested via `tests/unit/user-isolation.test.ts` | Enforce across all 7 project endpoints |
| **Payment Integration** | **API VERIFIED** | Razorpay Test Mode order creation and HMAC verification | Tested live on Razorpay API (`order_TUqMZj5sWtEaaj`) | Webhook idempotency active |

---

## 2. Complete Repository File Inventory

| File Path | Responsibility | Used By | Status | Problems / Findings | Keep / Refactor / Remove |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `app/page.tsx` | Public marketing landing page | Next.js Router | IMPLEMENTED | Clean marketing page | **KEEP** |
| `app/dashboard/page.tsx` | Authenticated creator home | Logged-in users | IMPLEMENTED | Had promotional card | **REFACTOR (Streamline)** |
| `app/studio/new/page.tsx` | Dedicated creation workspace | Creators localizing Reel | IMPLEMENTED | Missing from some external link anchors | **KEEP (Canonical Creation)** |
| `app/projects/page.tsx` | Project history library | Logged-in users | PARTIAL | Had `href="/#studio"` on New Reel buttons | **REFACTOR (Fix links)** |
| `app/project/[id]/page.tsx` | Studio workspace & polling | Project owners | IMPLEMENTED | Back link on error went to `/` | **REFACTOR (Fix back link)** |
| `app/billing/page.tsx` | Credit balances & usage ledger | Logged-in users | IMPLEMENTED | None | **KEEP** |
| `app/account/page.tsx` | Creator profile & display name | Logged-in users | IMPLEMENTED | None | **KEEP** |
| `app/privacy/page.tsx` | Privacy & voice data policy | Public visitors | IMPLEMENTED | None | **KEEP** |
| `app/terms/page.tsx` | Terms & voice rights warranty | Public visitors | IMPLEMENTED | None | **KEEP** |
| `app/refund-policy/page.tsx` | Automated failure refunds | Public visitors | IMPLEMENTED | None | **KEEP** |
| `app/contact/page.tsx` | Support & feedback contact | Public visitors | IMPLEMENTED | None | **KEEP** |
| `components/navigation.tsx` | Top navbar | All pages | BROKEN / MIXED | Rendered marketing links for authenticated creators | **REFACTOR (Split Public vs App)** |
| `components/profile-menu.tsx` | Avatar dropdown menu | Top nav | IMPLEMENTED | None | **KEEP** |
| `components/upload-zone.tsx` | Direct file dropzone | `/studio/new` | IMPLEMENTED | Works with local & R2 storage | **KEEP** |
| `components/studio-video.tsx` | 9:16 Video preview player | `/studio/new` | IMPLEMENTED | None | **KEEP** |
| `components/language-selector.tsx`| Source & 1–3 target picker | `/studio/new` | IMPLEMENTED | None | **KEEP** |
| `components/generation-summary.tsx`| Pricing & consent checkbox | `/studio/new` | IMPLEMENTED | None | **KEEP** |
| `components/credit-sheet.tsx` | Razorpay top-up modal | `/billing`, `/studio/new` | IMPLEMENTED | Tested with test keys | **KEEP** |
| `components/result-studio.tsx` | Multi-language result tabs | `/project/[id]` | IMPLEMENTED | Private signed downloads | **KEEP** |
| `components/processing-status.tsx`| Live pipeline status card | `/project/[id]` | IMPLEMENTED | Phase labels | **KEEP** |
| `lib/auth/auth.ts` | Auth.js v5 Google configuration | API & server | LOCAL VERIFIED | Dual-driver PostgreSQL users | **KEEP** |
| `lib/auth/ownership.ts` | Project ownership verification | All project APIs | UNIT VERIFIED | Strict `userId` matching | **KEEP** |
| `lib/storage/index.ts` | Storage provider abstraction | Upload & download APIs | LOCAL VERIFIED | Local & R2 adapters | **KEEP** |
| `lib/media/metadata.ts` | ISO BMFF duration parser | Upload complete API | UNIT VERIFIED | Server-side duration | **KEEP** |
| `lib/pricing/dubbing.ts` | Integer paise pricing formula | APIs & Studio | UNIT VERIFIED | Ceiling paise rounding | **KEEP** |
| `lib/wallet/reserve.ts` | Atomic credit reservation | Generate API | UNIT VERIFIED | Transactional locking | **KEEP** |
| `lib/wallet/settle.ts` | Atomic credit settlement | Inngest worker | UNIT VERIFIED | Conditional execution | **KEEP** |
| `lib/payments/verify.ts` | Razorpay signature validation | Payment verify API | UNIT VERIFIED | HMAC-SHA256 | **KEEP** |
| `lib/inngest/functions/*` | Durable background workflows | Inngest Server | CODE VERIFIED | Checkpointed polling | **KEEP** |
