import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — GoWider",
  description:
    "Transparent pricing for video editors, directors, and commercial filmmakers. Free starter tier and GoWider Pro with unlimited works.",
};

const COMPARISON_ROWS = [
  {
    feature: "Published Projects",
    free: "Up to 6 projects",
    pro: "Unlimited projects",
  },
  {
    feature: "Core Themes (Cinema, Editorial, Studio)",
    free: "Included",
    pro: "Included",
  },
  {
    feature: "Pro Themes: Noir & Vogue",
    free: "—",
    pro: "Included",
  },
  {
    feature: "Pro Themes: Atelier & Cyber",
    free: "—",
    pro: "Included",
  },
  {
    feature: "Hero Showreel Spotlight",
    free: "—",
    pro: "Included",
  },
  {
    feature: "Direct Client Booking CTA (Calendly/WhatsApp)",
    free: "—",
    pro: "Included",
  },
  {
    feature: "Watermark Removal (White-Label)",
    free: "GoWider badge",
    pro: "100% White-Label",
  },
  {
    feature: "Lossless 4K / 60 FPS Engine",
    free: "Included",
    pro: "Included",
  },
  {
    feature: "Supported Video Hosts",
    free: "YouTube, IG, Drive",
    pro: "YouTube, IG, Drive",
  },
  {
    feature: "Personal URL (gowider.in/yourname)",
    free: "Included",
    pro: "Included",
  },
  {
    feature: "Pro Verified Creator Badge",
    free: "—",
    pro: "Included",
  },
  {
    feature: "Priority Directorial Support",
    free: "Standard",
    pro: "Priority",
  },
];

