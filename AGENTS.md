<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reelify — Permanent Coding Agent Rules

These rules govern all AI coding agents working on this repository:

1. **Read locked docs before implementation:** Always align with `rules.md`, `database.md`, and `architecture.md`.
2. **Never modify locked specification documents:** Specifications define *what* the product is.
3. **Implement only the assigned task/workstream:** Avoid unbounded refactoring of unrelated files.
4. **V2 Authorized Workstream:** Razorpay Billing System & Pro Tier Gates (custom domains, video binary uploads, Redis remain deferred until their respective sprints).
5. **Never use fake production data:** Zero demo users ("Mahesh", "Rahul") or brands ("Nike", "Apple") in production schemas.
6. **Strict ownership enforcement:** Always verify `resource -> profile -> profile.userId === session.user.id`.
7. **Strict public data sanitization:** Never expose database UUIDs, user IDs, emails, or session info on public routes.
8. **Poster-first media loading:** Never mount YouTube/Drive iframes or autoplay video on initial page shell load.
9. **Published slug immutability:** Once `published_at IS NOT NULL`, project slugs can never change.
10. **On architectural conflict:** Mark task `BLOCKED` immediately and do not invent architecture.
11. **Run required validation before DONE:** Always verify `npm run typecheck` and `npm run test` cleanly before marking tasks complete.
