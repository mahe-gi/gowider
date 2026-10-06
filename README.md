# GoWider — Broadcast-Grade Portfolios for Video Editors

> Step out of the chat thread. Go wider.

**GoWider** (`gowider.in`) is an editorial portfolio platform designed specifically for commercial video editors, documentary filmmakers, colorists, and post-production artists. Connect your YouTube, Instagram Reels, and Google Drive edits into an Awwwards-grade portfolio in minutes.

---

## Architecture & Technology Stack

* **Framework:** [Next.js 15.2.1](https://nextjs.org) (App Router, React 19 Server Components)
* **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + CSS Variables + Syne, Plus Jakarta Sans, Geist Mono typography
* **Database & ORM:** [Drizzle ORM](https://orm.drizzle.team) + [Neon Serverless PostgreSQL](https://neon.tech)
* **Authentication:** [Better Auth](https://better-auth.com) (Google OAuth 2.0, secure sessions)
* **Testing:** [Vitest](https://vitest.dev) + `@testing-library/react` (151 unit and security tests)
* **Media Engine:** Zero binary video uploads. Poster-first streaming engine for YouTube, Instagram Reels, and Google Drive

---

## Key Features

1. **Poster-First Media Streaming Engine:**
   * High-impact typographic and cached image posters render instantly. Zero iframes or autoplaying video mounted on initial page shell load.
   * Native streaming from YouTube, Instagram Reels, and Google Drive.

2. **Three Bespoke Signature Themes:**
   * **Cinema:** Deep pitch-black canvas, dramatic fullscreen posters, and fullscreen typography.
   * **Editorial:** Asymmetrical grid, structured caption rails, and vermillion accent styling.
   * **Studio:** Precision multi-column layouts, camera package chips, and technical timecode metadata.

3. **Creator Studio Dashboard:**
   * Intuitive project management with optimistic reordering and instant publish/draft toggles.
   * Full profile customizer, service offerings, verified tool skills, and live device preview drawer.

4. **Public Discovery & Safety:**
   * Creator directory (`/explore`) with category filters and text search.
   * Public data sanitization: zero database UUIDs, user IDs, or emails exposed on public routes.
   * Moderation and reporting pipeline with privacy-preserving IP hashing.

---

## Getting Started

### Prerequisites

* Node.js 20+
* Neon PostgreSQL database

### 1. Installation

```bash
git clone git@github.com:mahe-gi/gowider.git
cd gowider
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=your_32_character_secret_key_here
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
REPORT_PEPPER_SECRET=your_32_character_pepper_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration

```bash
npm run db:migrate
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Verification & Quality Gates

Run the automated test suite and type check:

```bash
npm run check        # Runs TypeScript typecheck + Vitest suite (151/151 tests)
npm run lint         # Runs ESLint (0 errors, 0 warnings)
npm run verify       # Full verification (tests, purity audit, forbidden features firewall)
npm run build        # Production Next.js build
```

---

## Documentation

Full architectural specifications, data models, design tokens, and operational rules are located in the [`docs/`](./docs) directory:

* [`docs/architecture.md`](./docs/architecture.md) — System architecture, routing, and boundaries
* [`docs/database.md`](./docs/database.md) — Database schema, triggers, and indices
* [`docs/design.md`](./docs/design.md) — Design system tokens and theme specifications
* [`docs/rules.md`](./docs/rules.md) — Engineering constraints and security standards
* [`docs/tasks.md`](./docs/tasks.md) — Completed implementation roadmap
* [`docs/project-plan.md`](./docs/project-plan.md) — Product requirements and milestones

---

## License

Private repository. All rights reserved. © GoWider.
