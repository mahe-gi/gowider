"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { calculateDubbingCost } from "@/lib/pricing/dubbing";
import { LanguageCode, SUPPORTED_LANGUAGES } from "@/lib/constants";

interface GenerationSummaryProps {
  durationSeconds: number;
  targetLanguages: LanguageCode[];
  isSubmitting?: boolean;
  onGenerate: (confirmVoiceRights: boolean) => void;
}

export function GenerationSummary({
  durationSeconds,
  targetLanguages,
  isSubmitting = false,
  onGenerate,
}: GenerationSummaryProps) {
  const [confirmedRights, setConfirmedRights] = useState(false);

  const pricing = calculateDubbingCost(durationSeconds, targetLanguages.length);

  function getButtonLabel() {
    if (isSubmitting) return "Preparing localization…";
    if (targetLanguages.length === 0) return "Select target languages";
    if (targetLanguages.length === 1) {
      const langName = SUPPORTED_LANGUAGES[targetLanguages[0]]?.label || "version";
      return `Generate ${langName} version →`;
    }
    return `Generate ${targetLanguages.length} versions →`;
  }

  const isValid = targetLanguages.length > 0 && confirmedRights && !isSubmitting;

  return (
    <div className="space-y-5 pt-4 border-t border-[#121212]/10">
      {/* Cost & Calculation Summary Card */}
      <div className="p-4 rounded-2xl bg-[#F4F0E8] border border-[#121212]/05 space-y-2">
        <div className="flex items-center justify-between text-xs text-[#55524C]">
          <span>Processing estimate</span>
          <span className="font-mono font-medium">
            {durationSeconds}s × {targetLanguages.length} {targetLanguages.length === 1 ? "language" : "languages"}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-semibold text-[#111111]">Estimated Cost</span>
          <div className="text-right">
            <span className="text-xl font-black tracking-tight text-[#111111]">{pricing.formattedTotalInr}</span>
            <span className="text-xs text-[#8C877D] font-mono ml-1.5">({pricing.totalCostPaise} credits)</span>
          </div>
        </div>
      </div>

      {/* Voice Rights Consent Checkbox */}
      <label className="flex items-start gap-3 p-3.5 rounded-xl border border-[#121212]/10 bg-white hover:bg-[#FAF8F3] cursor-pointer transition-colors select-none">
        <input
          type="checkbox"
          checked={confirmedRights}
          onChange={(e) => setConfirmedRights(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded-md text-[#FF441F] focus:ring-[#FF441F] accent-[#FF441F] cursor-pointer"
        />
        <div className="text-xs text-[#55524C] leading-relaxed">
          <span className="font-semibold text-[#111111]">Voice Ownership & Dubbing Rights:</span>{" "}
          I confirm that I own or have legal permission to dub the voice(s) in this video.
        </div>
      </label>

      {/* Main Action Button */}
      <button
        type="button"
        disabled={!isValid}
        onClick={() => onGenerate(confirmedRights)}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
          isValid
            ? "bg-[#FF441F] hover:bg-[#E63814] text-white hover:shadow-lg hover:scale-[1.01]"
            : "bg-[#121212]/15 text-[#8C877D] cursor-not-allowed shadow-none"
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{getButtonLabel()}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-white/80" />
            <span>{getButtonLabel()}</span>
          </>
        )}
      </button>
    </div>
  );
}
