# Indic Creator Repurposer — Product & Frontend Implementation Brief

## 1. Core Creative Concept & Visual Metaphor
> **One piece of content expanding into many languages.**

- **Target Quality Bar:** High-end Awwwards / CSS Design Awards / FWA caliber editorial creator tool.
- **Tone:** Cinematic, editorial, creator-focused, modern, precise, confident, minimal, playful in small doses.
- **Anti-Patterns to Avoid:**
  - Generic purple-gradient AI SaaS templates
  - Default/un-themed shadcn demos
  - Dashboard-first B2B layouts
  - Excessive Three.js or heavy 3D gimmicks
  - Fake social proof (no fake testimonials, fake creator counts, fake logos)
  - Fake percentages (e.g. "47%") — use phase-based progress only

---

## 2. Design System & Tokens

### Color Palette (CSS Variables)
- **Background / Canvas:** Warm ivory / paper (`var(--bg-canvas)`)
- **Primary Typography:** Deep near-black (`var(--text-primary)`)
- **Secondary Typography:** Muted charcoal / warm gray (`var(--text-secondary)`)
- **Primary Accent:** Warm vermilion / coral / orange-red (`var(--accent-coral)`)
- **Surfaces & Cards:** Slightly lighter/darker warm neutral tones (`var(--surface-card)`)
- **Borders:** Subtle warm translucent borders (`var(--border-subtle)`)

### Typography (`next/font`)
- **Display Serif:** `Instrument Serif` (editorial display headlines, italic accents)
- **Primary Grotesk / Body:** `Geist Sans` (clean, modern interface & body text)
- **Technical / Metadata:** `Geist Mono` (timestamps, language tags, codes)

### Motion Vocabulary
- **Micro-interactions:** `150–250ms` (buttons, chips, hover, focus)
- **UI Transitions:** `300–500ms` (cards, selectors, results, error reveals)
- **Storytelling / Hero:** `700–1200ms` (scroll-linked transformations, hero Reel expansion)
- **Easing:** Smooth cubic bezier curves (e.g., `cubic-bezier(0.16, 1, 0.3, 1)`), no linear mechanical motion.
- **Accessibility:** Full `prefers-reduced-motion` support.

---

## 3. Landing Page Composition (`app/page.tsx`)

1. **Navigation:** Minimal, transparent at top, compact sticky on scroll (`[Brand]`, `How it works`, `Languages`, `[Localize a Reel →]`).
2. **Hero:**
   - Headline: *One reel. Every audience.* (or *One video. Many languages.*)
   - Supporting copy: *Turn your Reel into Hindi, Tamil, Telugu, Kannada and more — without recording it again.*
   - Interactive 9:16 Reel expansion animation (Original Reel → Hindi, Tamil, Kannada variants with native scripts).
   - Primary CTA: `Localize a Reel →` (scrolls to uploader).
   - Limitations badge: `MP4 / MOV · up to 90 sec · up to 3 languages`.
3. **Product Transformation Section:**
   - Headline: *Made once. Understood everywhere.*
   - Scroll-linked visual demonstration of one video splitting into synchronized localized streams.
4. **Live Product / Upload Experience (`#upload`):**
   - Headline: *Your turn.*
   - Subtext: *Drop a Reel and choose who gets to understand it.*
   - Drag-and-drop zone with real-time upload progress, format validation (MP4/MOV, ≤100MB), and browser-side video duration validation (≤90 seconds).
   - Seamless inline transition to Language Selector upon upload completion.
5. **Language Selector:**
   - Source language selector (defaulting or dropdown).
   - Target languages selectable via interactive chips (max 3, counter `x/3 selected`, source excluded).
   - Dynamic contextual CTA: `Generate 3 versions →` / `Generate Hindi version →`.
6. **How It Works:**
   - Editorial sequence: `01 DROP IT` → `02 CHOOSE` → `03 GO WIDER`.
7. **Voice / Identity Feature:**
   - Headline: *Still sounds like you.*
   - Emotional value: *Localize the message without turning the creator into a generic voice-over.* Visual multi-track audio waveform demonstration.
8. **Language Universe:**
   - Typography-led strip with native scripts (`हिन्दी`, `తెలుగు`, `தமிழ்`, `ಕನ್ನಡ`, `മലയാളം`, `বাংলা`, `ગુજરાતી`, `मराठी`, `ਪੰਜਾਬੀ`, `ଓଡ଼ିଆ`, `অসমীয়া`, `English`).
9. **Output Showcase:**
   - Preview cards demonstrating what the creator receives (Video preview, MP4 download, SRT download).
10. **Final CTA & Minimal Footer:**
    - Headline: *Your next audience already speaks another language.*
    - `Localize your first Reel →`

---

## 4. Processing & Results Page (`/project/[id]`)

### Visual Continuity
- Maintains the cinematic editorial styling; not a raw developer dashboard.
- Displays original Reel thumbnail alongside active localization nodes.

### Human-Friendly State Mapping
- `uploaded` → *Ready to start*
- `uploading_to_sarvam` → *Preparing your Reel*
- `processing` → *Localizing your Reel*
- `exporting` → *Preparing your downloads*
- `completed` → *Ready*
- `partial_failure` → *Partially completed*
- `failed` → *Generation failed*

### Results Experience
- Headline: *Ready to go wider.*
- Responsive grid/carousel of localized Reel cards:
  - Inline HTML5 `<video>` preview player with custom accessible controls.
  - Primary button: `Download video` (MP4).
  - Secondary button: `Download subtitles` (SRT).
- **Partial Failure & Targeted Retry:**
  - Failed languages show specific error message with a dedicated `[Retry Language]` button.
  - Calls `POST /api/projects/:id/retry` with `{ targetLanguages: [failedLang] }` to retry only the failed language without re-spending credits on successful ones.

### Resilience & Offline Recovery
- Non-blocking offline banner: *You're offline. Your localization continues in the background.*
- Automatic re-polling and state recovery on reconnection.
- Full page refresh persistence via PostgreSQL state.
- Dynamic refresh of Sarvam temporary signed export URLs.

---

## 5. Private Preview Protection
- Minimal access gate for `POC_ACCESS_KEY`: Clean single-field preview dialog if key is missing or invalid.
