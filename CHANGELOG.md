# Changelog

All notable changes to this project will be documented in this file.

## 2026-08-27

### Security & Correctness Remediation
- **Fixed Public Wallet Vulnerability**: Removed `POST /api/wallet`. Dev seeding moved to secure offline script `scripts/seed-dev-credits.ts`.
- **Atomic Payment Finalization**: Wrapped payment status update, wallet increment, and purchase ledger record in a single PostgreSQL transaction with strict amount matching.
- **Explicit Captured State**: Razorpay `authorized` state is no longer treated as `paid`. Only verified `captured` payments credit wallets.
- **Transactional & Idempotent Wallet Operations**: `reserveCreditsForRun` and `settleGenerationRun` use atomic database transactions, idempotency checks, and `settledAt` timestamps.
- **Fixed Multi-Language Output Bug**: Lookups in `generation.ts` now query and upsert using the composite unique key `(projectId, targetLanguage)`.
- **Inngest Dispatch Recovery**: Created `lib/inngest/dispatch.ts` with explicit `dispatchState` tracking. Reconciliation cron auto-recovers queued runs.
- **Durable Sarvam Polling**: Replaced continuous `setTimeout` with Inngest step checkpoints and `step.sleep("15s")`.
- **Trusted Server Media Metadata**: Added ISO BMFF atom parser (`lib/media/metadata.ts`) to read authoritative video duration from R2 headers (1s–90s boundary check).
- **Webhook Deduplication**: Webhooks now transition through a reliable lifecycle (`received`, `dispatched`, `processed`, `failed`) with deterministic IDs.
- **R2 Storage Cleanup**: Inngest daily cleanup actually deletes eligible expired R2 objects (`sourceR2Key`, `videoR2Key`, `srtR2Key`).
- **PostgreSQL Rate Limiting**: Added `checkRateLimit` across generation, payment order, retry, and upload presign routes.
- **Production CSP & Security Headers**: Strict Content-Security-Policy restricted to Razorpay, Google, and R2 origins.
- **Vitest Test Suite**: Added 23 unit tests covering pricing, media metadata, language codes, payment verification, wallet invariants, and project ownership.
