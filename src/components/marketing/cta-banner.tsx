import Link from "next/link";

export function CtaBanner() {
  return (
    <section className="py-24 md:py-32 border-t border-white/[0.08] relative overflow-hidden bg-black text-center">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-white/[0.03] blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-6">
          GET STARTED IN MINUTES
        </span>

        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-[0.95] max-w-3xl mx-auto">
          YOUR NEXT CLIENT SHOULD SEE YOUR BEST WORK.
        </h2>

        <p className="mt-6 text-sm sm:text-base text-zinc-400 font-sans max-w-xl mx-auto leading-relaxed">
          Stop pitching creative directors with scattered links and expired drive folders. Publish a broadcast-grade portfolio today.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signin"
            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors focus-visible:outline-none"
          >
            CREATE YOUR PORTFOLIO
          </Link>
          <Link
            href="/about"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-5 border border-white/[0.15] text-zinc-300 font-sans text-xs uppercase tracking-[0.16em] font-medium hover:border-white/50 hover:text-white transition-colors focus-visible:outline-none"
          >
            READ OUR MANIFESTO ↗
          </Link>
        </div>

        {/* Product Hunt Badge */}
        <div className="mt-10 flex justify-center">
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

        <div className="mt-10 flex items-center justify-center gap-6 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
          <span>Google Sign In</span>
          <span>•</span>
          <span>Free Starter Tier</span>
          <span>•</span>
          <span>Zero Video Uploads</span>
        </div>
      </div>
    </section>
  );
}
