import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — GoWider",
  description: "Transparent ₹0 launch pricing for video editors and creative directors.",
};

const LAUNCH_FEATURES = [
  {
    title: "Unlimited Project Works",
    desc: "Showcase as many commercials, reels, and film projects as you need. No artificial project caps.",
  },
  {
    title: "All 3 Signature Themes",
    desc: "Switch between Cinema (OLED pitch-black), Editorial (Swiss typography), and Studio (technical grid) anytime.",
  },
  {
    title: "Personal Portfolio URL",
    desc: "Claim your unique, professional creator handle: gowider.in/yourname.",
  },
  {
    title: "YouTube, Instagram & Google Drive",
    desc: "Native embed support for 16:9 widescreen, 9:16 vertical reels, and private Drive client review streams.",
  },
  {
    title: "Poster-First Caching Engine",
    desc: "High-resolution posters load instantaneously on initial view with zero buffer lag or slow iframe chains.",
  },
  {
    title: "Zero Video Re-Compression",
    desc: "Your work streams directly from the source host in pristine original quality up to 4K / 60 FPS.",
  },
  {
    title: "Zero Ads or Watermarks",
    desc: "Your portfolio is your professional brand. We never place ads, promotional popups, or intrusive branding on your work.",
  },
  {
    title: "Mobile & 4K Responsive Design",
    desc: "Every portfolio looks flawless whether viewed by a director on an iPhone or an agency executive on a Pro Display XDR.",
  },
  {
    title: "Draft Preview Mode",
    desc: "Test new projects, reorder works, and review layout tweaks privately before publishing live updates.",
  },
];

const PRICING_FAQS = [
  {
    q: "Why is GoWider free at launch?",
    a: "Unlike traditional portfolio tools that host and transcode petabytes of video binaries, GoWider connects directly to your existing media hosts (YouTube, Instagram, Google Drive). This allows us to keep our server costs tiny and pass that efficiency directly to creators.",
  },
  {
    q: "Will you suddenly start charging me for my existing portfolio?",
    a: "No. If you claim your handle and launch your portfolio during the public launch phase, your core V1 portfolio features and claimed username remain yours with zero surprise lockouts.",
  },
  {
    q: "Are there any hidden fees or transaction charges?",
    a: "None. GoWider has zero setup fees, zero credit card requirements, and zero hosting surcharges.",
  },
  {
    q: "Can I use GoWider for commercial freelance client pitches?",
    a: "Yes. GoWider is built specifically for commercial video editors, documentary filmmakers, colorists, and post-production studios to pitch agencies and high-ticket clients.",
  },
  {
    q: "What happens if a video link changes or is removed from YouTube?",
    a: "You can update or replace the source URL directly from your creator dashboard at any time. When you update a project link, your public portfolio revalidates instantly.",
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/[0.1] bg-white/[0.03]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              TRANSPARENT LAUNCH PRICING
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-tight">
            NO HIDDEN TIERS. FREE AT LAUNCH.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
            Everything you need to launch a broadcast-grade portfolio. No credit card required. No artificial limits on your work.
          </p>
        </div>

        {/* The Free Launch Tier Card */}
        <div className="max-w-3xl mx-auto border-2 border-white bg-black p-8 sm:p-14 relative shadow-2xl mb-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-white/[0.12] gap-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                LIFETIME LAUNCH ACCESS
              </span>
              <h2 className="font-display text-3xl font-bold uppercase text-white">
                Creator Plan
              </h2>
            </div>
            <div className="sm:text-right">
              <div className="flex items-baseline sm:justify-end gap-2">
                <span className="font-display text-6xl font-black text-white">
                  ₹0
                </span>
                <span className="font-mono text-xs text-zinc-400 uppercase">
                  / forever during launch
                </span>
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 block mt-1">
                ● 100% Free • No Payment Method Needed
              </span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LAUNCH_FEATURES.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="font-mono text-xs text-emerald-400 font-bold shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-sans font-bold text-white uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-xs font-sans text-zinc-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Dock */}
          <div className="pt-8 border-t border-white/[0.12] flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link
              href="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors"
            >
              CREATE YOUR FREE PORTFOLIO
            </Link>
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
              One-click Google Sign-in
            </span>
          </div>
        </div>

        {/* Pricing FAQs Section */}
        <div className="max-w-3xl mx-auto pt-16 border-t border-white/[0.08]">
          <div className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-2">
              FREQUENTLY ASKED
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">
              PRICING &amp; SUSTAINABILITY QUESTIONS
            </h2>
          </div>

          <div className="space-y-6">
            {PRICING_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 border border-white/[0.08] bg-[#0A0A0A]"
              >
                <h3 className="font-display text-base font-bold uppercase text-white tracking-tight mb-2">
                  {faq.q}
                </h3>
                <p className="text-xs sm:text-sm font-sans text-zinc-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final Bottom Banner */}
        <div className="mt-24 text-center p-12 border border-white/[0.1] bg-[#0A0A0A] max-w-4xl mx-auto">
          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
            READY TO SHOWCASE YOUR EDITING WORK?
          </h3>
          <p className="mt-3 text-sm text-zinc-400 font-sans max-w-md mx-auto">
            Claim your handle today while premium names are still available.
          </p>
          <div className="mt-6">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors"
            >
              GET STARTED NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