const PRICING_FAQS = [
  {
    q: "What is the difference between Free and GoWider Pro?",
    a: "The Free plan gives you everything needed to launch: up to 6 published projects, 3 core themes (Cinema, Editorial, Studio), and your personal handle. GoWider Pro unlocks unlimited published works, the 2 Pro-exclusive themes (Noir and Vogue), and the ability to remove the GoWider watermark for a 100% white-label portfolio.",
  },
  {
    q: "How does payment processing work?",
    a: "We process payments securely through Razorpay. You can pay via UPI (Google Pay, PhonePe, Paytm), Credit / Debit Cards, or Net Banking. Subscriptions activate instantly upon successful authorization.",
  },
  {
    q: "Can I cancel my Pro subscription at any time?",
    a: "Yes. You can cancel your subscription with a single click from your creator dashboard at /dashboard/billing. Your Pro benefits remain active until the end of your current billing period.",
  },
  {
    q: "What happens to my published projects if I downgrade?",
    a: "If you downgrade to Free, your existing works remain intact in your dashboard as drafts. You can keep up to 6 projects published at any time on the Free tier.",
  },
  {
    q: "Does GoWider degrade or compress my original video files?",
    a: "Never. GoWider connects directly to your existing media hosts (YouTube, Instagram, Google Drive). Your work streams in native master resolution up to 4K at 60 FPS without compression artifacts.",
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-white/[0.1] bg-white/[0.03]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              TRANSPARENT CREATOR PRICING
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-tight">
            ENGINEERED FOR AUTEURS.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 font-sans leading-relaxed">
            Start free with up to 6 projects. Upgrade to GoWider Pro for unlimited reels, exclusive directorial themes, and complete white-label branding.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-24">
          {/* Free Tier */}
          <div className="border border-white/[0.1] bg-black p-8 sm:p-12 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between pb-8 border-b border-white/[0.08]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                    STARTER EDITION
                  </span>
                  <h2 className="font-display text-3xl font-bold uppercase text-white">
                    Free Plan
                  </h2>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display text-5xl font-black text-white">
                      ₹0
                    </span>
                    <span className="font-mono text-xs text-zinc-400">/ forever</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mt-1">
                    No card required
                  </span>
                </div>
              </div>

              <div className="py-8 space-y-4 font-sans text-sm text-zinc-300">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold">✓</span>
                  <span>Up to 6 published video works</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold">✓</span>
                  <span>3 core themes: Cinema, Editorial &amp; Studio</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold">✓</span>
                  <span>Personal URL: gowider.in/yourname</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold">✓</span>
                  <span>Poster-first zero-lag media streaming</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-emerald-400 font-bold">✓</span>
                  <span>YouTube, Instagram &amp; Drive embeds</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-500">
                  <span className="font-mono text-xs">ℹ</span>
                  <span>GoWider watermark on public footer</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08]">
              <Link
                href="/signin"
                className="w-full inline-flex items-center justify-center px-8 py-4 border border-white/20 bg-zinc-950 text-white font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-900 transition-colors"
              >
                START FREE TODAY
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-amber-400/80 bg-[#070707] p-8 sm:p-12 flex flex-col justify-between relative shadow-2xl">
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-0.5 text-[10px] font-mono font-black uppercase tracking-widest rounded shadow">
              RECOMMENDED // PRO
            </div>

            <div>
              <div className="flex items-center justify-between pb-8 border-b border-white/[0.08]">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 block mb-1">
                    AUTEUR &amp; STUDIO
                  </span>
                  <h2 className="font-display text-3xl font-bold uppercase text-white">
                    GoWider Pro
                  </h2>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display text-5xl font-black text-amber-300">
                      ₹299
                    </span>
                    <span className="font-mono text-xs text-zinc-400">/ month</span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400/80 uppercase block mt-1">
                    or ₹3,229/yr (Save 10%)
                  </span>
                </div>
              </div>

              <div className="py-8 space-y-4 font-sans text-sm text-zinc-200">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span className="font-semibold text-white">Unlimited published projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span>4 Pro Themes: Noir, Vogue, Atelier &amp; Cyber</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span>Hero Showreel Spotlight (pin signature mastercut)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span>Direct Client Booking &amp; Inquiry CTA (Calendly/WhatsApp)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span>100% White-Label: Hide GoWider Watermark</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span>Verified Pro Creator badge on profile</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-400 font-bold">★</span>
                  <span>Instant Razorpay activation (Cards, UPI, Net Banking)</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08]">
              <Link
                href="/signin"
                className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:brightness-110 transition-all shadow-lg"
              >
                UPGRADE TO GOWIDER PRO
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
              DETAILED PLAN COMPARISON
            </h2>
          </div>

          <div className="overflow-hidden border border-white/[0.1] bg-black">
            <table className="w-full text-left font-sans text-xs sm:text-sm">
              <thead className="border-b border-white/[0.1] bg-zinc-950 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="p-4 sm:p-5">Feature</th>
                  <th className="p-4 sm:p-5 w-32 sm:w-48 text-center">Free</th>
                  <th className="p-4 sm:p-5 w-32 sm:w-48 text-center text-amber-300">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 sm:p-5 font-medium text-white">{row.feature}</td>
                    <td className="p-4 sm:p-5 text-center text-zinc-400 font-mono text-xs">{row.free}</td>
                    <td className="p-4 sm:p-5 text-center font-bold text-amber-300 font-mono text-xs">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQs Section */}
        <div className="max-w-3xl mx-auto pt-16 border-t border-white/[0.08]">
          <div className="text-center mb-12">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-2">
              FREQUENTLY ASKED
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight text-white">
              PRICING &amp; BILLING QUESTIONS
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

        {/* Final CTA Banner */}
        <div className="mt-24 text-center p-12 border border-white/[0.1] bg-[#0A0A0A] max-w-4xl mx-auto">
          <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white">
            READY TO SHOWCASE YOUR WORK?
          </h3>
          <p className="mt-3 text-sm text-zinc-400 font-sans max-w-md mx-auto">
            Claim your handle today and launch your broadcast-grade portfolio.
          </p>
          <div className="mt-6">
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-200 transition-colors"
            >
              CREATE YOUR PORTFOLIO NOW
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
