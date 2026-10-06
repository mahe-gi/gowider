# Reelify — V1 Product & Application Rules

**Document Type:** V1 Behavioral, Security & Application Rules  
**Version:** V1.0 (Locked Baseline)  
**Status:** Locked & Approved  
**Product Name (Placeholder):** Reelify  

---

## 1. Document Purpose & Architectural Authority

This document defines the definitive operational, behavioral, security, and lifecycle contracts for the Reelify V1 application. It governs how the system behaves under all standard, edge, and adversarial conditions.

### 1.1 Source Documents & Hierarchy of Truth
This specification is directly grounded in and strictly constrained by the previously locked baseline specifications:
1. `prd.md` (Product Requirements Document V1.0)
2. `architecture.md` (System Architecture Specification V1.0 Locked)
3. `design.md` (Design System & UI/UX Specification V1.0 Locked)
4. `database.md` (Database Architecture & Schema Specification V1.0 Locked)

None of the baseline invariants established in those documents may be altered, relaxed, or bypassed.

### 1.2 Three Levels of System Invariants
To prevent ambiguity across the engineering stack, rules are categorized into three distinct operational domains:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        THREE-TIER RULE DOMAINS                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│   DATABASE RULE   │  APPLICATION RULE │        PUBLIC UX RULE          │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Enforced by Neon  │ Enforced by Next  │ Enforced by React components   │
│ Postgres engines, │ Server Actions,   │ and responsive presentation    │
│ constraints, and  │ Better Auth guards│ engines (design.md tokens and  │
│ native triggers.  │ and Zod schemas.  │ accessibility guarantees).     │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 2. Rule Precedence & Conflict Resolution

When two rules, constraints, or behavioral expectations appear to conflict, the following strict hierarchy of precedence **MUST** be applied:

1. **Security & Data Isolation Rules** (Zero leakage, zero SSRF, strict authentication, CSRF defense).
2. **Database Integrity & Constraint Rules** (Unique constraints, composite foreign keys, native triggers).
3. **Authentication & Authorization Guard Rules** (`requireAuth()`, `requireProfileOwner()`, `requireAdmin()`).
4. **Product Lifecycle & Business State Rules** (Draft vs. Published, slug immutability, ownership trees).
5. **Design System & UX Standards** (Awwwards-quality pacing, typography, fluid cursors).
6. **Convenience & Performance Optimizations** (Caching, optimistic updates, prefetching).

> **The Sovereign Rule:** Application logic **MUST NEVER** attempt to bypass, relax, or compromise a higher-priority rule to satisfy convenience or design preference. If an application operation violates a database constraint, the database constraint wins. If a UI feature conflicts with authorization isolation, authorization isolation wins.

---

## 3. Normative Language Definitions

The key words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** in this document are to be interpreted as follows:
* **MUST / SHALL / REQUIRED:** Absolute mandatory requirement for V1.
* **MUST NOT / SHALL NOT:** Absolute prohibition for V1.
* **SHOULD / RECOMMENDED:** Strongly advised practice; deviation requires documented architectural justification.
* **SHOULD NOT / NOT RECOMMENDED:** Strongly discouraged practice.
* **MAY / OPTIONAL:** Permitted behavioral option.

---

## 4. Authentication Rules

1. **Provider Scope:** V1 authentication **MUST** be Google OAuth only, managed exclusively via Better Auth. Email/password forms, magic links, OTPs, SMS codes, and third-party social providers (Apple, GitHub, Twitter) **MUST NOT** be enabled or implemented in V1.
2. **Public vs. Protected Boundaries:**
   * Public visitors **MUST** be allowed to browse published portfolios (`/[username]`) and individual project pages (`/[username]/work/[slug]`) without authenticating.
   * Creators **MUST** be fully authenticated before claiming a username, accessing `/onboarding`, or accessing any route under `/dashboard/*`.
