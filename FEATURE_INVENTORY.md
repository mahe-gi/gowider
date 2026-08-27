# GoWider — Complete Feature Inventory & Verification Level

---

| Feature | Frontend View | Backend API | Database Schema | Background Job | Unit Tests | Verification Level |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google OAuth Auth** | `<AuthProvider>`, `components/auth-sheet.tsx` | `/api/auth/[...nextauth]` | `users`, `wallets` | N/A | Yes | **LOCAL VERIFIED** |
| **Profile Menu** | `components/profile-menu.tsx` | `/api/me` | `users` | N/A | Yes | **LOCAL VERIFIED** |
| **Marketing Landing** | `app/page.tsx`, `components/hero.tsx` | N/A | N/A | N/A | Yes | **LOCAL VERIFIED** |
| **Creator Dashboard** | `app/dashboard/page.tsx` | `/api/projects` | `projects`, `wallets` | N/A | Yes | **LOCAL VERIFIED** |
| **New Studio Creation** | `app/studio/new/page.tsx` | `/api/uploads/presign` | `projects` | N/A | Yes | **LOCAL VERIFIED** |
| **Direct Upload** | `components/upload-zone.tsx` | `/api/uploads/presign`, `/complete` | `projects` | N/A | Yes | **LOCAL VERIFIED** |
| **Local Storage Driver**| `lib/storage/index.ts` | `/api/uploads/direct-storage` | `.media_cache` | N/A | Yes | **LOCAL VERIFIED** |
| **Cloudflare R2 Driver**| `lib/storage/index.ts` | S3 Presigned PUT | S3 Bucket | N/A | Yes | **CODE VERIFIED** |
| **Media Duration Parser**| N/A | `/api/uploads/complete` | `projects.durationSeconds` | N/A | Yes | **UNIT VERIFIED** |
| **Language Selection** | `components/language-selector.tsx` | `/api/projects/[id]/configure` | `projects.targetLanguages` | N/A | Yes | **LOCAL VERIFIED** |
| **Pricing Calculation**| `components/generation-summary.tsx`| `/lib/pricing/dubbing.ts` | `generation_runs` | N/A | Yes | **UNIT VERIFIED** |
| **Voice Rights Consent**| `components/generation-summary.tsx`| `/api/projects/[id]/configure` | `projects.voiceRightsConfirmedAt` | N/A | Yes | **LOCAL VERIFIED** |
| **Wallet Reservation** | N/A | `/api/projects/[id]/generate` | `wallets`, `wallet_transactions` | N/A | Yes | **UNIT VERIFIED** |
| **Razorpay Test Order** | `components/credit-sheet.tsx` | `/api/payments/order` | `payments` | N/A | Yes | **LOCAL & API VERIFIED** |
| **Razorpay Verification**| `components/credit-sheet.tsx` | `/api/payments/verify` | `payments`, `wallets` | N/A | Yes | **LOCAL VERIFIED** |
| **Razorpay Webhook** | N/A | `/api/webhooks/razorpay` | `payments`, `wallets` | `payment-webhook.ts` | Yes | **CODE VERIFIED** |
| **Inngest Dispatch** | N/A | `/api/projects/[id]/generate` | `generation_runs` | `generation.ts` | N/A | **CODE VERIFIED** |
| **Live Studio Polling**| `app/project/[id]/page.tsx` | `/api/projects/[id]` | `projects`, `generation_runs` | N/A | Yes | **LOCAL VERIFIED** |
| **Result Studio** | `components/result-studio.tsx` | `/api/projects/[id]` | `project_outputs` | N/A | Yes | **LOCAL VERIFIED** |
| **MP4/SRT Downloads** | `components/result-studio.tsx` | `/api/projects/[id]/download` | `project_outputs` | N/A | Yes | **LOCAL VERIFIED** |
| **Targeted Retry** | `components/result-studio.tsx` | `/api/projects/[id]/retry` | `generation_runs` | `generation.ts` | N/A | **LOCAL VERIFIED** |
| **Projects Library** | `app/projects/page.tsx` | `/api/projects` | `projects` | N/A | Yes | **LOCAL VERIFIED** |
| **Account Settings** | `app/account/page.tsx` | `PATCH /api/me` | `users` | N/A | Yes | **LOCAL VERIFIED** |
| **Billing & Ledger** | `app/billing/page.tsx` | `/api/wallet` | `wallet_transactions` | N/A | Yes | **LOCAL VERIFIED** |
| **Legal Pages** | `/privacy`, `/terms`, etc. | N/A | N/A | N/A | Yes | **LOCAL VERIFIED** |
