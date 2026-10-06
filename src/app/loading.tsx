import React from "react";
import { LogoMark } from "@/components/brand";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center gap-6">
        {/* Animated pulse logo */}
        <div className="relative">
          <LogoMark withBadge size={44} className="animate-pulse" />
          <div className="absolute inset-0 rounded-lg border border-white/20 animate-ping opacity-25" />
        </div>

        {/* Shimmer loading progress bar */}
        <div className="w-48 h-0.5 bg-zinc-900 overflow-hidden relative rounded-full">
          <div className="absolute inset-y-0 w-1/3 bg-white/70 animate-[shimmer_1.5s_infinite] rounded-full" />
        </div>

        <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 animate-pulse">
          INITIALIZING SIGNAL...
        </span>
      </div>
    </div>
  );
}
