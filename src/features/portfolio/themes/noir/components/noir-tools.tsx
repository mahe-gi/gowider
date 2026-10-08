import React from "react";
import type { PublicSkill } from "../../../types";
import { ToolIcon } from "../../../shared/tool-icon";

interface NoirToolsProps {
  tools: PublicSkill[];
}

export function NoirTools({ tools }: NoirToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="noir-tools"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-amber-400">
          [ 2.39:1 NOIR // TECHNICAL SUITE ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          HARDWARE &amp; SOFTWARE STACK
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="p-4 bg-zinc-950/80 border border-white/[0.08] hover:border-amber-400/50 hover:bg-amber-950/10 transition-all flex flex-col justify-between min-h-[90px]"
          >
            <div className="flex items-center justify-between font-mono text-[10px] text-amber-400/80 tracking-wider">
              <span>{`[0${idx + 1}:00]`}</span>
              <ToolIcon name={tool.name} className="w-5 h-5 shrink-0" />
            </div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200 truncate mt-3">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
