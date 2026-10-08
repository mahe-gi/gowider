import React from "react";
import type { PublicSkill } from "../../../types";

interface VogueToolsProps {
  tools: PublicSkill[];
}

const ROMAN_NUMERALS = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"
];

export function VogueTools({ tools }: VogueToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="vogue-tools"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#EFE3C3]">
          [ TECHNICAL MASTERY &amp; SUITE ]
        </h2>
        <span className="font-serif italic text-xs text-stone-400">
          Editorial Craftsmanship
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="p-5 bg-stone-950/60 border border-white/[0.08] hover:border-[#EFE3C3]/60 transition-all flex flex-col justify-between min-h-[95px]"
          >
            <span className="font-serif italic text-xs text-[#EFE3C3]/80">
              {ROMAN_NUMERALS[idx] || `${idx + 1}.`}
            </span>
            <span className="font-sans text-xs sm:text-sm font-medium tracking-wide text-stone-200 truncate mt-3">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
