# GoWider — Technical Architecture (Self-Hosted BullMQ & Redis V1)

## 1. High-Level Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   User Browser                         │
│  - Authenticated Session Cookie (Auth.js)              │
│  - Direct Storage Video Upload                         │
│  - Studio (Media Canvas + Language Chips)              │
│  - Result Studio (Tabbed Multi-Language Video Player)  │
│  - Razorpay Modal / Billing Hub                        │
└───────────────────────────┬────────────────────────────┘
                            │
                            ↓
┌────────────────────────────────────────────────────────┐
│                   Next.js Web App                      │
│                                                        │
│  API Endpoints:                                        │
│  - POST /api/uploads/presign (Direct Storage PUT)      │
│  - POST /api/uploads/complete (Fail-closed metadata)   │
│  - POST /api/projects        (Create draft project)    │
│  - POST /api/projects/:id/configure (Update config)    │
│  - POST /api/projects/:id/generate (Reserve credits &  │
│                               enqueue BullMQ job)      │
│  - GET  /api/projects/:id    (Read Postgres state)     │
│  - POST /api/projects/:id/retry (Targeted retry run)   │
│  - GET  /api/projects/:id/download/:lang/:fmt (Signed) │
│  - GET  /api/wallet          (Balance & recent ledger) │
│  - POST /api/payments/order  (Create Razorpay order)   │
│  - POST /api/payments/verify (Verify HMAC signature)   │
│  - POST /api/webhooks/razorpay (Raw HMAC verification) │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
                ↓                        ↓
       ┌────────────────┐       ┌─────────────────┐
       │   PostgreSQL   │       │ Storage Provider│
       │ (State Truth)  │       │ (Local / R2)    │
       │ - users        │       │                 │
       │ - projects     │       │ - sources/...   │
       │ - gen_runs     │       │ - outputs/...   │
       │ - outputs      │       └────────┬────────┘
       │ - wallets      │                │
       │ - transactions │                │ Stream to Provider
       │ - payments     │                ↓
       │ - webhook_evts │       ┌───────────────────┐
       └────────┬───────┘       │ Sarvam AI Dubbing │
                │               │                   │
                │ Enqueue job   │ - Create job      │
                ↓               │ - Live status     │
       ┌────────────────┐       │ - Export status   │
       │     BullMQ     │       └───────────────────┘
       │        ↓       │                ▲
       │     Redis      │                │ Lightweight
       │ (Queue State)  │                │ Orchestration
       └────────┬───────┘                │
                │ Dequeue delayed jobs   │
                ↓                        │
       ┌─────────────────────────────────┴──┐
       │         GoWider Worker             │
       │  - workers/generation-worker.ts    │
       │  - workers/payment-worker.ts       │
       │  - workers/maintenance-worker.ts   │
       └────────────────────────────────────┘
```

---

## 2. Responsibilities Breakdown

1. **PostgreSQL (Database):** Authoritative persistent application state (users, projects, generation runs, wallets, ledger, outputs, payments, webhooks).
2. **Redis (Queue Infrastructure):** Queue and delayed-job storage only. Contains no secrets or authoritative business data.
3. **BullMQ:** Queue API, concurrency management, exponential backoff retries, and non-blocking delayed job scheduling.
4. **GoWider Worker (`workers/index.ts`):** Lightweight background orchestration service running on the same server (or dedicated container) to interact with external providers and update PostgreSQL state.
5. **Sarvam AI:** Heavy neural voice dubbing, lip-synchronization, and subtitle generation.
6. **Storage Provider (`lib/storage/`):** Private asset storage (supports Local filesystem in dev and Cloudflare R2 in production).

---

## 3. Delayed Polling State Machine

To prevent workers from blocking during long video dubbing (5–20 minutes), GoWider uses a non-blocking delayed job state machine:

```text
[ generation:start ]
       │
       ├─ Load run from PostgreSQL
       ├─ Check idempotency (if sarvamJobId exists, reuse it!)
       ├─ Call createDubbingJob & persist sarvamJobId immediately
       ├─ Stream source video to upload URL & start job
       └─ Enqueue [ generation:poll-live ] (delay: 15 seconds)
             │
             ▼ (Worker is freed immediately)
[ generation:poll-live ]
       │
       ├─ Query getDubbingLiveStatus(sarvamJobId)
       ├─ Update progress & step labels in PostgreSQL
       ├─ If status is "processing" ──► Enqueue next [ generation:poll-live ] (delay: 15s)
       ├─ If status is "failed" ──────► Fail run & release reserved wallet credits
       └─ If status is "completed" ───► Enqueue [ generation:poll-export ] (delay: 5s)
             │
             ▼
[ generation:poll-export ]
       │
       ├─ Query getDubbingExportStatus(sarvamJobId)
       ├─ If exports pending ─────────► Enqueue next [ generation:poll-export ] (delay: 10s)
       └─ When exports completed:
            ├─ Archive MP4 & SRT to private storage
            ├─ Update project_outputs rows
            ├─ Settle wallet atomically (charge only successful video outputs)
            └─ Mark generation_run & project status as "completed" / "partial_failure"
```

---

## 4. Environment & Deployment Topology

### Local Development Topology:
```text
Host (macOS / Linux / Windows)
  ├── Next.js Web App (:3000)
  ├── Background Worker (tsx workers/index.ts)
  └── docker-compose.yml (Local Docker)
        ├── postgres (127.0.0.1:5432)
        └── redis (127.0.0.1:6379)
```

### Production Deployment Topology (Disposable VPS + Managed Cloud Services):
```text
                          Internet
                             │
                             ▼
                       Caddy / Nginx
                      (HTTPS 80 / 443)
                             │
                             ▼
                   ┌──────────────────┐
                   │   GoWider VPS    │
                   │                  │
                   │ Docker Compose   │
                   │  - web (:3000)   │
                   │  - worker        │
                   │  - redis         │
                   └────────┬─────────┘
                            │
              ┌─────────────┼──────────────┐
              ▼             ▼              ▼
       Managed Postgres     R2           Sarvam
       (Neon/RDS/etc.)    Storage         API
```
- **PostgreSQL:** Managed external service (Neon, AWS RDS, Supabase). **Not containerized on VPS.**
- **Media Storage:** Cloudflare R2 (`STORAGE_DRIVER=r2`).
- **Redis & Workers:** Self-hosted inside Docker Compose on the VPS. Redis is disposable; in the event of VPS failure or migration, PostgreSQL business state reconstructs active queue state via maintenance worker reconciliation.