3. **Middleware is NOT the Security Boundary:** Edge middleware **MAY** perform early route redirection (e.g. redirecting unauthenticated users visiting `/dashboard` to `/signin`), but edge middleware **MUST NOT** be treated as an authorization boundary.
4. **Mandatory Server Session Verification:** Every Server Action, Route Handler, and Server Component reading private data or performing a mutation **MUST** independently verify the session cryptographically via Better Auth on the server (`auth.api.getSession()`).
5. **No Client Trust:** The server **MUST NEVER** trust client-supplied `user_id`, client-supplied session tokens, or hidden form fields as proof of identity.
6. **Session Lifecycle:**
   * Unauthenticated requests to protected endpoints **MUST** return a typed `UNAUTHORIZED` error or redirect to `/signin`.
   * Expired or revoked sessions **MUST** be treated as immediately unauthenticated.

---

## 5. Role & Administrative Access Rules

1. **Two Roles Only:** The system recognizes exactly two user roles: `'creator'` and `'admin'`.
2. **Standard User Registration:** Every user registration via Google OAuth **MUST** be assigned the `'creator'` role by default.
3. **Zero Self-Promotion:** Normal authentication routes and profile mutation endpoints **MUST NOT** accept or allow modifications to the `role` field. `role` is configured with `input: false` in Better Auth.
4. **Safe Admin Bootstrap:** Promotion to the `'admin'` role **MUST** happen solely through:
   * A dedicated one-time CLI seed script (`npm run db:seed-admin`) executed with strict server environment credentials, OR
   * Explicit direct SQL execution in the Neon Console.
5. **Admin Access Disconnect & Surface Isolation:**
   * **Page Navigation (`/admin/*`):** Non-admin users attempting to load an admin page **MUST** be cleanly redirected to `/dashboard` via Next.js `redirect('/dashboard')`.
   * **Route Handlers (`/api/admin/*`):** Non-admin users or unauthenticated clients **MUST** receive an HTTP `403 FORBIDDEN` JSON response (`{ "error": "Forbidden" }`).
   * **Server Actions:** Administrative mutations invoked by non-admin sessions **MUST** return a typed `{ success: false, error: "FORBIDDEN" }` result.
6. **Strict V1 Admin Scope:** Because the V1 database schema does not include user suspension flags (`is_banned`, `status`, `ban_until`), administrators in V1:
   * **MAY:** View registered users, inspect creator profiles, inspect project metadata, unpublish profiles (`is_published: false`), unpublish individual projects, review reports, and transition report tickets (`'resolved'` or `'dismissed'`).
   * **MUST NOT:** Arbitrarily reassign user roles, attempt to "suspend" accounts via non-existent database flags, or edit creator portfolio content as if they were the owner.

---

## 6. Server-Side Authorization Guards

All mutations and sensitive queries **MUST** pass through explicit server-side guard procedures:

```typescript
// 1. Authenticate active session
export async function requireAuth(): Promise<UserSession>;

// 2. Verify authenticated user owns targeted profile
export async function requireProfileOwner(profileId: string): Promise<{ user: UserSession; profile: ProfileRecord }>;

// 3. Verify authenticated user is system administrator
export async function requireAdmin(): Promise<UserSession>;
```

### 6.1 Multi-Hop Resource Authorization Contract
For any operation modifying a sub-resource (e.g. `projects`, `social_links`, `services`, `skills`, `portfolio_settings`):
1. The server **MUST** query the resource from the database using its primary key.
2. The server **MUST** resolve the owning `profile_id` from that record.
3. The server **MUST** query the parent profile and verify `profile.user_id === session.user.id`.
4. Only upon complete ownership verification **MAY** the mutation execute.
5. The server **MUST NOT** authorize mutations based on project `slug`, `username`, or client-provided ownership flags.

---

## 7. Username Rules & Lifecycle Policy

1. **Syntactic Constraints:** Usernames **MUST** satisfy `^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$` (3 to 30 characters, lowercase alphanumeric, hyphens, and underscores; cannot start or end with a hyphen or underscore).
2. **Canonical Normalization:** Input usernames **MUST** be trimmed and converted to lowercase before validation or lookup.
3. **Reserved Route Protection:** The system **MUST** maintain a centralized reserved list rejecting routes used by marketing, authentication, or system operations:
   ```typescript
   export const RESERVED_USERNAMES = new Set([
     "admin", "api", "dashboard", "signin", "signup", "login", "onboarding",
     "explore", "pricing", "about", "settings", "work", "help", "support",
     "legal", "privacy", "terms", "contact", "blog", "app", "www", "mail",
     "static", "assets", "public"
   ]);
   ```
