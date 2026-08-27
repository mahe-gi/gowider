# GoWider — Runtime Route Audit

**Audit Date:** 2026-08-27

---

| Route | Exists | Requires Auth | Navbar Variant | Main CTA | CTA Destination | Runtime Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | Yes | No (Public) | Public Marketing Nav | Get Started with Google | Google OAuth $\rightarrow$ `/studio/new` | **200 OK** |
| `/dashboard` | Yes | Yes (Server `auth()`) | Authenticated App Nav | Localize a new Reel | `/studio/new` | **200 OK** |
| `/studio/new` | Yes | Yes (Server `auth()`) | Authenticated App Nav | Generate Localized Versions | `/project/[id]` | **200 OK** |
| `/projects` | Yes | Yes (Server `auth()`) | Authenticated App Nav | Localize New Reel | `/studio/new` | **200 OK** |
| `/project/[id]` | Yes | Yes (Owner only) | Authenticated App Nav | Download Localized MP4 | Private Signed URL | **200 OK** |
| `/billing` | Yes | Yes (Server `auth()`) | Authenticated App Nav | Add Credits | Razorpay Checkout Sheet | **200 OK** |
| `/account` | Yes | Yes (Server `auth()`) | Authenticated App Nav | Save Display Name | `PATCH /api/me` | **200 OK** |
| `/privacy` | Yes | No (Public) | Public Marketing Nav | Return to Home | `/` | **200 OK** |
| `/terms` | Yes | No (Public) | Public Marketing Nav | Return to Home | `/` | **200 OK** |
| `/refund-policy` | Yes | No (Public) | Public Marketing Nav | Return to Home | `/` | **200 OK** |
| `/contact` | Yes | No (Public) | Public Marketing Nav | Email Support | `mailto:support@gowider.app` | **200 OK** |
