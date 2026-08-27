# Changelog

All notable changes to this project will be documented in this file.

## 2026-08-27

### Added — GoWider Production V1 Master Implementation
- **Data Models & Schema**: Normalized 9-table PostgreSQL schema (`users`, `guest_sessions`, `projects`, `generation_runs`, `project_outputs`, `wallets`, `payment_orders`, `wallet_transactions`, `payment_webhook_events`) using Drizzle ORM.
- **Guest-First Studio**: Secure guest token cookie management with SHA-256 hashing; direct browser-to-R2 upload with $\le 100\text{ MB}$ and $\le 90\text{ s}$ duration verification; prominent 9:16 vertical video player.
- **Pricing & Consent Engine**: Authoritative server pricing in integer paise ($100\text{ paise} = ₹1.00$); explicit voice ownership and dubbing rights consent checkpoint.
- **Authentication & Merge**: Auth.js with Google OAuth and idempotent guest-to-user project ownership transfer.
- **Wallet & Concurrency**: Atomic SQL credit reservation locking and ledger tracking (`purchase`, `reservation`, `usage`, `release`, `refund`).
- **Durable Workflows (Inngest)**:
  - 10-step `generationWorkflow` streaming R2 to Sarvam, polling live/export status (`limit=100`), downloading video + SRT, archiving to private R2, and settling wallet.
  - Payment webhook background processor and auto-resume generation dispatcher.
  - Scheduled cleanup and reconciliation cron workflows.
- **Payments (Razorpay)**: Decoupled `PaymentProvider` interface, order creation, in-Studio hosted modal, server-side HMAC SHA-256 signature verification, and raw webhook deduplication.
- **Result Studio & Downloads**: Single dominant video player with language tabs (`Original`, `हिन्दी`, `தமிழ்`, `ಕನ್ನಡ`), 15-minute presigned GET download links, and targeted retry for failed targets.
- **Editorial Frontend**: Awwwards-caliber visual design featuring `Instrument Serif` and `Geist` typography, warm ivory palette, vermilion accent (`#FF441F`), interactive Reel transformation, how it works, voice cloning identity, and pan-India language marquee.
- **Verification**: Strict TypeScript (`0 errors`) and production build (`14/14 static pages generated in 2.3s`).