4. **Availability Throttling vs. Database Authority:**
   * The 30 requests/minute/IP rate limit on username checks is an **abuse and enumeration mitigation** measure.
   * It **MUST NOT** be treated as a guarantee of uniqueness. The PostgreSQL constraint `UNIQUE(username)` is the sole and final authority.
   * Race conditions **MUST** be caught at insertion/update via PostgreSQL error code `23505` and returned as: `"Username is already taken. Please choose another."`
5. **Username Updates & Dual-Route Cache Invalidation:**
   * A creator **MAY** update their username in `/dashboard/settings`.
   * V1 **DOES NOT** maintain a username redirect table or alias history. When updated, the previous username is released immediately for public claiming.
   * The settings UI **MUST** display an explicit confirmation dialog warning the creator that existing links in external social bios will stop routing immediately.
   * **Mandatory Cache Invalidation:** Upon successful rename transaction (`oldname` → `newname`), the server action **MUST** immediately invalidate both paths:
     ```typescript
     revalidatePath(`/${oldname}`);
     revalidatePath(`/${newname}`);
     revalidatePath(`/${oldname}/work/[slug]`, 'page');
     revalidatePath(`/${newname}/work/[slug]`, 'page');
     ```

---

## 8. Onboarding Rules & Minimum Publish Requirements

The onboarding workflow (`/onboarding`) consists of 5 sequential steps:
1. **Step 1 (Claim URL):** Validates and stores a unique `username`.
2. **Step 2 (Identity):** Captures `display_name`, `headline`, and optional `location`.
3. **Step 3 (First Work):** Captures and validates the creator's first project URL, creating the project record in draft state (`is_published: false`).
4. **Step 4 (Aesthetic):** Persists the initial theme selection (Cinema by default) and motion preference.
5. **Step 5 (Preview & Publish):** Renders the generated draft portfolio. When the creator clicks `[ Publish Portfolio Now ]`:
   * The system validates all minimum publish requirements.
   * Inside an atomic transaction, the system transitions the onboarding project to `is_published: true` (stamping `projects.published_at = now()`) and transitions `profiles.is_published = true`.

### 8.1 Minimum Publish Requirements (Gatekeeper Contract)
A portfolio **MUST NOT** transition to `is_published: true` unless all of the following conditions are satisfied:
1. `username` is claimed and verified unique.
2. `display_name` is non-empty (minimum 2 characters).
3. `headline` is non-empty (minimum 2 characters).
4. At least one project has been created with a valid external media URL and has `is_published: true`.
5. `portfolio_settings` record exists with an active theme selection.

If a creator attempts to publish before meeting these criteria, the server action **MUST** reject the mutation with a descriptive error listing the missing requirements.

---

## 9. Media Provider & URL Security Rules

Reelify operates strictly as a **presentation layer** and **MUST NOT** store, host, or transcode video binaries.

### 9.1 Zero Server-Side Scraping (SSRF Firewall)
The server **MUST NEVER** make outbound HTTP requests to user-submitted URLs. Metadata extraction and canonicalization **MUST** be performed deterministically via URL parsing and regex matching on both client and server.

### 9.2 Provider Whitelist & Canonical Normalization
Only external URLs matching the approved domain allowlist **MUST** be accepted:

```typescript
export const ALLOWED_MEDIA_HOSTS = new Set([
  "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be",
  "instagram.com", "www.instagram.com",
  "drive.google.com"
]);
```

Any URL with an unlisted hostname, arbitrary port, or non-HTTPS protocol **MUST** be rejected immediately.

### 9.3 Provider Execution Contracts

#### A. YouTube
* **Privacy Embed:** Embeds **MUST** use `https://www.youtube-nocookie.com/embed/{id}`.
* **Poster-First Activation:** The raw YouTube iframe **MUST NOT** be rendered on initial page load. A lightweight image poster (`img.youtube.com/vi/{id}/maxresdefault.jpg` with fallback to `hqdefault.jpg`) **MUST** render first.
* **Playback Activation:** Video playback and iframe insertion **MUST ONLY** trigger upon explicit user click. Hovering triggers a subtle visual poster scale (1.03x) and **MUST NOT** trigger video playback.

