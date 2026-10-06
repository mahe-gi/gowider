import Link from "next/link";

export function PricingCard() {
  const features = [
    "Unlimited video project links (YouTube, Instagram, Google Drive)",
    "All 3 signature themes (Cinema, Editorial, and Studio)",
    "Personal portfolio URL (gowider.in/yourname)",
    "Poster-first streaming engine with zero initial lag",
    "Lossless native resolution playback (4K / 60 FPS)",
    "Clean responsive layouts on desktop, tablet, and mobile",
    "Zero video compression or watermark overlays",
    "Zero monthly hosting fees or bandwidth caps",
    "Interactive draft preview before publication",
  ];

  return (
    <section id="pricing" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
            07 // LAUNCH PRICING
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            TRANSPARENT. NO GIMMICKS. FREE AT LAUNCH.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Because GoWider connects directly to your existing media hosts instead of storing multi-terabyte raw video files, we don&apos;t carry expensive storage overhead. That freedom belongs to you.
          </p>
        </div>

        {/* Single Launch Card */}
        <div className="max-w-2xl mx-auto border-2 border-white bg-black p-8 sm:p-12 relative shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/[0.1] gap-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                PUBLIC LAUNCH EDITION
              </span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold uppercase text-white">
                Creator Plan
              </h3>
            </div>
            <div className="sm:text-right">
              <div className="flex items-baseline sm:justify-end gap-1">
                <span className="font-display text-5xl sm:text-6xl font-black text-white">
                  ₹0
                </span>
                <span className="font-mono text-xs text-zinc-400 uppercase">
                  / forever during launch
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400 block mt-1">
                ● 100% Free • No Credit Card Required
              </span>
            </div>
          </div>

          {/* Features Checklist */}
          <div className="py-8 space-y-3.5">
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block mb-4">
              Everything Included in V1:
            </span>
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="font-mono text-xs text-emerald-400 font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-xs sm:text-sm font-sans text-zinc-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div className="pt-8 border-t border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors focus-visible:outline-none"
            >
              CREATE YOUR FREE PORTFOLIO
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 text-center">
              Takes less than 2 minutes to publish
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
