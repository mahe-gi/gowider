# GoWider — Guest-First Product Flow & Studio Architecture

## 1. Core Philosophy: Value Before Identity
> **VALUE → INTENT → IDENTITY → PAYMENT → PROCESSING**

A creator must never be forced to sign up before experiencing the product. The studio allows guest uploading, video inspection, language configuration, and cost estimation with zero friction. Identity and wallet balance are requested only when paid processing is triggered.

---

## 2. Guest Session & Project Lifecycle

### Anonymous Session
- Each unauthenticated visitor receives a cryptographically secure `guest_session_id` stored in an `httpOnly`, `sameSite: lax` cookie.
- Guest projects store `guestSessionId`.
- Returning guests within cookie validity restore their in-progress studio setup seamlessly.

### Guest → User Transition
- When the guest clicks `Generate`, if unauthenticated, a lightweight sheet/modal opens: *"Save your project and continue"*.
- Supported auth: Managed OAuth (e.g. Google) or magic link.
- **Immediate State Merge:** After login, the backend transfers `guestSessionId` project ownership to `userId`.
- The user is returned directly to `/project/:id` in the Studio with their exact video, selected languages, and configuration intact.

---

## 3. Wallet & Credit Economics

### Units & Authoritative Calculation
- Authoritative calculation runs exclusively on the server:
  $$\text{Cost (paise)} = \text{durationSeconds} \times \text{targetLanguages.length} \times \text{unitPricePerSecond}$$
- Client calculations are for real-time display/estimation only.

### Atomic Reservation Ledger (`wallet_transactions`)
- **Pre-allocation:** Before dispatching to Sarvam, credits are atomically reserved:
  - Check: `available_balance = balance - reserved >= required_cost`.
  - Transaction: `type: "reservation"`, `amount: required_cost`, `projectId`.
- **Completion / Settlement:**
  - Full success: `type: "usage"`, finalize cost, release reservation.
  - Partial failure (e.g. 2/3 succeed): Finalize cost for successful languages only, release/refund unused reservation for the failed language.
  - Complete failure before processing: Full release of reserved amount back to available balance.

---

## 4. Studio Design & Layout (Desktop & Mobile)

### Workspace Layout (Desktop)
- **Left (Media Canvas):**
  - Prominent 9:16 vertical video player / preview surface with playback controls, duration counter, and *"Replace video"* affordance.
- **Right (Controls Column):**
  - Source language badge / dropdown.
  - Target languages selectable via interactive native-script chips (e.g. `[ हिन्दी ]`, `[ தமிழ் ]`, `[ ಕನ್ನಡ ]`).
  - Pre-generation summary: duration, language count, estimated usage/credits.
  - Primary Action: `Generate 3 versions →` (or context-aware count).

### Workspace Layout (Mobile)
- Stacked natural flow: Video player → Language selectors → Cost summary → Sticky bottom CTA bar.

---

## 5. Result Studio Experience

### Single-Player Tabbed Switcher
Instead of crowding the screen with multiple large video cards side-by-side, the Result Studio features a unified media player with language tabs:
- **Tabs:** `[ Original ]` `[ हिन्दी (Hindi) ]` `[ தமிழ் (Tamil) ]` `[ ಕನ್ನಡ (Kannada) ]`
- Selecting a tab instantly switches the video player to that localized stream.
- **Action Bar (under player):**
  - Language status (e.g. `Hindi · Ready ✓`).
  - Primary action: `[ Download Video (MP4) ]`
  - Secondary action: `[ Download Subtitles (SRT) ]`
  - If a language failed: `[ Retry {Language} ]` triggers a targeted single-language re-run.

---

## 6. Resilience & Edge Cases
- **Expiring URLs:** Sarvam download URLs are refreshed dynamically on demand via `export-status`.
- **Connection Loss:** Offline banner (*"You're offline. Your Reel is still processing."*) with automatic reconnect & state sync.
- **Double Clicks / Retries:** Idempotency keys prevent duplicate Sarvam jobs or duplicate wallet deductions.
- **Security & Ownership:** Strict isolation — guests can only access projects matching their `guest_session_id`; authenticated users can only access projects matching their `userId`.
