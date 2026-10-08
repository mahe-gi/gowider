import Link from "next/link";

export function Hero() {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Background Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Monospace Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-white/[0.1] bg-white/[0.03]">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
            01 // PORTFOLIO PLATFORM FOR VIDEO EDITORS
          </span>
        </div>

        {/* Oversized Syne Headline */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.92] max-w-5xl mx-auto">
          YOUR WORK.
          <br />
          YOUR STORY.
          <br />
          ONE LINK.
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-base sm:text-lg md:text-xl font-sans text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Turn your YouTube, Instagram, and Drive edits into a premium editorial portfolio. No coding required.
        </p>

        {/* Dual CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors focus-visible:outline-none"
          >
            CREATE YOUR PORTFOLIO
          </Link>
          <Link
            href="/#demo"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-white/[0.15] text-zinc-300 font-sans text-xs uppercase tracking-[0.16em] font-medium hover:border-white/50 hover:text-white transition-colors focus-visible:outline-none"
          >
            EXPLORE CREATORS ↓
          </Link>
        </div>

        {/* Product Hunt Featured Badge */}
        <div className="mt-8 flex justify-center">
          <a
            href="https://www.producthunt.com/products/gowider-broadcast?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-gowider-broadcast"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block transition-transform hover:scale-105"
          >
            <img
              alt="GoWider — Broadcast - The editorial portfolio platform | Product Hunt"
              width={190}
              height={41}
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1273329&theme=light&t=1791432575187"
              className="w-[190px] h-[41px]"
            />
          </a>
        </div>

        {/* Micro-Features Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              01 CLICK
            </span>
            <span className="font-mono text-[11px] text-zinc-400 uppercase mt-1">
              Google Sign-In
            </span>
          </div>
          <div className="flex flex-col items-center sm:border-x sm:border-white/[0.06]">
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              POSTER-FIRST
            </span>
            <span className="font-mono text-[11px] text-zinc-400 uppercase mt-1">
              Zero Initial Iframes
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400">
              ₹0 FREE
            </span>
            <span className="font-mono text-[11px] text-zinc-400 uppercase mt-1">
              Starter Plan Forever
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
