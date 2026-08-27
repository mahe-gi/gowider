# GoWider — Canonical User Journey & Flow Diagrams

---

## 1. New Creator Onboarding & First Reel Journey

```text
Visitor arrives at gowider.app (Marketing Landing)
       │
       │ Click "Get Started with Google" / "Localize a Reel"
       ▼
Google OAuth Authentication
       │
       ▼
/dashboard (Creator Home)
       │
       │ Empty state: "Localize your first Reel"
       ▼
/studio/new (Creation Workspace)
       │
       │ Drop MP4/MOV file (<= 90s, <= 100MB)
       ▼
Storage Upload (S3/R2 direct or local stream)
       │
       │ Server verifies duration via ISO BMFF parser
       ▼
Studio Video Canvas & Language Selector
       │
       │ Select Telugu (Original) ⟶ Hindi, Tamil, Kannada
       │ Review Estimated Cost (e.g. ₹84)
       │ Check Voice Ownership & Dubbing Rights Consent
       ▼
Click "Generate 3 versions →"
       │
       ├─────────────────────────────────────┐
       │ (Enough Credits)                    │ (Insufficient Credits)
       ▼                                     ▼
Reserve Credits in PostgreSQL          Open CreditSheet (₹84 required)
       │                                     │
       │                                     ▼
       │                               Razorpay Checkout Modal
       │                                     │
       │                                     ▼
       │                               Payment Captured & Verified
       │                                     │
       │                                     ▼
       │                               Reserve Credits
       ▼                                     │
Dispatch Inngest Background Job ◄────────────┘
       │
       ▼
/project/[id] (Live Processing Studio)
       │
       │ 5-second polling (queued ⟶ localizing ⟶ preparing versions)
       ▼
Outputs Generated & Archived
       │
       │ Settlement: Credits charged (failed languages refunded automatically)
       ▼
Multi-Language Results Canvas
       │
       ├── Preview Hindi (9:16 Video Player)
       ├── Download Localized MP4
       └── Download Subtitles (SRT)
```

---

## 2. Returning Creator Journey

```text
Logged-in Creator opens GoWider
       │
       ▼
/dashboard (Creator Home)
       │
       ├── Available Credits: ₹240
       ├── Active Processing Runs (if any) ──► /project/[id]
       ├── Recent Reels (Latest 6) ──────────► /project/[id]
       ├── "Localize a new Reel" CTA ────────► /studio/new
       └── "View all Reels" ─────────────────► /projects
```
