"use client";

import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/constants";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface TabItem {
  id: string; // 'original' or language code
  label: string;
  native: string;
  status: "original" | "completed" | "processing" | "failed";
}

interface LanguageTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabSelect: (tabId: string) => void;
}

export function LanguageTabs({ tabs, activeTab, onTabSelect }: LanguageTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#121212]/10 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabSelect(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 ${
              isActive
                ? "bg-[#111111] text-white shadow-md"
                : "bg-white border border-[#121212]/10 text-[#55524C] hover:border-[#121212]/30 hover:text-[#111111]"
            }`}
          >
            <span>{tab.label}</span>
            <span className="font-serif opacity-75 font-normal">({tab.native})</span>

            {tab.status === "completed" && (
              <CheckCircle2 className={`w-3.5 h-3.5 ${isActive ? "text-[#4ADE80]" : "text-[#22C55E]"}`} />
            )}
            {tab.status === "failed" && (
              <AlertCircle className={`w-3.5 h-3.5 ${isActive ? "text-[#FF8080]" : "text-[#EF4444]"}`} />
            )}
            {tab.status === "processing" && (
              <Loader2 className={`w-3.5 h-3.5 animate-spin ${isActive ? "text-[#FF552E]" : "text-[#FF441F]"}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
