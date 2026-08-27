# GoWider — Product Requirements Document (Production V1)

## 1. Product Summary

**Product Name:** GoWider

**Tagline:** One Reel. Every Audience.

**Core Promise:**
> **Upload first. Experience the product. Authenticate only when generating. Pay only when required. Then process reliably in the background.**

GoWider enables video creators (Instagram Reels, YouTube Shorts, educational, tech, finance creators) to upload one short video and generate high-fidelity dubbed versions in multiple Indian languages with preserved voice identity, emotion, and timing using Sarvam AI.

---

## 2. Core User Journey

```text
Guest arrives
    ↓
Uploads Reel directly to private R2
    ↓
Views Reel in GoWider Creator Studio
    ↓
Selects source language (e.g. Telugu)
    ↓
Selects 1–3 target languages (e.g. Hindi, Tamil, Kannada)
    ↓
Confirms voice ownership & dubbing rights
    ↓
Sees authoritative cost estimate (in ₹ / credits)
    ↓
Clicks "Generate 3 versions →"
    ↓
┌──────────────────────────────────────┐
│ Is user authenticated?               │
└──────────────────┬───────────────────┘
                   │
                NO │
                   ↓
         Lightweight Google Sign In
                   ↓
         Guest project merged to User
                   ↓
┌──────────────────────────────────────┐
│ Does wallet have enough credits?     │
└──────────────────┬───────────────────┘
          YES      │      NO
           │       │       ↓
           │       │   In-Studio Razorpay Top-Up
           │       │       ↓
           │       │   Server payment verification
           │       │       ↓
           └───────┴───────┐
                           ↓
                    Atomic Credit Reservation
                           ↓
                    Durable Inngest Background Run
                           ↓
                    R2 Stream → Sarvam Dubbing
                           ↓
                    Video + SRT Exports Archived in R2
                           ↓
                    Wallet Settled (only for successful videos)
                           ↓
                    Project Marked Ready / Partial
                           ↓
                    Single-Player Tabbed Results & Downloads
```

---

## 3. Product Scope

### Included in V1
* **Guest-First Studio:** Direct browser-to-R2 upload, video preview, duration validation ($\le 90\text{ s}$), format validation (MP4/MOV, $\le 100\text{ MB}$).
* **Language Selection:** Source language + up to 3 target Indian languages with native scripts.
* **Voice Consent:** Explicit voice rights confirmation checkpoint.
* **Auth & Guest Merge:** Auth.js (Google OAuth) with seamless project ownership transfer.
* **Credits & Wallet:** Integer paise accounting with atomic credit reservation and settlement ledger.
* **Payments:** Razorpay hosted checkout (+₹100, +₹250, +₹500), signature verification, idempotent webhooks, and auto-resume generation.
* **Durable Generation Pipeline:** Inngest background jobs streaming R2 to Sarvam, polling live/export status, and archiving outputs in private R2.
* **Result Studio:** Single unified video player with language tabs (`Original`, `हिन्दी`, `தமிழ்`, `ಕನ್ನಡ`), MP4 download, and SRT subtitle download.
* **Targeted Retry:** Failed languages can be retried individually without re-charging or re-running successful languages.
* **Project Library:** Minimal `/projects` list for authenticated users.
* **Resilience:** Offline/reconnect detection, refresh safety, short-lived signed URLs.

### Explicitly Excluded from V1
* Direct Instagram / YouTube publishing
* Automated social caption / hashtag generators
* Team workspaces & collaboration
* Complex timeline video editors
* Subscription billing (credits-only for V1)
* Standalone custom voice cloning tools
* Mobile native apps (responsive web only)

---

## 4. Supported Languages (BCP-47)

* `en-IN` (English)
* `hi-IN` (Hindi)
* `bn-IN` (Bengali)
* `gu-IN` (Gujarati)
* `kn-IN` (Kannada)
* `ml-IN` (Malayalam)
* `mr-IN` (Marathi)
* `or-IN` (Odia) — *Note: `or-IN`, NOT `od-IN`*
* `pa-IN` (Punjabi)
* `ta-IN` (Tamil)
* `te-IN` (Telugu)
* `as-IN` (Assamese)

---

## 5. Success Criteria for Production V1

* [ ] Anonymous guests can upload a Reel, preview it in the Studio, and configure languages with zero friction.
* [ ] Duration ($\le 90\text{ s}$) and file constraints ($\le 100\text{ MB}$) are enforced both client-side and server-side.
* [ ] Signing in via Google merges guest projects cleanly without redirecting to an empty dashboard or losing selections.
* [ ] Authoritative paise pricing calculates accurate charges and handles atomic reservation before job dispatch.
* [ ] Razorpay top-ups succeed, verify signatures server-side, credit the wallet idempotently, and automatically launch pending generations.
* [ ] Inngest orchestrates durable Sarvam dubbing, polls export readiness, and archives video + SRT files in private R2.
* [ ] Users only pay for languages where final video export completes successfully; failed languages release/refund reserved credits.
* [ ] Single-player Result Studio allows smooth language tab switching, playback, and signed URL downloads.
* [ ] Targeted retry generates only failed languages without re-charging successful ones.
