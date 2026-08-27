# GoWider — Agent Rules (Production V1)

You are developing **GoWider**, a creator-first application that turns one short video into localized Indian-language versions using Sarvam AI.

The product principle is:

> **Upload first. Experience the product. Authenticate only when generating. Pay only when required. Then process reliably in the background.**

This rulebook supersedes older POC-only rules.

---

## 1. Sources of Truth

Before doing meaningful work, read:

1. `RULES.md`
2. `PRD.md`
3. `ARCHITECTURE.md`
4. `FRONTEND_BRIEF.md`
5. `GUEST_STUDIO_FLOW.md`
6. `PAYMENT_AND_AUTH_ARCHITECTURE.md`
7. `CURRENT_STATE.md`
8. `TASKS.md`
9. Relevant `SKILL.md` files
10. Existing implementation/code

Priority when instructions conflict:

```text
Latest explicit user instruction
        ↓
RULES.md
        ↓
PRD.md
        ↓
ARCHITECTURE.md
        ↓
CURRENT_STATE.md
        ↓
TASKS.md
```

Never rely only on conversation memory. Persist important project knowledge in the repository.

---

## 2. Production V1 Architecture & Approved Stack

### Allowed & Required Technologies
* **Framework:** Next.js (App Router, strict TypeScript)
* **Styling & UI:** Tailwind CSS, shadcn/ui primitives, Framer Motion / CSS transforms
* **Database:** PostgreSQL (Neon) via Drizzle ORM
* **Authentication:** Auth.js (NextAuth v5) + Google OAuth
* **Storage:** Cloudflare R2 (Private bucket for source videos and generated outputs)
* **Background Workflows & Durable Execution:** Inngest (single approved workflow engine)
* **Payments:** Razorpay (UPI, Cards, NetBanking) with pluggable `PaymentProvider` interface
* **AI Provider:** Sarvam AI Dubbing API (`/dubbing/jobs/`)
* **Validation & Schemas:** Zod

### Explicitly Prohibited Technologies
Do NOT introduce without explicit approval:
* Redis
* BullMQ
* Kafka
* RabbitMQ
* Custom microservices / standalone worker services
* Fastify / NestJS backend
* Kubernetes / Docker orchestration
* FFmpeg (use lightweight metadata parsers or client/server probes)
* Unnecessary WebSockets (use client polling of DB state + Inngest background workflows)
* Premature multi-tier caching layers

---

## 3. Workflow & Background Processing

* **Durable Execution:** Inngest is the single approved background execution system. Long-running jobs (Sarvam streaming, polling, export download, R2 caching, wallet settlement, cleanup) run via Inngest functions.
* **Database as Single Source of Truth for Frontend:** The frontend polls `GET /api/projects/:id`, which reads PostgreSQL project/run state. The frontend does NOT call Sarvam directly during polling.

---

## 4. Sarvam Rules

* **Dubbing Language Codes:** Use valid Dubbing API codes:
  * `or-IN` for Odia (NOT `od-IN`)
  * `as-IN` for Assamese
  * `en-IN`, `hi-IN`, `bn-IN`, `gu-IN`, `kn-IN`, `ml-IN`, `mr-IN`, `pa-IN`, `ta-IN`, `te-IN`
* **Dubbing Statuses:** Handle terminal outcomes: `completed`, `partial_failure`, `failed`, `deleted`.
* **Export Readiness:** `dubbing completed` does NOT mean exports are ready. Inngest must poll `export-status` (`limit=100`) until exports are `completed` or `failed`.
* **Streaming Upload:** Stream from R2 `GetObject` to Sarvam signed upload URL (`x-ms-blob-type: BlockBlob`). Do not buffer 100MB in memory.
* **Output Archiving:** Download successful video + SRT exports from temporary Sarvam URLs and archive them in private R2 storage. Serve users temporary signed R2 GET URLs on demand.

---

## 5. Wallet & Financial Rules

* **All Money in Integer Paise:** All balances, transactions, package amounts, and pricing calculations must be integer paise ($100\text{ paise} = ₹1.00$). Never use floating-point numbers for currency.
* **Authoritative Server Pricing:** Client price calculation is for display estimation only. Server recalculates and validates pricing authoritatively using `GOWIDER_DUBBING_PRICE_PER_MINUTE_PAISE`.
* **Atomic Reservations:** Credits are locked in PostgreSQL atomically before Inngest launches Sarvam dubbing.
* **Settlement Policy:** Customer is billed only for successfully generated video outputs. Unused reserved credits for failed languages are released/refunded immediately upon terminal settlement.

---

## 6. Security & Ownership Rules

* **Private R2 Storage:** Buckets are completely private. All user uploads use short-lived presigned PUT URLs; all downloads use short-lived presigned GET URLs.
* **Ownership Checks:** Every API endpoint must enforce `assertProjectAccess`:
  * Guest: `project.guestSessionId === hash(guestTokenCookie)`
  * Authenticated: `project.userId === session.user.id`
* **Guest Token Hashing:** Never store raw guest bearer tokens in PostgreSQL. Store `tokenHash = sha256(rawToken)`.
* **No Secret Exposure:** `SARVAM_API_KEY`, `DATABASE_URL`, `R2_SECRET_ACCESS_KEY`, `RAZORPAY_KEY_SECRET`, `AUTH_SECRET` must NEVER be exposed to the client.

---

## 7. Error Handling & Resilience

* **Human-Readable Specific Errors:** Return stable error codes and clear messages (e.g. `INSUFFICIENT_CREDITS`, `VOICE_RIGHTS_CONSENT_REQUIRED`, `INVALID_FILE_TYPE`).
* **Connection Resilience:** Offline banner notifying users that background processing continues on the server.
* **Idempotency:** Payment webhooks and generation calls must be idempotent. Double clicks or duplicate callbacks must never cause duplicate jobs or charges.

---

## 8. State Persistence & Definition of Done

* Maintain `CURRENT_STATE.md`, `TASKS.md`, and `CHANGELOG.md` after every meaningful task.
* A task is DONE only when:
  ```text
  Implementation exists
  + Strict TypeScript passes (npx tsc --noEmit)
  + Lint & build pass (npm run lint && npm run build)
  + Relevant manual / automated verification passes
  + No regressions
  + CURRENT_STATE.md & TASKS.md updated
  ```
