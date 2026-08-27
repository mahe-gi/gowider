# GoWider — Edge Case Matrix & Reliability Invariants

**Version:** 1.0 (Auth-First V1)  
**Date:** 2026-08-27

---

## 1. Authentication & Session

| Scenario | Expected UX | Expected API Behavior | DB Effect | Financial Effect | Retryable? | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Login cancelled by user** | Returns to landing page with no error | Auth.js redirect handled gracefully | None | None | Yes (Click Sign In again) | Unit / E2E |
| **OAuth callback error / failure** | Error banner on AuthSheet (`Authentication failed. Please try again.`) | 401 response on callback | None | None | Yes | Unit / E2E |
| **Session expires while Studio open** | Redirects to Google Sign In with callback to `/studio/new` | 401 UNAUTHORIZED on any API call | None | None | Yes (Log in to restore) | Integration |
| **User accesses protected route while logged out** | Redirects to `/api/auth/signin?callbackUrl=<dest>` | Server-side 307 redirect | None | None | Yes | Integration |
| **User signs out while generation runs** | Redirects to `/`; generation continues uninterrupted in background | Background Inngest worker unaffected | Generation runs & outputs persist | Credits settled normally | Yes (Log in to view results) | Integration |
| **Two browser tabs signed in** | Both tabs show identical live balance and project states | API returns current database state | None | None | Yes | Integration |

---

## 2. Upload & Media Storage

| Scenario | Expected UX | Expected API Behavior | DB Effect | Financial Effect | Retryable? | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Unauthenticated upload attempt** | User cannot upload; prompted to sign in | `/api/uploads/presign` returns `401 UNAUTHORIZED` | No project record created | None | Yes (Sign in first) | Integration |
| **Unsupported extension (e.g., .avi, .mkv)** | Inline error: `Only MP4 and MOV files are supported.` | Presign validation rejects with 400 | None | None | Yes (Choose MP4/MOV) | Unit |
| **Corrupted MP4 / invalid atoms** | Inline error: `Unable to verify video format. Please upload a valid MP4/MOV.` | Complete upload rejects with 400 `INVALID_METADATA` | Project marked `failed` or discarded | None | Yes | Unit (`metadata.test.ts`) |
| **0-second video duration** | Inline error: `Video duration must be at least 1 second.` | Complete upload rejects with 400 `DURATION_TOO_SHORT` | Project discarded | None | Yes | Unit (`metadata.test.ts`) |
| **Video > 90 seconds** | Inline error: `Video exceeds 90 seconds maximum limit.` | Complete upload rejects with 400 `VIDEO_TOO_LONG` | Project discarded | None | Yes | Unit (`metadata.test.ts`) |
| **Video file > 100 MB** | Inline error: `Video size exceeds 100 MB limit.` | Presign rejects with 400 `FILE_TOO_LARGE` | None | None | Yes | Unit |
| **Upload interrupted / network failure** | Error alert with `Upload failed. Click to try again.` | Presigned PUT times out | Incomplete object cleaned up by lifecycle | None | Yes | E2E |
| **Duplicate / complete called twice** | Second call is idempotent and returns existing ready project | Complete upload returns existing `ready` project | Idempotent update | None | Yes | Integration |

---

## 3. Project Configuration & Generation Invariants

| Scenario | Expected UX | Expected API Behavior | DB Effect | Financial Effect | Retryable? | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **No target language selected** | Generate button disabled | Configure API rejects with 400 `MIN_TARGETS_REQUIRED` | None | None | Yes (Select 1–3 languages) | Unit |
| **Source language also selected as target** | Studio prevents selecting source as target | Configure API rejects with 400 `SOURCE_TARGET_CONFLICT` | None | None | Yes | Unit (`language-codes.test.ts`) |
| **More than 3 target languages** | Studio caps selection at 3 | Configure API rejects with 400 `MAX_TARGETS_EXCEEDED` | None | None | Yes | Unit |
| **Voice rights consent unconfirmed** | Generate button disabled | Configure API rejects with 400 `VOICE_RIGHTS_REQUIRED` | None | None | Yes (Check consent) | Unit |
| **Double click / concurrent Generate clicks** | Only one generation run dispatched | Unique active run constraint / transactional lock | Exactly 1 `generation_run` created | Exactly 1 reservation | Yes (Idempotent) | Integration (`wallet-invariants.test.ts`) |

---

## 4. Wallet & Payments

| Scenario | Expected UX | Expected API Behavior | DB Effect | Financial Effect | Retryable? | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Insufficient balance for generation** | CreditSheet opens showing exact shortfall and top-up options | `/api/projects/[id]/generate` returns `402 PAYMENT_REQUIRED` | Generation run in `awaiting_payment` | No credits deducted | Yes (Add credits) | Integration |
| **Exact balance matching cost** | Generation proceeds immediately | Returns 200 OK | `reservedPaise` increments by exact cost | Balance reserved | Yes | Unit (`pricing.test.ts`) |
| **Payment cancelled in Razorpay modal** | Modal closes; user remains on configuration screen | No API callback dispatched | None | None | Yes (Try again) | E2E |
| **Duplicate payment webhook & callback race** | Both succeed without duplicate credit | Unique constraint on `orderId` in single transaction | 1 payment marked `captured` | Exactly 1 wallet credit | Yes (Idempotent) | Integration (`payment-verification.test.ts`) |
| **Browser closed after payment captured** | Payment verified by webhook; waiting run auto-dispatched | Webhook credits wallet and triggers generation | Run status `processing` | Balance reserved and settled | Yes | E2E |

---

## 5. Background Generation & Provider Resilience

| Scenario | Expected UX | Expected API Behavior | DB Effect | Financial Effect | Retryable? | Test Coverage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Provider temporary failure on 1 language** | Result studio shows 2 completed languages + `Retry <FailedLang>` button | Partial failure handled gracefully | Status `partial_failure`; completed outputs saved | Only successful languages charged; failed language reservation released | Yes (Targeted retry for failed language only) | Integration |
| **Provider rate limited / 429** | Processing screen shows `Localizing your Reel…` | Inngest function steps retry with exponential backoff | Persists external job IDs | No extra charge | Yes | Integration |
| **Page refreshed during processing** | Studio reconnects to live status via 5s polling | `/api/projects/[id]` returns current database status | None | None | Yes | Integration |
| **User returns hours later** | Completed videos and SRT subtitles ready for download | Database outputs remain available | Status `completed` | Already settled | Yes | E2E |
