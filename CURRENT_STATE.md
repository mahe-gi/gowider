# Current State

## Last Updated
2026-08-27 23:53 IST

## Background Queue & Worker Subsystem
**LOCAL REDIS & BULLMQ WORKER VERIFIED**: Successfully migrated background execution from Inngest to self-hosted Redis + BullMQ.
- Framework-independent business functions extracted to `lib/generation/process-generation.ts`.
- Non-blocking delayed job polling state machine implemented (`generation:start` -> `generation:poll-live` [delay 15s] -> `generation:poll-export` [delay 10s]).
- Crash recovery and provider idempotency enforced with authoritative upload verification.
- Transient vs permanent error classification with exponential backoff (5 retries).
- Single polling-chain guarantee via deterministic stage job IDs and active job deduplication.
- Verified live HTTP network end-to-end failure rollback (missing `SARVAM_API_KEY` -> permanent error caught -> run marked `failed` -> exact 6,267 paise reservation released atomically to available balance).
- Periodic maintenance reconciliation worker active (`workers/maintenance-worker.ts`) reconciling stalled runs, pending webhooks, pending payment orders, and media retention cleanup.
- Cleanly removed `inngest` package and all Inngest routes/functions.

## Production Deployment Topology
**DISPOSABLE VPS + MANAGED EXTERNAL CLOUD**:
- **VPS (Ubuntu):** Runs `docker-compose.prod.yml` containing `web` (:3000), `worker`, and `redis` (internal).
- **PostgreSQL:** External managed service (Neon, AWS RDS, Supabase) via `DATABASE_URL`. Zero database containerization on VPS.
- **Media Storage:** Cloudflare R2 (`STORAGE_DRIVER=r2`). Zero customer video volumes on VPS.
- **Reverse Proxy:** Host-level Caddy/Nginx terminating HTTPS on 80/443 pointing to `127.0.0.1:3000`.
- **Health Check:** `/api/health` monitoring PostgreSQL and Redis connectivity.

## Domain Verification Status

- **Background Queue:** LOCAL REDIS & BULLMQ WORKER VERIFIED (`docker compose up -d redis`, `npm run worker:dev`)
- **Media Verification:** LOCAL REAL VIDEO VERIFIED (Fail-closed random-access parser, zero client-fallback)
- **Local Storage Provider:** LOCAL REAL VIDEO VERIFIED (Random access `readRange` via filesystem file descriptors)
- **R2 Storage Provider:** CODE VERIFIED (S3 `GetObjectCommand` with `Range: bytes=x-y`; awaiting live R2 credentials)
- **Authentication (Google OAuth):** LOCAL VERIFIED
- **Marketing Landing (`/`):** LOCAL VERIFIED
- **Creator Dashboard (`/dashboard`):** LOCAL VERIFIED
- **Dedicated Studio (`/studio/new`):** LOCAL VERIFIED
- **Projects Library (`/projects`):** LOCAL VERIFIED
- **Project Workspace (`/project/[id]`):** LOCAL VERIFIED
- **Billing & Activity Ledger (`/billing`):** LOCAL VERIFIED
- **Account Settings (`/account`):** LOCAL VERIFIED
- **Legal & Compliance Pages (`/privacy`, `/terms`, `/refund-policy`, `/contact`):** LOCAL VERIFIED
- **User Isolation & IDOR Protection:** UNIT & INTEGRATION VERIFIED
- **Pricing & Wallet Invariants:** UNIT & NETWORK E2E VERIFIED
- **Razorpay Payments:** LOCAL & API VERIFIED (Test Order `order_TUqMZj5sWtEaaj`)
- **Production Readiness:** NOT READY (Requires Cloudflare R2 bucket keys for remote storage and `SARVAM_API_KEY` for live voice dubbing)