#### B. Instagram
* **URL-First Presentation:** Instagram edits **MUST** be rendered as high-end editorial cards displaying metadata and a "Watch on Instagram ↗" action.
* **Zero Scraper Dependency:** The system **MUST NOT** attempt to scrape Instagram reels or depend on private Instagram Graph API tokens. Clicking opens the verified Instagram URL directly in a new tab.
* **Zero Iframe Policy:** Instagram posts/reels **MUST NOT** be loaded in iframes.

#### C. Google Drive
* **Resilient Preview Embed:** Preview iframe **MAY** be rendered (`https://drive.google.com/file/d/{id}/preview`), and **SHOULD** be lazy-loaded using an `IntersectionObserver`.
* **Persistent Action Bar:** The Google Drive player container **MUST ALWAYS** render a permanent, visible direct link: `[ OPEN IN GOOGLE DRIVE ↗ ]`.
* **Fallback Visuals:** If cross-origin permissions or third-party cookies block the iframe, the UI gracefully retains the project poster and metadata with the direct action bar.
* **No OAuth / No API:** V1 **MUST NOT** request Google Drive OAuth scopes or interact with Google Drive APIs. Better Auth Google Sign-In credentials **MUST NEVER** be repurposed for Drive file access.

---

## 10. Thumbnail & Visual Fallback Rules

1. **Priority Hierarchy:** Project thumbnails **MUST** be resolved strictly in this order:
   1. *Provider-Derived Thumbnail:* (e.g. YouTube standard CDN).
   2. *Platform-Generated Typographic Poster:* Dynamically composed in the theme styling using project title, category, and year.
   3. *Validated Creator Image Link:* An optional user-provided external image URL.
2. **Creator Image URL Allowlist:** If a creator provides an external thumbnail URL, it **MUST** be an `https://` link matching an approved CDN allowlist (e.g. `images.unsplash.com`, `cdn.sanity.io`, `lh3.googleusercontent.com`, `i.imgur.com`). Unlisted or insecure URLs **MUST** be rejected.
3. **Zero Binary Storage:** The platform **MUST NOT** operate an object storage bucket (e.g. AWS S3, Cloudflare R2) for user images in V1.

---

## 11. Project Lifecycle & Published Slug Immutability

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PROJECT SLUG LIFECYCLE                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│         NEVER PUBLISHED          │        PREVIOUSLY PUBLISHED         │
│      (published_at IS NULL)      │      (published_at IS NOT NULL)     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Title editable                 │ • Title editable                    │
│ • Metadata & media editable      │ • Metadata & media editable         │
│ • Slug EDITABLE & auto-derived   │ • Slug STRICTLY IMMUTABLE           │
│ • Not accessible on public URL   │ • Accessible when is_published=true│
└──────────────────────────────────┴─────────────────────────────────────┘
```

### 11.1 Published Slug Immutability Invariant Matrix
1. $\text{is\_published} == \text{true} \implies \text{published\_at} \neq \text{NULL}$.
2. $\text{is\_published} == \text{false} \implies \text{published\_at MAY be NULL (never published) or non-NULL (previously published)}$.
3. $\text{published\_at} \neq \text{NULL} \implies \text{slug is permanently immutable}$.
4. **Immutable Timestamp Rule:** Once set, `published_at` **MUST NOT** be cleared or nullified upon subsequent unpublishing.
5. **Database Enforcement:** The PostgreSQL trigger is the final enforcement layer and rejects any prohibited update regardless of the application entry point.

### 11.2 Deterministic Slug Collision Loop
When creating a project, the system **MUST** resolve slug collisions using the programmatic `retry-on-23505` loop:
```text
title → slugify → candidate_slug
INSERT → Success? → Return
       → Error 23505 (unique_violation)? → Append "-2", "-3"... → Retry INSERT
