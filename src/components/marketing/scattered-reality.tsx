export function ScatteredReality() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gowider.in";

  return (
    <section className="py-24 border-t border-white/[0.08] bg-[#050505] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
            03 // THE PROBLEM
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            THE SCATTERED REALITY VS. THE ONE LINK
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
            Instagram DMs. Unlisted YouTube links. Expired Google Drive folders. WhatsApp messages. Your work shouldn&apos;t be scattered across chaotic chat threads.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: The Scattered Chaos */}
          <div className="p-8 sm:p-10 border border-red-950/40 bg-zinc-950/80 relative flex flex-col justify-between">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.06]">
              <span className="font-mono text-xs uppercase tracking-wider text-red-400">
                ✕ HOW CLIENTS USUALLY SEE YOUR WORK
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                CHAOTIC &amp; UNBRANDED
              </span>
            </div>

            {/* Chaotic Badge Cloud */}
            <div className="space-y-4 my-auto">
              <div className="p-3.5 bg-black/60 border border-red-900/30 flex items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                <span className="truncate">https://drive.google.com/drive/folders/1aBcD...</span>
                <span className="text-[10px] text-red-400 bg-red-950/50 px-2 py-0.5 border border-red-800/40 shrink-0">
                  Request Access?
                </span>
              </div>

              <div className="p-3.5 bg-black/60 border border-red-900/30 flex items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                <span className="truncate">https://youtube.com/watch?v=kY8_x90a (Draft #3)</span>
                <span className="text-[10px] text-yellow-500/80 bg-yellow-950/40 px-2 py-0.5 border border-yellow-800/30 shrink-0">
                  Unlisted / 720p
                </span>
              </div>

              <div className="p-3.5 bg-black/60 border border-red-900/30 flex items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                <span className="truncate">instagram.com/reel/Cx9_m12K/</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 border border-zinc-700 shrink-0">
                  App Login Wall
                </span>
              </div>

              <div className="p-3.5 bg-black/60 border border-red-900/30 flex items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                <span className="truncate">wetransfer.com/downloads/88219...</span>
                <span className="text-[10px] text-red-500 bg-red-950/60 px-2 py-0.5 border border-red-800/50 shrink-0">
                  Expired 2 Days Ago
                </span>
              </div>

              <div className="p-3.5 bg-black/60 border border-red-900/30 flex items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                <span className="truncate">WhatsApp: &ldquo;Check WhatsApp voice note for notes&rdquo;</span>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 shrink-0">
                  Lost in Chat
                </span>
              </div>
            </div>

            <p className="mt-8 text-xs font-mono text-zinc-400 uppercase tracking-wider text-center">
              Result: Creative directors lose patience. Gigs are lost.
            </p>
          </div>

          {/* Right: The Pristine One Link */}
          <div className="p-8 sm:p-10 border border-white/[0.2] bg-black relative flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.08]">
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400">
                ✓ THE GOWIDER PORTFOLIO
              </span>
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                ONE UNIFIED STAGE
              </span>
            </div>

            <div className="my-auto space-y-6">
              {/* Highlighted Pristine Link */}
              <div className="p-6 bg-[#0E0E0E] border border-white/[0.25] text-center shadow-inner">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 block mb-2">
                  YOUR PERSONAL PORTFOLIO DESTINATION
                </span>
                <div className="font-mono text-base sm:text-xl font-bold text-white tracking-wider truncate py-2">
                  {appUrl}/<span className="text-emerald-400">yourname</span>
                </div>
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mt-2">
                  Instant Load • 4K Native Resolution • Zero Login Wall
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#111] border border-white/[0.08] text-zinc-300">
                  <span className="text-white block font-bold mb-0.5">Zero Compression</span>
                  Streams directly from native high-res servers.
                </div>
                <div className="p-3 bg-[#111] border border-white/[0.08] text-zinc-300">
                  <span className="text-white block font-bold mb-0.5">Poster-First</span>
                  Instant initial page render without buffering lag.
                </div>
                <div className="p-3 bg-[#111] border border-white/[0.08] text-zinc-300">
                  <span className="text-white block font-bold mb-0.5">Curated Aesthetics</span>
                  Cinema, Editorial, and Studio styles.
                </div>
                <div className="p-3 bg-[#111] border border-white/[0.08] text-zinc-300">
                  <span className="text-white block font-bold mb-0.5">1-Minute Setup</span>
                  Just paste your links and hit publish.
                </div>
              </div>
            </div>

            <p className="mt-8 text-xs font-mono text-emerald-400/90 uppercase tracking-wider text-center">
              Result: Premium studio presentation that commands agency respect.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
