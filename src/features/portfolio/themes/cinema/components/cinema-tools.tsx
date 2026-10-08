import React from "react";
import type { PublicSkill } from "../../../types";
import { ToolIcon } from "../../../shared/tool-icon";

interface CinemaToolsProps {
  tools: PublicSkill[];
}

export function CinemaTools({ tools }: CinemaToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="cinema-tools"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">
          [ TOOLS &amp; TECHNOLOGIES ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          PRODUCTION ARSENAL
        </span>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="group relative flex flex-col justify-between p-4 sm:p-5 bg-white/[0.02] border border-white/[0.08] hover:border-white/30 hover:bg-white/[0.05] transition-all duration-300"
          >
            <div className="flex items-center justify-between text-zinc-600 font-mono text-[10px] tracking-widest group-hover:text-zinc-400 transition-colors">
              <span>{String(idx + 1).padStart(2, "0")}</span>
              <ToolIcon name={tool.name} className="w-5 h-5 shrink-0" />
            </div>
            <div className="mt-4 sm:mt-6">
              <span className="font-mono text-xs sm:text-sm font-medium uppercase tracking-wider text-zinc-200 group-hover:text-white transition-colors block truncate">
                {tool.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
