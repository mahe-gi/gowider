import React from "react";
import type { PublicSkill } from "../../../types";
import { ToolIcon } from "../../../shared/tool-icon";

interface StudioToolsProps {
  tools: PublicSkill[];
}

export function StudioTools({ tools }: StudioToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="studio-tools"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#2997FF]">
          [ STUDIO // PIPELINE &amp; SOFTWARE ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          PRODUCTION STACK
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="p-4 bg-[#111111] border border-white/[0.08] hover:border-[#2997FF]/50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ToolIcon name={tool.name} className="w-5 h-5 shrink-0" />
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200 truncate">
                {tool.name}
              </span>
            </div>
            <span className="font-mono text-[10px] text-zinc-600 shrink-0 ml-2">
              {String(idx + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
