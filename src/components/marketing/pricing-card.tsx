"use client";

import React, { useState } from "react";
import Link from "next/link";

export function PricingCard() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const isYearly = billingPeriod === "yearly";

  const freeFeatures = [
    "Up to 6 published video projects",
    "3 core themes (Cinema, Editorial, Studio)",
    "Personal portfolio URL (gowider.in/yourname)",
    "Poster-first streaming engine with zero lag",
    "Lossless 4K / 60 FPS playback (YouTube, Instagram, Drive)",
    "GoWider footer watermark badge",
  ];

  const proFeatures = [
    "Unlimited published projects (no cap)",
    "All 5 signature themes (including Noir & Vogue)",
    "100% White-Label: Remove GoWider watermark",
    "Noir (2.39:1 Anamorphic Scope) director layout",
    "Vogue (High-Fashion Lookbook) luxury layout",
    "Pro creator badge on public profile",
    "Instant Razorpay payment activation",
    "Priority streaming & future Pro features",
  ];

  return (
    <section id="pricing" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
            07 // PLANS &amp; PRICING
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            TRANSPARENT CREATOR PRICING
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Start free with up to 6 published works. Upgrade to GoWider Pro for unlimited reels, exclusive directorial themes, and complete white-label branding.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center rounded-full border border-white/[0.1] bg-zinc-950 p-1">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`rounded-full px-5 py-1.5 text-xs font-mono uppercase tracking-wider transition ${
                !isYearly ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("yearly")}
              className={`rounded-full px-5 py-1.5 text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5 ${
                isYearly ? "bg-white text-black font-bold" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Yearly</span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.2 text-[9px] text-amber-300 font-bold">
                SAVE 10%
              </span>
            </button>
          </div>
        </div>

        {/* Two-Column Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier Card */}
          <div className="border border-white/[0.1] bg-black p-8 sm:p-10 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 block mb-1">
                    STARTER
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase text-white">
                    Free Plan
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display text-4xl sm:text-5xl font-black text-white">
                      ₹0
                    </span>
                    <span className="font-mono text-xs text-zinc-400">/ forever</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 uppercase block mt-1">
                    No card required
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="py-8 space-y-3.5">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 block mb-4">
                  What is included:
                </span>
                {freeFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-zinc-400 font-bold shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs sm:text-sm font-sans text-zinc-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08]">
              <Link
                href="/signin"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 border border-white/[0.2] bg-zinc-950 text-white font-sans text-xs uppercase tracking-[0.16em] font-bold hover:bg-zinc-900 transition-colors"
              >
                START FOR FREE
              </Link>
            </div>
          </div>

          {/* Pro Tier Card */}
          <div className="border-2 border-amber-400/80 bg-[#070707] p-8 sm:p-10 flex flex-col justify-between relative shadow-2xl">
            {/* Pro Ribbon */}
            <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-amber-500 to-orange-500 text-black px-3 py-0.5 text-[10px] font-mono font-black uppercase tracking-widest rounded shadow">
              POPULAR // PRO CREATOR
            </div>

            <div>
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300 block mb-1">
                    AUTEUR &amp; STUDIO
                  </span>
                  <h3 className="font-display text-2xl font-bold uppercase text-white flex items-center gap-2">
                    GoWider Pro
                  </h3>
                </div>
                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="font-display text-4xl sm:text-5xl font-black text-amber-300">
                      ₹{isYearly ? "3,229" : "299"}
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      /{isYearly ? "yr" : "mo"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-amber-400/80 uppercase block mt-1">
                    {isYearly ? "Billed annually (Save 10% — ₹359 off)" : "Billed monthly via Razorpay"}
                  </span>
                </div>
              </div>

              {/* Checklist */}
              <div className="py-8 space-y-3.5">
                <span className="font-mono text-xs uppercase tracking-wider text-amber-300/80 block mb-4">
                  Everything in Free, plus:
                </span>
                {proFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-amber-400 font-bold shrink-0 mt-0.5">
                      ★
                    </span>
                    <span className="text-xs sm:text-sm font-sans text-zinc-200">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08]">
              <Link
                href="/signin"
                className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-sans text-xs uppercase tracking-[0.16em] font-bold hover:brightness-110 transition-all shadow-lg"
              >
                UPGRADE TO GOWIDER PRO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
