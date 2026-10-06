export function SupportedSources() {
  return (
    <section className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
            ZERO UPLOADS // ZERO BANDWIDTH CHARGES
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            CONNECT YOUR WORK WHERE IT ALREADY LIVES
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Never waste hours waiting for huge ProRes exports to re-upload. GoWider leverages native streaming infrastructure with zero storage fees.
          </p>
        </div>

        {/* 3 Source Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* YouTube */}
          <div className="p-8 border border-white/[0.1] bg-[#0A0A0A] hover:border-white/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-white px-2.5 py-1 bg-white/[0.06] border border-white/[0.1]">
                  YOUTUBE
                </span>
                <span className="font-mono text-[11px] text-zinc-400 uppercase">
                  16:9 &amp; 9:16 Shorts
                </span>
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white mb-3">
                Commercials &amp; Showreels
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Supports public and unlisted YouTube links. Our engine fetches maximum-resolution poster frames for instant, flicker-free presentation.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Lossless Playback</span>
              <span className="text-white">4K / 60 FPS</span>
            </div>
          </div>

          {/* Instagram */}
          <div className="p-8 border border-white/[0.1] bg-[#0A0A0A] hover:border-white/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-white px-2.5 py-1 bg-white/[0.06] border border-white/[0.1]">
                  INSTAGRAM
                </span>
                <span className="font-mono text-[11px] text-zinc-400 uppercase">
                  9:16 Reels
                </span>
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white mb-3">
                Vertical Viral Edits
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Present Instagram Reels in native vertical aspect ratio. Custom editorial cards bypass third-party cookie roadblocks and direct clients to your verified work.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Zero Scraping Bugs</span>
              <span className="text-white">100% Direct</span>
            </div>
          </div>

          {/* Google Drive */}
          <div className="p-8 border border-white/[0.1] bg-[#0A0A0A] hover:border-white/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-white px-2.5 py-1 bg-white/[0.06] border border-white/[0.1]">
                  GOOGLE DRIVE
                </span>
                <span className="font-mono text-[11px] text-zinc-400 uppercase">
                  Private Client Cuts
                </span>
              </div>
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white mb-3">
                Direct Work-in-Progress
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Embed client review previews straight from Google Drive. Includes a persistent direct fallback action bar so clients can open files effortlessly.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] uppercase tracking-wider text-zinc-400 flex items-center justify-between">
              <span>Resilient Dock</span>
              <span className="text-white">Zero Lockout</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
