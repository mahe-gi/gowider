# GoWider — Complete Navigation & Routing Audit

**Audit Date:** 2026-08-27

---

## 1. Line-by-Line Clickable Navigation Actions

| Source File : Line | UI Element / Action | Current Destination | Expected Destination | Status | Root Cause & Required Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `components/navigation.tsx:79` | Logo Click (Authenticated) | `href="/"` | `href="/dashboard"` | **BUG** | Authenticated creators should land on `/dashboard`, not public marketing. Add conditional destination based on `session.user`. |
| `components/navigation.tsx:79` | Logo Click (Unauthenticated) | `href="/"` | `href="/"` | **CORRECT** | Public visitors land on `/`. |
| `components/navigation.tsx:93` | "How it works" Link | `href="/#how-it-works"` | Hide on authenticated app pages | **BUG** | Marketing link rendered inside app pages. Only show on public landing. |
| `components/navigation.tsx:96` | "Languages" Link | `href="/#languages"` | Hide on authenticated app pages | **BUG** | Marketing link rendered inside app pages. Only show on public landing. |
| `components/navigation.tsx:100` | "My Reels" Link | `href="/projects"` | `href="/projects"` | **CORRECT** | Primary app link. |
| `components/navigation.tsx:143` | "Localize a Reel" (Public Nav) | `href="/#studio"` | `signIn("google", { callbackUrl: "/studio/new" })` | **BUG** | Pointed to deprecated homepage anchor `/#studio`. Change to trigger auth with callback to `/studio/new`. |
| `app/projects/page.tsx:47` | "Localize New Reel" (Top Button) | `href="/#studio"` | `href="/studio/new"` | **P0 BUG** | Hardcoded to old landing page anchor. Update to `href="/studio/new"`. |
| `app/projects/page.tsx:67` | "Localize a Reel" (Empty State CTA) | `href="/#studio"` | `href="/studio/new"` | **P0 BUG** | Hardcoded to old landing page anchor. Update to `href="/studio/new"`. |
| `app/dashboard/page.tsx:61` | "Localize a new Reel" (Header CTA) | `href="/studio/new"` | `href="/studio/new"` | **CORRECT** | Directs to `/studio/new`. |
| `app/dashboard/page.tsx:140` | "Start localization →" (Promo Card) | `href="/studio/new"` | Remove promo card entirely | **REVISE** | Promotional card inside operational dashboard should be removed. |
| `app/dashboard/page.tsx:209` | "Localize your first Reel" (Empty CTA) | `href="/studio/new"` | `href="/studio/new"` | **CORRECT** | Directs to `/studio/new`. |
| `app/project/[id]/page.tsx:99` | "Return to Home" (Error State) | `href="/"` | `href="/dashboard"` | **BUG** | Authenticated creators should return to `/dashboard` on error. |
| `app/project/[id]/page.tsx:124` | "Back to Dashboard" (Breadcrumb) | `href="/dashboard"` | `href="/dashboard"` | **CORRECT** | Directs to `/dashboard`. |
| `app/studio/new/page.tsx:164` | "Back to Dashboard" (Breadcrumb) | `href="/dashboard"` | `href="/dashboard"` | **CORRECT** | Directs to `/dashboard`. |
| `components/hero.tsx:38` | "Localize a Reel" (Hero Logged In) | `href="/studio/new"` | `href="/studio/new"` | **CORRECT** | Directs to `/studio/new`. |
| `components/hero.tsx:47` | "Get Started with Google" (Hero Logged Out)| `signIn("google", { callbackUrl: "/dashboard" })` | `signIn("google", { callbackUrl: "/studio/new" })` | **IMPROVE** | Get started should take creator straight into creation studio `/studio/new`. |
| `components/profile-menu.tsx:95` | "Dashboard" (Dropdown Item) | `href="/dashboard"` | `href="/dashboard"` | **CORRECT** | Directs to `/dashboard`. |
| `components/profile-menu.tsx:104`| "My Reels" (Dropdown Item) | `href="/projects"` | `href="/projects"` | **CORRECT** | Directs to `/projects`. |
| `components/profile-menu.tsx:113`| "Credits & billing" (Dropdown Item) | `href="/billing"` | `href="/billing"` | **CORRECT** | Directs to `/billing`. |
| `components/profile-menu.tsx:122`| "Account" (Dropdown Item) | `href="/account"` | `href="/account"` | **CORRECT** | Directs to `/account`. |
| `components/profile-menu.tsx:135`| "Sign out" (Dropdown Item) | `signOut({ callbackUrl: "/" })` | `signOut({ callbackUrl: "/" })` | **CORRECT** | Returns to public landing page. |

---

## 2. Root Cause of `/studio/new` vs `/#studio` Mismatch

### Root Cause 1: `app/projects/page.tsx:47` & `app/projects/page.tsx:67`
```tsx
// Current:
<Link href="/#studio">Localize New Reel</Link>
// Expected:
<Link href="/studio/new">Localize New Reel</Link>
```

### Root Cause 2: `components/navigation.tsx:143`
```tsx
// Current:
<a href="/#studio">Localize a Reel</a>
// Expected:
<button onClick={() => signIn("google", { callbackUrl: "/studio/new" })}>Localize a Reel</button>
```

### Root Cause 3: Mixed Top Navigation in `components/navigation.tsx`
```tsx
// Current:
Renders <a href="/#how-it-works"> and <a href="/#languages"> regardless of whether the user is in the authenticated app.
// Expected:
Authenticated App Nav: Dashboard | New Reel | My Reels | [Credits Pill] | [Avatar Menu]
Public Marketing Nav: How it works | Languages | Sign in | Get started
```
