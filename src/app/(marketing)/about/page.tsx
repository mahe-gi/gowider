import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About & Manifesto — GoWider",
  description: "Creators should spend time making work, not building websites. Read our manifesto.",
};

export default function AboutPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Badge & Title */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/[0.1] bg-white/[0.03]">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              MANIFESTO // V1.0
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[1.0]">
            CREATORS SHOULD SPEND TIME MAKING WORK, NOT BUILDING WEBSITES.
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-zinc-400 font-sans leading-relaxed max-w-2xl mx-auto">
            Video editing is one of the most demanding creative disciplines on earth. Your portfolio shouldn&apos;t feel like a side job in web development.
          </p>
        </div>

        {/* Longform Editorial Essay */}
        <div className="space-y-12 text-zinc-300 font-sans text-sm sm:text-base leading-relaxed border-t border-white/[0.08] pt-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block">
              01 // THE PROBLEM WITH MODERN PORTFOLIO TOOLS
            </span>
            <h2 className="font-display text-2xl font-bold uppercase text-white tracking-tight">
              Generic Builders Were Built for Text, Not Moving Images
            </h2>
            <p className="text-zinc-400">
              When video editors try to present their work online, they are faced with an absurd dilemma. On one hand, site builders like Wix, Squarespace, and WordPress force them into fiddly drag-and-drop editors, generic templates, and broken mobile viewports. On the other hand, platforms like Linktree and Notion reduce years of cinematic craft to a list of blue hyperlinks.
            </p>
            <p className="text-zinc-400">
              Meanwhile, clients and creative directors don&apos;t have time to wade through disorganized Google Drive folders, authenticate past Instagram login walls, or watch choppy video embeds loaded with competitor ads.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-white/[0.06] pt-10">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block">
              02 // THE ARCHITECTURAL INSIGHT
            </span>
            <h2 className="font-display text-2xl font-bold uppercase text-white tracking-tight">
              Video Hosting Is Solved. Presentation Was Broken.
            </h2>
            <p className="text-zinc-400">
              YouTube and Google Drive have built the world&apos;s most resilient global video delivery networks. Instagram has mastered vertical reel engagement. Google Drive holds millions of work-in-progress director cuts.
            </p>
            <p className="text-zinc-400">
              Building yet another platform to re-upload, transcode, and compress ProRes binaries was the wrong goal. Instead, GoWider focuses 100% of its engineering on <span className="text-white font-medium">broadcast-grade presentation</span>:
            </p>
            <div className="p-6 border border-white/[0.1] bg-[#0A0A0A] font-mono text-xs sm:text-sm text-white/90 space-y-2">
              <p>Creator&apos;s native edits (YouTube / Instagram / Google Drive)</p>
              <p className="text-zinc-500 pl-4">↓ Zero transcoding lag or lossy compression</p>
              <p>GoWider Presentation Engine (Poster-first streaming &amp; Awwwards-grade typography)</p>
              <p className="text-zinc-500 pl-4">↓ Instantaneous global delivery</p>
              <p className="text-emerald-400 font-bold">gowider.in/yourname</p>
            </div>
          </section>

          {/* Section 3: The Three Principles */}
          <section className="space-y-6 border-t border-white/[0.06] pt-10">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block">
              03 // OUR CORE PRINCIPLES
            </span>
            <h2 className="font-display text-2xl font-bold uppercase text-white tracking-tight">
              Three Non-Negotiable Invariants
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 border border-white/[0.08] bg-[#0A0A0A]">
                <span className="font-mono text-xs text-white uppercase tracking-widest block mb-2">
                  1. Respect the Frame
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Zero distracting player junk, zero watermarks, zero pixel-stretching. Every aspect ratio (16:9 widescreen or 9:16 vertical) is honored with absolute geometric precision.
                </p>
              </div>

              <div className="p-6 border border-white/[0.08] bg-[#0A0A0A]">
                <span className="font-mono text-xs text-white uppercase tracking-widest block mb-2">
                  2. Speed Above All
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Poster-first image loading ensures your portfolio shell paints in milliseconds. Creative directors never stare at blank loading spinners while browsing your reels.
                </p>
              </div>

              <div className="p-6 border border-white/[0.08] bg-[#0A0A0A]">
                <span className="font-mono text-xs text-white uppercase tracking-widest block mb-2">
                  3. Pure Studio Craft
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We don&apos;t offer 500 gimmicky templates. We offer three calibrated aesthetics—Cinema, Editorial, and Studio—each crafted to command the respect of top agencies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: What Lies Ahead */}
          <section className="space-y-4 border-t border-white/[0.06] pt-10">
            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 block">
              04 // THE HORIZON
            </span>
            <h2 className="font-display text-2xl font-bold uppercase text-white tracking-tight">
              Starting with Editors. Expanding to Visual Storytellers.
            </h2>
            <p className="text-zinc-400">
              GoWider is launching with a laser focus on commercial, narrative, and social video editors. As our community grows, our presentation engine will expand to motion designers, 3D visualizers, animators, and creative post-production studios.
            </p>
            <p className="text-zinc-400">
              Our promise remains simple: Bring your work. We create the presentation.
            </p>
          </section>
        </div>

        {/* Closing CTA */}
        <div className="mt-20 p-10 border border-white/[0.15] bg-black text-center relative">
          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
            START BUILDING YOUR PORTFOLIO NOW
          </h3>
          <p className="mt-3 text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto">
            Free at launch. Set up your public presence in less than 2 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signin"
              className="w-full sm:w-auto px-8 py-4 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors"
            >
              CREATE YOUR PORTFOLIO
            </Link>
            <Link
              href="/#demo"
              className="w-full sm:w-auto px-8 py-4 border border-white/[0.15] text-zinc-300 font-sans text-xs uppercase tracking-[0.16em] font-medium hover:border-white/50 hover:text-white transition-colors"
            >
              EXPLORE THE SHOWCASE ↓
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
