# Video Editor Portfolio Platform — Project Plan

## Project Summary

A portfolio platform for video editors. Creators sign in with Google, claim a username, add existing work via YouTube/Instagram/Google Drive links, choose a visual theme, and publish a premium portfolio at `platform.com/username`.

**Stack:** Next.js 15 + TypeScript + Better Auth + Neon PostgreSQL + Drizzle ORM + Tailwind CSS + Motion

---

## Phase Breakdown

### Phase 1 — Foundation
- Next.js 15 project initialization (App Router, TypeScript, Tailwind CSS)
- Folder structure per PRD (Section 114)
- Drizzle ORM setup + Neon PostgreSQL connection
- Database schema (all V1 tables)
- Better Auth setup with Google OAuth
- Auth middleware (protect dashboard routes)

### Phase 2 — Onboarding Flow
- `/signin` — Google sign-in page
- Post-auth: username claim screen
- Profile setup screen
- First project add screen
- Design selection screen
- Preview + publish screen

### Phase 3 — Dashboard
- `/dashboard` — Overview
- `/dashboard/work` — Project list
- `/dashboard/work/new` — Add work (URL detection, metadata)
- `/dashboard/work/[projectId]/edit` — Edit project
- `/dashboard/profile` — Profile editor
- `/dashboard/design` — Theme selector
- `/dashboard/preview` — Live preview
- `/dashboard/settings` — Account settings

### Phase 4 — Public Portfolio (Core Product)
- `/[username]` — Full public portfolio page
- `/[username]/work/[slug]` — Individual project page
- Theme system (Cinema, Editorial, Studio)
- Motion/animation system
- SEO metadata generation
- Mobile-first responsive design

### Phase 5 — Landing & Marketing
- `/` — Landing page (hero, problem, how it works, showcase, pricing, FAQ, CTA)
- `/explore` — Creator discovery (minimal for V1)
- `/pricing` — Pricing page
- `/about` — About page

### Phase 6 — Admin
- `/admin` — Admin panel
- User/profile/project management
- Suspend/unpublish controls
- Reporting system

---

## Database Schema

### Better Auth Tables
| Table | Purpose |
|-------|---------|
| `user` | Auth user identity |
| `session` | Active sessions |
| `account` | OAuth account linkage |
| `verification` | Email verification tokens |

### Application Tables
| Table | Key Fields |
|-------|-----------|
| `profiles` | id, user_id, username, display_name, headline, bio, avatar_url, location, availability, is_published |
| `projects` | id, profile_id, slug, title, description, source_type, source_url, thumbnail_url, category, client, year, featured, is_published, sort_order |
| `social_links` | id, profile_id, platform, url, sort_order |
| `services` | id, profile_id, name, sort_order |
| `skills` | id, profile_id, name, sort_order |
| `portfolio_settings` | id, profile_id, theme, motion_level, accent, navigation_style, project_layout |

### Future Tables (schema ready, not wired)
| Table | Purpose |
|-------|---------|
| `subscriptions` | Razorpay billing |
| `analytics_events` | View/click tracking |
| `reports` | User-submitted reports |
| `admin_actions` | Admin audit log |

---

## Routing Architecture

```
/                          → Landing page
/explore                   → Creator discovery
/pricing                   → Pricing
/about                     → About
/signin                    → Google sign-in

/dashboard                 → Overview (protected)
/dashboard/work            → Project list
/dashboard/work/new        → Add work
/dashboard/work/[id]/edit  → Edit project
/dashboard/profile         → Profile editor
/dashboard/design          → Theme selector
/dashboard/preview         → Preview
/dashboard/settings        → Settings

/[username]                → Public portfolio
/[username]/work/[slug]    → Individual project

/admin                     → Admin panel (role-protected)
/admin/users               → User management
/admin/profiles            → Profile management
/admin/projects            → Project management
/admin/reports             → Reports
/admin/settings            → Admin settings

/api/auth/[...all]         → Better Auth handler
```

---

## Component Architecture

```
components/
├── ui/                    → shadcn/ui primitives (button, input, dialog, etc.)
├── marketing/             → Landing page sections
│   ├── nav.tsx
│   ├── hero.tsx
│   ├── problem.tsx
│   ├── how-it-works.tsx
│   ├── showcase.tsx
│   ├── pricing.tsx
│   ├── faq.tsx
│   └── footer.tsx
├── dashboard/             → Dashboard-specific components
│   ├── sidebar.tsx
│   ├── project-card.tsx
│   ├── project-form.tsx
│   ├── profile-form.tsx
│   ├── theme-selector.tsx
│   └── empty-state.tsx
└── portfolio/             → Public portfolio components (shared by all themes)
    ├── media-embed.tsx    → YouTube/Instagram/Drive renderer
    ├── project-grid.tsx
    └── contact-section.tsx
```

---

## Theme Architecture

Each theme is a complete renderer consuming the same `Portfolio` data model:

```typescript
interface PortfolioData {
  profile: Profile
  projects: Project[]
  services: Service[]
  skills: Skill[]
  socialLinks: SocialLink[]
  settings: PortfolioSettings
}
```

