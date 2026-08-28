"use client";

import { Check, Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES, LanguageCode, MAX_TARGET_LANGUAGES } from "@/lib/constants";

interface LanguageSelectorProps {
  sourceLanguage: LanguageCode;
  targetLanguages: LanguageCode[];
  onSourceChange: (lang: LanguageCode) => void;
  onTargetToggle: (lang: LanguageCode) => void;
}

export function LanguageSelector({
  sourceLanguage,
  targetLanguages,
  onSourceChange,
  onTargetToggle,
}: LanguageSelectorProps) {
  const languageEntries = Object.entries(SUPPORTED_LANGUAGES) as [
    LanguageCode,
    { label: string; native: string }
  ][];

  return (
    <div className="space-y-6">
      {/* 1. Source Language Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
          1. Original Reel Language
        </label>
        <div className="relative">
          <select
            value={sourceLanguage}
            onChange={(e) => onSourceChange(e.target.value as LanguageCode)}
            className="w-full appearance-none bg-white border border-[#121212]/15 rounded-2xl px-4 py-3 text-sm font-semibold text-[#111111] shadow-2xs hover:border-[#121212]/30 focus:outline-hidden focus:ring-2 focus:ring-[#FF441F] cursor-pointer"
          >
            {languageEntries.map(([code, info]) => (
              <option key={code} value={code}>
                {info.label} ({info.native})
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C877D]">
            <Globe className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. Target Languages Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
            2. Localize into (Max {MAX_TARGET_LANGUAGES})
          </label>
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              targetLanguages.length > 0
                ? "bg-[#FFF1EE] text-[#FF441F]"
                : "bg-[#F4F0E8] text-[#8C877D]"
            }`}
          >
            {targetLanguages.length} / {MAX_TARGET_LANGUAGES} selected
          </span>
        </div>

        {/* Chips Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {languageEntries.map(([code, info]) => {
            const isSource = code === sourceLanguage;
            const isSelected = targetLanguages.includes(code);
            const isMaxReached = targetLanguages.length >= MAX_TARGET_LANGUAGES && !isSelected;

            return (
              <button
                key={code}
                type="button"
                disabled={isSource || (isMaxReached && !isSelected)}
                onClick={() => onTargetToggle(code)}
                className={`relative px-3.5 py-3 rounded-xl text-left border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isSource
                    ? "opacity-40 bg-[#F4F0E8] border-transparent cursor-not-allowed"
                    : isSelected
                    ? "bg-[#FFF5F2] border-[#FF441F] shadow-xs text-[#111111] ring-1 ring-[#FF441F]"
                    : isMaxReached
                    ? "opacity-50 bg-white/60 border-[#121212]/10 cursor-not-allowed"
                    : "bg-white border-[#121212]/10 hover:border-[#121212]/25 hover:bg-[#FAF8F3] text-[#111111]"
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-[#55524C]">{info.label}</p>
                  <p className="text-sm font-bold font-serif">{info.native}</p>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#FF441F] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
                {isSource && (
                  <span className="text-[10px] font-mono text-[#8C877D]">Source</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
