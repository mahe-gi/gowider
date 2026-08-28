"use client";

import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { HUMAN_STATUS_LABELS } from "@/lib/constants";

interface ProcessingStatusProps {
  status: string;
  currentStepLabel?: string | null;
  progress?: number | null;
  targetLanguages: string[];
}

export function ProcessingStatus({
  status,
  currentStepLabel,
  progress = 0,
  targetLanguages,
}: ProcessingStatusProps) {
  const isFailed = status === "failed";
  const isComplete = status === "completed";
  const isPartial = status === "partial_failure";

  const displayLabel =
    currentStepLabel || HUMAN_STATUS_LABELS[status] || "Localizing your Reel…";

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-lg space-y-6 text-center">
      {/* Icon Graphic */}
      <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FFF1EE] border border-[#FF441F]/20 flex items-center justify-center text-[#FF441F] shadow-2xs">
        {isComplete ? (
          <CheckCircle2 className="w-8 h-8 text-[#22C55E]" />
        ) : isPartial ? (
          <Clock className="w-8 h-8 text-[#FF7A00]" />
        ) : isFailed ? (
          <AlertCircle className="w-8 h-8 text-[#EF4444]" />
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-[#FF441F]" />
        )}
      </div>

      {/* Status Heading */}
      <div className="space-y-1.5">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#111111]">
          {isComplete
            ? "Your Reels are ready!"
            : isPartial
            ? "Partially Completed"
            : isFailed
            ? "Localization Failed"
            : "Localizing your Reel"}
        </h2>
        <p className="text-sm font-medium text-[#FF441F] animate-pulse">
          {displayLabel}
        </p>
      </div>

      {/* Progress Bar (if available) */}
      {!isComplete && !isFailed && (
        <div className="space-y-1.5 pt-2">
          <div className="w-full h-2.5 bg-[#F4F0E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FF441F] transition-all duration-500 rounded-full"
              style={{ width: `${Math.max(15, progress || 25)}%` }}
            />
          </div>
          {progress && progress > 0 ? (
            <p className="text-xs font-mono text-[#8C877D]">{progress}% completed</p>
          ) : (
            <p className="text-xs font-mono text-[#8C877D]">Pipeline active</p>
          )}
        </div>
      )}

      {/* Informative Note */}
      <div className="pt-3 border-t border-[#121212]/08 flex items-center justify-center gap-2 text-xs text-[#8C877D]">
        <Clock className="w-3.5 h-3.5" />
        <span>You can close this window. We will keep working.</span>
      </div>
    </div>
  );
}
