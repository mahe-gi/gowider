# GoWider — Security Audit & User Isolation Analysis

**Audit Date:** 2026-08-27  
**Scope:** Authenticated-First Architecture, IDOR Prevention, Financial Invariants, Media Storage, and Environment Configuration

---

## 1. Vulnerability Classification & Remediation

| Area | Risk Level | Target File / Route | Description & Threat Vector | Remediation Applied |
| :--- | :--- | :--- | :--- | :--- |
| **User Isolation / IDOR** | **P0 Critical** | `lib/auth/ownership.ts`, `/api/projects/[id]/*` | Attacker supplies another user's `projectId` to view, configure, generate, download, or retry another user's Reel. | `assertProjectAccess` strictly verifies `project.userId === session.user.id`. Returns `404 NOT_FOUND` for non-owners without leaking existence. |
| **Unauthenticated Upload & Presign** | **P0 Critical** | `/api/uploads/presign`, `/api/uploads/complete` | Anonymous users requesting presigned URLs leading to storage flooding and orphan database records. | Presign requires authenticated `session.user.id`. Anonymous/guest requests rejected with `401 UNAUTHORIZED`. |
| **Local Storage Path Traversal** | **P0 Critical** | `app/api/uploads/direct-storage/[...key]` | Malicious `..` in storage key writing arbitrary files to server filesystem. | Keys validated: rejects `..`, enforces `path.resolve` strictly within `.media_cache`, checks `STORAGE_DRIVER === 'local'`. |
| **Production Storage Driver Guard** | **P0 Critical** | `lib/env.ts`, `lib/storage/index.ts` | Production environment running with local filesystem storage instead of Cloudflare R2. | `env.ts` enforces `STORAGE_DRIVER === 'r2'` and throws startup error if `NODE_ENV === 'production'` and `STORAGE_DRIVER === 'local'`. |
| **Financial Ledger Race Condition** | **P0 Critical** | `lib/wallet/reserve.ts`, `lib/wallet/settle.ts` | Concurrent generation or settlement requests causing double-charges or duplicate reservations. | Transactional row-level locking (`FOR UPDATE`), conditional mutations (`settledAt IS NULL`), and DB check constraints (`balance >= 0`, `reserved <= balance`). |
| **Payment Signature Bypass** | **P0 Critical** | `lib/payments/verify.ts`, `/api/payments/verify` | Attacker sends spoofed payment ID and signature to credit wallet without paying. | Cryptographic HMAC-SHA256 verification against `RAZORPAY_KEY_SECRET` + verification of `captured` status. |
| **Webhook Replay & Duplicate Credit** | **P1 Major** | `/api/webhooks/razorpay` | Attacker or network retry replaying captured payment webhook. | Unique constraint on `orderId` in `payments` table ensures exactly one wallet credit per payment order. |
| **Duration Spoofing for Unpaid Billing** | **P1 Major** | `lib/media/metadata.ts`, `/api/uploads/complete` | Client alters video duration parameter in browser to pay lower dubbing fees. | Server directly parses `mvhd` atom from storage header bytes to determine authoritative duration. Client duration discarded. |
| **MIME Type Spoofing & Oversized Files** | **P1 Major** | `/api/uploads/presign`, `/api/uploads/complete` | Uploading non-video or executable files disguised as video. | Enforces strict MIME whitelist (`video/mp4`, `video/quicktime`), 100 MB max size check, and ISO BMFF header validation. |
| **Cross-Site Scripting (XSS)** | **P1 Major** | `app/account/page.tsx`, `next.config.ts` | Malicious display name or script injection in user-rendered fields. | React JSX auto-escaping, strict Zod string length/type validation (1–60 chars), and strict Content-Security-Policy (CSP) headers. |
| **Rate Limiting / Abuse Prevention** | **P2 Hardening** | `lib/security/rate-limit.ts` | DoS on authentication, payment creation, presigning, or generation. | PostgreSQL sliding-window rate limiter on presign (20/5m), order creation (10/5m), and generation (10/5m). |
| **Open Redirects in OAuth Callback** | **P2 Hardening** | `components/auth-sheet.tsx`, `lib/auth/auth.ts` | Attacker crafts `callbackUrl=https://evil.com` in login buttons. | NextAuth restricts redirects to relative URLs or same-origin `NEXT_PUBLIC_APP_URL`. |
| **Secret & Token Leakage in Logs** | **P2 Hardening** | `lib/auth/auth.ts`, `lib/env.ts` | Logging `AUTH_SECRET`, Google tokens, or private R2 credentials. | Secrets filtered from all logging; NextAuth JWT tokens stored strictly in `httpOnly` secure cookies. |

---

## 2. User Isolation & IDOR Verification Test Plan

```text
User A (Owner): usr_alice_123 (Project A: proj_alpha_789)
User B (Attacker): usr_bob_456

Test Scenarios:
1. GET /api/projects/proj_alpha_789 as User B -> 404 NOT_FOUND (No leak of Alice's project)
2. POST /api/projects/proj_alpha_789/configure as User B -> 404 NOT_FOUND
3. POST /api/projects/proj_alpha_789/generate as User B -> 404 NOT_FOUND
4. POST /api/projects/proj_alpha_789/retry as User B -> 404 NOT_FOUND
5. GET /api/projects/proj_alpha_789/download/hi-IN/video as User B -> 404 NOT_FOUND
6. GET /api/projects/proj_alpha_789/download/hi-IN/srt as User B -> 404 NOT_FOUND
```
