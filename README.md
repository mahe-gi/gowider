# GoWider

AI-powered regional video localization platform for Indian creators. Dub English videos into Hindi, Telugu, Tamil, and other Indian languages with neural voice cloning, lip-sync, and accurate subtitles.

## Tech Stack
- **Web & API:** Next.js 15 (App Router, React 19, TypeScript, Tailwind CSS)
- **Database:** PostgreSQL with Drizzle ORM
- **Background Queue:** Self-hosted Redis 7 + BullMQ
- **Workers:** Node.js background daemons (`workers/index.ts`)
- **AI Voice Dubbing:** Sarvam AI
- **Media Storage:** Cloudflare R2 (Production) / Local filesystem (Development)
- **Auth:** NextAuth (Auth.js v5) with Google OAuth
- **Billing:** Razorpay Checkout & Webhooks with internal prepaid ledger

---

## Local Development

```bash
# 1. Start local PostgreSQL and Redis containers
docker compose up -d postgres redis

# 2. Install dependencies
npm install

# 3. Push database schema
npm run db:push

# 4. Terminal 1: Run Next.js Web App
npm run dev

# 5. Terminal 2: Run Background Worker Daemon
npm run worker:dev
```

---

## Testing & Quality

```bash
# Run unit & integration tests
npm test

# Typecheck
npx tsc --noEmit

# Production build
npm run build
```

---

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full server provisioning, Caddy/Nginx reverse proxy, and zero-data-loss server migration runbooks.