```

---

## 12. Public Portfolio & Project Visibility Rules

1. **Combined Visibility Boolean:** A project is visible on the public web **IF AND ONLY IF**:
   $$\text{Public Visibility} = (\text{profile.is\_published} == \text{true}) \land (\text{project.is\_published} == \text{true})$$
2. **Draft Isolation:**
   * Draft projects (`is_published: false`) **MUST NOT** appear in public portfolio listings or project indexes.
   * Navigating to `/[username]/work/[slug]` for an unpublished project or an unpublished profile **MUST** return an HTTP `404 NOT FOUND`.
3. **No Information Leakage:** Public 404 responses **MUST NOT** reveal whether an unpublished profile or draft project exists. The UI **MUST** display a generic message: `"This work is not available."`
4. **Data Projection Whitelist:** Public queries **MUST NOT** return internal database primary keys (`id`), `user_id`, session tokens, report histories, or email addresses.

---

## 13. Data Model Separation: `PortfolioData` vs. `PublicPortfolioData`

To guarantee that internal security fields and primary keys are never sent to the public client:

```typescript
// 1. Internal Contract (Used within Authenticated Dashboard & Preview)
export interface PortfolioData {
  profile: ProfileRecord;               // Contains internal UUIDs, user_id, timestamps
  projects: ProjectRecord[];            // Contains internal project UUIDs
  socialLinks: SocialLinkRecord[];
  services: ServiceRecord[];
  skills: SkillRecord[];
  settings: PortfolioSettingRecord;
}

