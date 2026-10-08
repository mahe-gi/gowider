import React from "react";
import type { PublicSkill } from "../../../types";
import { ToolIcon } from "../../../shared/tool-icon";

interface CyberToolsProps {
  tools: PublicSkill[];
}

export function CyberTools({ tools }: CyberToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="cyber-tools"
      className="py-16 sm:py-24 border-b border-emerald-500/20 font-mono"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-emerald-500/20 pb-6">
        <h2 className="text-xs uppercase tracking-[0.25em] text-[#00FF88]">
          [ CYBER // SOFTWARE STACK &amp; TELEMETRY ]
        </h2>
        <span className="text-xs uppercase tracking-widest text-zinc-500">
          NODE ENVIRONMENT
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="group relative p-4 bg-zinc-950/80 border border-emerald-500/20 hover:border-[#00FF88] transition-all flex flex-col justify-between min-h-[90px]"
          >
            {/* Corner Crosshairs */}
            <span className="absolute top-1 left-1 text-[8px] text-emerald-500/40 group-hover:text-[#00FF88]">
              +
            </span>
            <span className="absolute top-1 right-1 text-[8px] text-emerald-500/40 group-hover:text-[#00FF88]">
              +
            </span>

            <div className="flex items-center justify-between text-[10px] text-emerald-400/70 tracking-widest pt-1">
              <span>{`[MOD_${String(idx + 1).padStart(2, "0")}]`}</span>
              <ToolIcon name={tool.name} className="w-4 h-4 shrink-0 text-[#00FF88]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-zinc-100 truncate mt-3 group-hover:text-[#00FF88] transition-colors">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
