# GoWider — Project & Generation State Machine

---

## 1. Project Lifecycle State Diagram

```text
[ draft ]
    │
    ▼  (Direct upload begins)
[ uploading ]
    │
    ▼  (Upload completes + Server verifies duration)
[ ready ]
    │
    ▼  (User selects languages + confirms consent)
[ configured ]
    │
    ▼  (Generate clicked)
[ awaiting_payment ] ─────────┐
    │                         │ (Payment captured)
    ▼  (Credits reserved)     │
[ queued ] ◄──────────────────┘
    │
    ▼  (Inngest starts processing)
[ processing ]
    │
    ▼  (Provider generates tracks)
[ exporting ]
    │
    ├────────────────────────┬────────────────────────┐
    │ (All languages OK)     │ (Some languages fail)  │ (All fail)
    ▼                        ▼                        ▼
[ completed ]         [ partial_failure ]         [ failed ]
                             │
                             ▼ (Targeted Retry)
                      [ queued (retry) ]
```

---

## 2. State & Intent Mapping

| Status | Creator UX State | Allowed Actions |
| :--- | :--- | :--- |
| `draft` | Video uploading / incomplete upload | Delete draft, Resume upload |
| `ready` | Video ready for language selection | Configure languages, Confirm voice rights, Generate |
| `awaiting_payment` | Generation created, waiting for credits | Open CreditSheet, Cancel |
| `queued` | Credits reserved; job queued | View status |
| `processing` | Provider neural voice synthesis active | View status, Close browser (will finish in background) |
| `exporting` | Archiving MP4 and SRT files to storage | View status |
| `completed` | All localized versions ready | Preview video, Download MP4, Download SRT |
| `partial_failure` | 1 or 2 versions ready, 1 failed | Download ready versions, Targeted Retry for failed language |
| `failed` | All versions failed | Retry all, Credits returned to available balance |