// 2. Safe Public Projection (Consumed strictly by /[username] and public themes)
export interface PublicPortfolioData {
  profile: {
    username: string;
    displayName: string;
    headline: string;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    availability: string | null;
  };
  projects: Array<{
    slug: string; // Public identifier only (NO internal database UUID)
    title: string;
    description: string | null;
    sourceType: MediaSourceType;
    sourceUrl: string;
    thumbnailUrl: string | null;
    category: string;
    client: string | null;
    year: number | null;
    tools: string[];
    featured: boolean;
    sortOrder: number;
  }>;
  socialLinks: Array<{ platform: string; url: string }>;
  services: string[];                   // Flat array of names (NO IDs)
  skills: string[];                     // Flat array of names (NO IDs)
  settings: {
    theme: "cinema" | "editorial" | "studio";
    motionLevel: "full" | "reduced";
    accentColor: string;
  };
}
```

The public portfolio loader **MUST** map database queries directly into `PublicPortfolioData`. It **MUST NOT** serialize raw database-shaped `PortfolioData` to the browser.

---

## 14. Project Ordering & Featured Work Rules

1. **Dense Zero-Based Indexing:** Project sort order **MUST** use dense integers: `0, 1, 2, 3...`.
2. **Deterministic Sequence:** Public and preview project queries **MUST** order projects by `ASC(sort_order), DESC(created_at)`.
3. **Atomic Reordering:** Reordering operations in `/dashboard/work` **MUST** execute within an atomic database transaction. Reordering **MUST NOT** alter project slugs, publish states, or media URLs.
4. **Featured Presentation Flag:**
   * Setting `featured: true` highlights a project (e.g. designating it as the Cinema showreel).
   * A project **MAY** have `featured: true` while `is_published: false` (visible in creator preview only).
   * Public portfolios **MUST ONLY** render featured projects that also have `is_published: true`.

---

## 15. Theme & Preview Architecture Rules

1. **Single Public Portfolio Data Contract:** All three themes (Cinema, Editorial, Studio) **MUST** consume the identical `PublicPortfolioData` interface. Themes **MUST NOT** require proprietary database columns or bespoke project schema.
2. **Theme Switching Safety:** Changing themes in `/dashboard/design` updates only `portfolio_settings.theme`. It **MUST NOT** modify, duplicate, or delete any creator profile, project, service, or skill records.
3. **Direct Component Preview (No Iframes):**
   * `/dashboard/preview` **MUST** render the production `<PortfolioRenderer />` component directly inside a viewport shell container (`<PreviewViewport />`).
   * The dashboard preview **MUST NOT** load the application's public route inside an `<iframe>`.
   * The preview surface **MUST** display a persistent warning banner: `"DRAFT PREVIEW MODE — Changes here reflect your unpublished edits."`

---

## 16. Moderation & Abuse Reporting Rules

1. **Explicit Target Contracts:**
   * **Profile Report:** `profile_id = target_profile_id`, `project_id = NULL`.
     * Condition: Targeted profile **MUST** be actively published (`is_published: true`).
   * **Project Report:** `profile_id = target_profile_id`, `project_id = target_project_id`.
     * Condition: Both the targeted project and its owning profile **MUST** be actively published (`project.is_published: true` and `profile.is_published: true`).
     * Reports targeting draft/unpublished projects **MUST** be rejected with a 404 to prevent ID guessing.
2. **Reporter Privacy (Peppered IP Hash):** The server **MUST NEVER** store plaintext client IP addresses. It **MUST** store an HMAC-SHA256 salted hash:
   $$\text{reporter\_ip\_hash} = \text{HMAC-SHA256}(\text{client\_ip}, \text{SERVER\_SALT\_SECRET})$$
3. **Composite Relational Integrity:** When a report targets a specific project, `reports(project_id, profile_id)` **MUST** reference `projects(id, profile_id)`.
4. **Atomic Concurrency-Safe Rate Limiting:**
   * The report creation transaction **MUST** acquire a transaction-scoped PostgreSQL advisory lock derived from the reporter's IP hash:
     ```sql
     BEGIN;
     SELECT pg_advisory_xact_lock(hashtext('reporter_ip_hash_value'));
     SELECT count(*) FROM reports WHERE reporter_ip_hash = '...' AND created_at > now() - INTERVAL '1 hour';
     -- If count >= 5, ROLLBACK and return 429 TOO MANY REQUESTS
     INSERT INTO reports (...) VALUES (...);
     COMMIT;
     ```
5. **No Automatic Creator Punishment:** Submitting a report **MUST NOT** automatically unpublish, flag, or restrict a creator's portfolio. Reports are placed into `/admin/reports` for human review.
6. **State Transitions & Admin Actions:**
   * Initial state is strictly `'pending'`.
   * Admin users **MAY** transition reports to `'resolved'` or `'dismissed'`.
   * Transitioning out of pending **MUST** record `resolved_at = now()` and `resolved_by = session.user.id`.

---

## 17. Deletion Cascades & Data Destruction Rules

1. **User Account Deletion:** When a user account is deleted in `/dashboard/settings`:
   * Better Auth sessions and OAuth accounts are destroyed.
   * `profiles` record is deleted (`ON DELETE CASCADE`).
   * All associated `projects`, `social_links`, `services`, `skills`, and `portfolio_settings` are deleted via database cascade.
   * Associated `reports` targeting the profile are deleted via database cascade.
2. **Project Deletion:** When a project is deleted:
   * The database trigger `trg_projects_pre_delete` sets `reports.project_id = NULL` for any report referencing it, preserving the moderation record for the parent profile.
   * The project row is permanently destroyed.
3. **Admin User Deletion:** If an administrative account is deleted, foreign keys in `reports.resolved_by` are set to `NULL` (`ON DELETE SET NULL`), preserving resolution timestamps and audit history.
4. **No Soft Deletes in V1:** The database **DOES NOT** maintain `deleted_at` or `is_archived` flags in V1. Deletion is permanent and irreversible.

---

## 18. Content Safety, XSS & CSRF Defenses

1. **Untrusted User Text:** All text submitted by creators (`display_name`, `headline`, `bio`, `title`, `description`, `category`, `client`) **MUST** be treated as untrusted user input.
2. **HTML Escaping by Default:** React JSX automatic escaping **MUST** be preserved. The application **MUST NEVER** use `dangerouslySetInnerHTML` to render creator-supplied content.
3. **Descriptions are Plain Text:** Project descriptions and creator bios **MUST** be rendered as plain text with preserved line breaks (`whitespace-pre-line`). Arbitrary markdown parsing or raw HTML injection is strictly prohibited in V1.
4. **No Arbitrary Iframe Injection:** Iframe embed codes pasted by users **MUST NOT** be rendered. The system strictly generates trusted embed URLs internally from verified provider IDs (`youtube-nocookie.com`, `drive.google.com`).
5. **Same-Origin & CSRF Protections:**
   * Next.js Server Actions enforce built-in origin validation.
   * Any custom cookie-authenticated Route Handler that performs state mutations (`POST`, `PUT`, `DELETE`, `PATCH`) **MUST** explicitly verify the `Origin` or `Sec-Fetch-Site` headers against `process.env.NEXT_PUBLIC_APP_URL` to prevent cross-site request forgery.

---

## 19. Rate Limiting Baselines (Serverless Architecture)

Rate limiting operates without external Redis clusters using targeted mechanisms:

| Action / Endpoint | Rate Limit Threshold | Operational Objective | Enforcement Mechanism |
|---|---|---|---|
| **Google Sign-In** | Managed natively | Credential stuffing defense | Better Auth built-in auth rate limiting |
| **Username Availability Check** | Max 30 requests / min / IP | Enumeration & bot mitigation (NOT uniqueness) | Client 300ms debounce + Server Route Handler throttle |
| **Project Creation Mutations** | Max 20 creations / hr / profile | Database spam prevention | Database count check on `projects` within authenticated Server Action |
| **Public Abuse Reports** | Max 5 submissions / hr / IP hash | Spam flooding prevention | Atomic transaction with `pg_advisory_xact_lock` on `reports` |

---

## 20. Performance, Caching & Revalidation Rules

1. **Poster-First Guarantee:** YouTube iframes **MUST NEVER** be rendered on initial page load. The HTML shell **MUST** load lightweight image posters first.
2. **Explicit CSS Aspect Ratios:** All media containers **MUST** declare explicit CSS aspect ratios (`aspect-video`, `aspect-[9/16]`, `aspect-[4/5]`) to prevent layout shifts.
3. **Targeted Dynamic Cache Invalidation:** When a creator performs any mutation affecting their public portfolio:
   * Updating profile identity
   * Adding, editing, reordering, or deleting projects
   * Toggling publish state
   * Changing theme or accent settings
   The server action **MUST** trigger targeted route revalidation:
   ```typescript
   revalidatePath(`/${username}`);
   revalidatePath(`/${username}/work/${slug}`);
   ```
   If bulk changes occur where slugs are re-indexed, pattern-based revalidation **MAY** be invoked:
   ```typescript
   revalidatePath('/[username]', 'page');
   revalidatePath('/[username]/work/[slug]', 'page');
   ```

---

## 21. Accessibility & Reduced Motion Guarantees

1. **Progressive Custom Cursor:**
   * The custom desktop cursor is purely decorative enhancement.
   * It **MUST** set `pointer-events: none`.
   * It **MUST** be disabled on touch devices (`pointer: coarse`).
   * It **MUST** be disabled when `prefers-reduced-motion: reduce` is active.
   * All interactive elements **MUST** feature accessible semantic labels independently of the cursor.
2. **Reduced Motion Adaptation:** When `prefers-reduced-motion: reduce` is detected:
   * Continuous ambient animations and zoom transforms **MUST** be suppressed.
   * Motion durations **MUST** drop to `0.01ms` or subtle opacity cross-fades.
3. **Contrast Compliance:** All text-to-background combinations **MUST** maintain WCAG 2.1 AA contrast ratios (minimum 4.5:1 for body copy, 3:1 for large display text).

---

## 22. Strict Production Data Rules

1. **Clean Production Database:** The production database **MUST NEVER** contain synthetic, dummy, or demo records (*no fake creators named Mahesh, Rahul, or Anusha; no fake projects for Nike, Apple, or Red Bull*).
2. **Development Fixtures Isolation:** Development fixtures (`src/db/fixtures/dev-seed.ts`) **MUST** be explicitly isolated. If executed in an environment where `NODE_ENV === "production"` or `VERCEL_ENV === "production"`, the script **MUST** throw an immediate fatal error and terminate.
3. **Zero-State Integrity:** The application **MUST** be designed to look visually compelling and structurally complete when the database contains zero projects or zero creators. Fabricating records to "fill space" is strictly prohibited.

---

## 23. Future Feature Firewall (Strict V1 Exclusions)

The following capabilities are explicitly classified as **Post-V1 Extensions** and **MUST NOT** be implemented, stubbed, or migrated into V1 code:

* ❌ Paid subscriptions, Razorpay SDK, billing webhooks, or pro tier paywalls.
* ❌ Custom domains (e.g. `mahesh.com`) or CNAME routing.
* ❌ Analytics tracking events, view counters, or visitor telemetry databases.
* ❌ Marketplace, hiring boards, client inquiries, or creator messaging.
* ❌ Direct video file uploads, transcoding pipelines, or video storage buckets.
* ❌ Vimeo, Wistia, TikTok, or Twitter/X video embeds.
* ❌ Google Drive API integration or Google Drive OAuth permission requests.
* ❌ Multi-user teams, agency workspaces, or multi-profile accounts.
* ❌ Social features: likes, comments, follower counts, or public bookmarks.

---

## 24. Standard Error Handling & User Feedback Contracts

User-facing error responses **MUST** be descriptive, courteous, and actionable, while stripping out internal implementation details:

| Error Scenario | User-Facing Message | Internal Log Details |
|---|---|---|
| **Duplicate Username** | `"That username is already taken. Please choose another."` | PostgreSQL error `23505` on `profiles_username_unique`. |
| **Invalid Username Syntax** | `"Usernames must be 3–30 characters, lowercase, and contain only letters, numbers, hyphens, or underscores."` | Regex failure on `^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$`. |
| **Reserved Username** | `"This username is reserved for system routes. Please select another."` | Match against `RESERVED_USERNAMES` set. |
| **Unsupported Media Link** | `"Please enter a valid link from YouTube, Instagram, or Google Drive."` | `MediaProvider.validate()` returned `false`. |
| **Published Slug Edit Attempt** | `"Project URLs cannot be changed once published to preserve existing links."` | Mutating `slug` when `published_at IS NOT NULL`. |
| **Excessive Reports Submitted** | `"You have submitted multiple reports recently. Please try again later."` | Database IP hash throttle threshold exceeded (>5/hr). |
| **Incomplete Publish Attempt** | `"Please add your display name, headline, and at least one project before publishing."` | Failed minimum publish requirement validation. |
| **Unpublished Work Accessed** | `"This work is not available."` (HTTP 404) | Query returned unpublished project or unpublished profile. |
| **Unexpected System Failure** | `"Something went wrong. Please try again in a few moments."` (HTTP 500) | Full stack trace logged server-side; zero SQL leaked. |

---

## 25. Final V1 Implementation Checklist

Before V1 release, the engineering team **MUST** verify each of the following rules:

- [ ] **Authentication:** Google OAuth is the sole provider; session tokens are strictly validated server-side.
- [ ] **Roles:** Normal signups strictly receive `'creator'`; admin promotion requires explicit bootstrap.
- [ ] **Guards:** All mutations enforce `requireAuth()`, `requireProfileOwner()`, or `requireAdmin()`.
- [ ] **Admin Isolation:** Navigation redirects to `/dashboard`, API endpoints emit 403, actions emit FORBIDDEN.
- [ ] **Onboarding:** 5-step wizard creates project in Step 3 and atomically publishes project + profile in Step 5.
- [ ] **Media Providers:** Zero server-side scraping; YouTube, Instagram, and Drive URLs parsed purely via allowlisted patterns.
- [ ] **Poster-First Media:** YouTube iframes load strictly on click; hover only triggers poster scale.
- [ ] **Google Drive Fallback:** Drive player container permanently displays `"Open in Google Drive ↗"`.
- [ ] **Slug Immutability:** Stamped by `published_at`; locked against updates via application and DB trigger.
- [ ] **Public Isolation:** Public routes consume `PublicPortfolioData` with zero internal UUIDs or draft projects.
- [ ] **Ordering:** Projects maintain dense 0-indexed sorting updated within atomic transactions.
- [ ] **Themes:** Cinema, Editorial, and Studio consume the identical `PublicPortfolioData` contract.
- [ ] **Preview:** Dashboard preview renders direct components inside `<PreviewViewport />` without iframes.
- [ ] **Moderation:** Reports store salted SHA-256 IP hashes; throttled atomically via `pg_advisory_xact_lock`.
- [ ] **Composite FK:** Reports targeting projects enforce composite integrity (`project_id, profile_id`).
- [ ] **XSS Defense:** Untrusted text rendered as plain text; zero `dangerouslySetInnerHTML`.
- [ ] **CSRF Defense:** Cookie-authenticated Route Handlers verify `Origin` / `Sec-Fetch-Site`.
- [ ] **Dual-Route Invalidation:** Username change immediately invalidates old and new paths in Next.js cache.
- [ ] **Production Purity:** Production database contains zero fake demo records; dev fixtures isolated.
- [ ] **Firewall Intact:** Zero subscriptions, custom domains, analytics, or direct video uploads implemented.

---

*This document is LOCKED as the definitive V1 behavioral, security, and application rules contract.*
