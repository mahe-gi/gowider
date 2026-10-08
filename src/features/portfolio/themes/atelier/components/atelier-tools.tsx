import React from "react";
import type { PublicSkill } from "../../../types";

interface AtelierToolsProps {
  tools: PublicSkill[];
}

export function AtelierTools({ tools }: AtelierToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="atelier-tools"
      className="py-16 sm:py-24 border-b border-[#292524]/80"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-[#292524]/80 pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#D6D3CD]">
          [ ATELIER // INSTRUMENTS &amp; DISCIPLINES ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-[#A8A29E]">
          EXHIBITION TOOLS
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="p-5 bg-[#141210] border border-[#292524] hover:border-[#D6D3CD]/50 transition-colors flex flex-col justify-between min-h-[95px]"
          >
            <span className="font-mono text-[10px] text-[#A8A29E] tracking-widest">
              [CAT. {String(idx + 1).padStart(2, "0")}]
            </span>
            <span className="font-serif text-xs sm:text-sm text-[#F5F5F4] truncate mt-3">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
