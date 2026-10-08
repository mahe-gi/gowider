import React from "react";
import type { PublicSkill } from "../../../types";
import { ToolIcon } from "../../../shared/tool-icon";

interface EditorialToolsProps {
  tools: PublicSkill[];
}

export function EditorialTools({ tools }: EditorialToolsProps) {
  if (!tools || tools.length === 0) return null;

  return (
    <section
      id="tools"
      data-testid="editorial-tools"
      className="py-16 sm:py-24 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-12 sm:mb-16 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF3B30]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
            [ TOOLS &amp; TECHNOLOGIES ]
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          TECHNICAL ARSENAL
        </span>
      </div>

      {/* Editorial Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-white/[0.08] border border-white/[0.08]">
        {tools.map((tool, idx) => (
          <div
            key={tool.name}
            className="group bg-[#080808] p-5 sm:p-6 hover:bg-white/[0.03] transition-colors flex flex-col justify-between min-h-[100px]"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#FF3B30] tracking-widest">
                {String(idx + 1).padStart(2, "0")} / TECH
              </span>
              <ToolIcon name={tool.name} className="w-5 h-5 shrink-0" />
            </div>
            <span className="font-serif italic text-base sm:text-lg text-white group-hover:text-[#FF3B30] transition-colors truncate mt-4">
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
