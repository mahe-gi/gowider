"use client";

import { useState } from "react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "How does GoWider display my video edits without video hosting?",
    a: "GoWider hosts zero video file binaries. Instead, you paste links from YouTube, Instagram Reels, or Google Drive. We parse and validate these URLs, caching high-resolution preview posters and streaming directly from native sources. This guarantees your work streams in lossless 4K native quality with zero bandwidth buffering lag or extra compression.",
  },
  {
    q: "Can I claim a custom username for my portfolio URL?",
    a: "Yes! When you sign in with Google, you immediately claim an available username (e.g. gowider.in/yourname). Once claimed, your portfolio is served directly from this clean, memorable personal URL that you can share with creative directors, agencies, and in your social bios.",
  },
  {
    q: "Is GoWider genuinely free to use at launch?",
    a: "Yes, 100% free at launch (₹0). Every creator who signs up during our public launch gets full access to all features, all 3 aesthetic themes, unlimited project links, and zero advertisements without ever needing a credit card.",
  },
  {
    q: "Can I upload raw video files (.mp4 or .mov) directly from my computer?",
    a: "In V1, GoWider deliberately does not accept raw video file binary uploads. Storing and transcoding massive video files requires expensive server infrastructure and forces lossy compression. By linking to your existing YouTube, Instagram, and Drive files, your work always looks pristine and the platform remains free.",
  },
  {
    q: "Can I switch themes or customize my layout after publishing?",
    a: "Yes. You can switch between Cinema, Editorial, and Studio styles with a single click in your dashboard. You can also reorder your projects, update thumbnails, edit descriptions, and preview live draft changes before pushing updates.",
  },
  {
    q: "How does my portfolio look to clients on mobile devices?",
    a: "Every theme is engineered mobile-first with responsive viewport clamps. Instagram Reels render in true vertical 9:16 aspect ratio, while commercials display in cinematic 16:9 containers. There are zero broken layouts or awkward player controls.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-3">
            08 // FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
            EVERYTHING YOU NEED TO KNOW
          </h2>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Straightforward answers about our video architecture, portfolio handles, and launch tier.
          </p>
        </div>

        {/* 6 Accordion Items */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FAQS.map((item, idx) => {
            const isOpen = openIdx === idx;
            const contentId = `faq-content-${idx}`;
            const headerId = `faq-header-${idx}`;

            return (
              <div key={idx} className="transition-colors">
                <h3>
                  <button
                    id={headerId}
                    type="button"
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    className="w-full py-6 px-2 flex items-center justify-between text-left gap-6 group focus-visible:outline-none"
                  >
                    <span className="font-display text-base sm:text-lg font-bold uppercase tracking-tight text-zinc-200 group-hover:text-white transition-colors">
                      {item.q}
                    </span>
                    <span className="h-7 w-7 rounded-none border border-white/20 flex items-center justify-center text-zinc-400 group-hover:border-white group-hover:text-white transition-colors shrink-0 font-mono text-xs">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="pb-6 px-2 text-xs sm:text-sm font-sans leading-relaxed text-zinc-400 animate-in fade-in duration-200"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