Themes:
- **Cinema** — Dark, dramatic, full-bleed media, large project numbers
- **Editorial** — Typographic, editorial rhythm, high contrast
- **Studio** — Clean, minimal, grid-based, spacious

All themes share the same data layer. Switching theme = switching renderer only.

---

## Media Source System

URL detection → normalization → embed/link

| Source | URL Pattern | Embed Strategy |
|--------|------------|----------------|
| YouTube | `youtube.com/watch`, `youtu.be` | iframe embed |
| Instagram | `instagram.com/reel`, `instagram.com/p` | link + thumbnail |
| Google Drive | `drive.google.com/file` | iframe embed (if public) / link |

---

## Feature Flags (for later phases)

```typescript
// lib/flags.ts
export const flags = {
  analytics: false,
  razorpay: false,
  customDomains: false,
  premiumPlans: false,
  marketplace: false,
}
```

This allows gating future features without architectural changes.

---

## Security Model

Every server action/API route verifies:
1. User is authenticated (Better Auth session)
2. Profile belongs to authenticated user
3. Resource (project/link/skill) belongs to that profile
4. Only then: perform mutation

No client-side ID trust. All ownership checks on server.

---

## SEO Strategy

Public portfolios generate:
- `<title>` — `{displayName} — {headline}`
- `<meta name="description">` — Bio excerpt
- `og:title`, `og:description`, `og:image` (avatar)
- `og:url` — Canonical portfolio URL
- Per-project pages get unique titles/descriptions
- Next.js `generateMetadata()` per route

---

## Performance Strategy

- Server-side render all public portfolio data
- Lazy load media embeds (IntersectionObserver)
- Skeleton loading states in dashboard
- No preloading of all project media
- `next/image` for all images
- Reduce motion on `prefers-reduced-motion`
- Tailwind CSS purging (no unused CSS)

---

## Build Sequence

1. **`npx create-next-app`** with TypeScript, Tailwind, App Router
2. Install dependencies (Drizzle, Neon, Better Auth, Motion, shadcn/ui)
3. Configure environment variables (DATABASE_URL, GOOGLE_CLIENT_ID, etc.)
4. Create DB schema + run migrations
5. Configure Better Auth + Google OAuth
6. Build auth middleware + route protection
7. Build onboarding flow
8. Build dashboard CRUD (profiles, projects, settings)
9. Build portfolio renderer (Cinema theme first)
10. Build landing page
11. Build Editorial + Studio themes
12. Build admin panel
13. SEO + performance pass
14. Mobile polish pass

---

## Key Design Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Routing | App Router (Next.js 15) | Server components, streaming, layouts |
| Data fetching | Server Actions + Server Components | No separate API layer needed in V1 |
| Auth | Better Auth + Google | Per PRD spec |
| ORM | Drizzle ORM | Type-safe, lightweight, Neon-compatible |
| Styling | Tailwind CSS | Per PRD spec |
| Animation | Motion (Framer Motion) | Per PRD spec |
| UI primitives | shadcn/ui | Per PRD spec (dashboard only) |
| Public portfolio | Custom components | PRD: "not stock component-library output" |
| Video hosting | None | PRD: intentional non-goal |
| Backend | None | Next.js Server Actions handle all server logic |

---

## Dependency List

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "typescript": "5.x",
    "tailwindcss": "4.x",
    "better-auth": "latest",
    "drizzle-orm": "latest",
    "@neondatabase/serverless": "latest",
    "motion": "latest",
    "zod": "latest",
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "next-themes": "latest",
    "nanoid": "latest",
    "slugify": "latest",
    "@dnd-kit/core": "latest",
    "@dnd-kit/sortable": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "latest",
    "@types/node": "latest",
    "@types/react": "latest"
  }
}
```

---

## Environment Variables Required

```env
# Database
DATABASE_URL=                    # Neon PostgreSQL connection string

# Better Auth
BETTER_AUTH_SECRET=              # Random secret
BETTER_AUTH_URL=                 # App URL (http://localhost:3000 in dev)

# Google OAuth
GOOGLE_CLIENT_ID=                # From Google Cloud Console
GOOGLE_CLIENT_SECRET=            # From Google Cloud Console

# App
NEXT_PUBLIC_APP_URL=             # Public URL for links/SEO
```

---

## Reserved Usernames

```typescript
export const RESERVED_USERNAMES = [
  'admin', 'api', 'dashboard', 'login', 'signin', 'signup',
  'pricing', 'explore', 'settings', 'about', 'work', 'help',
  'support', 'legal', 'privacy', 'terms', 'contact', 'blog',
  'me', 'profile', 'user', 'users', 'creator', 'creators',
  'app', 'www', 'mail', 'static', 'assets', 'public',
]
```

---

## Open Questions Before Build

1. **Domain name** — What is the platform called? (affects branding, copy, URLs in code)
2. **Google Cloud project** — Do you have credentials ready, or should I use placeholder env vars?
3. **Neon DB** — Do you have a project set up, or placeholder for now?
4. **Theme priority** — Build Cinema theme first (most dramatic), then others?
5. **Logo/brand assets** — Any existing assets, or should I use text-based branding?

