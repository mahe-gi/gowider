"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileText, RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { LanguageTabs } from "./language-tabs";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/constants";

interface ProjectOutputItem {
  targetLanguage: string;
  status: "pending" | "processing" | "exporting" | "completed" | "failed";
  videoR2Key?: string | null;
  srtR2Key?: string | null;
  errorMessage?: string | null;
}

interface ResultStudioProps {
  projectId: string;
  sourcePreviewUrl?: string;
  sourceLanguage?: string;
  outputs: ProjectOutputItem[];
  onRetryLanguage: (lang: string) => void;
  isRetrying?: boolean;
}

export function ResultStudio({
  projectId,
  sourcePreviewUrl,
  sourceLanguage = "te-IN",
  outputs,
  onRetryLanguage,
  isRetrying = false,
}: ResultStudioProps) {
  const [activeTab, setActiveTab] = useState<string>("original");

  const sourceLangInfo =
    SUPPORTED_LANGUAGES[sourceLanguage as LanguageCode] || { label: "Original", native: "Original" };

  // If there are no outputs and overall project failed
  if (outputs.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-[#121212]/10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111111]">
              Localization could not be completed
            </h2>
            <p className="text-sm text-[#55524C] max-w-md mx-auto leading-relaxed">
              We encountered an issue while connecting to the neural voice dubbing provider. All reserved credits have been released back to your available balance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F4F0E8] border border-[#121212]/06 text-xs text-[#55524C] font-mono">
            <span>₹0 charged · Credits refunded to wallet</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#111111] hover:bg-[#222222] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
            <Link
              href="/studio/new"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF441F] hover:bg-[#E63814] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Try Another Reel</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "original",
      label: `Original (${sourceLangInfo.label})`,
      native: sourceLangInfo.native,
      status: "original" as const,
    },
    ...outputs.map((out) => {
      const info = SUPPORTED_LANGUAGES[out.targetLanguage as LanguageCode] || {
        label: out.targetLanguage,
        native: out.targetLanguage,
      };
      return {
        id: out.targetLanguage,
        label: info.label,
        native: info.native,
        status: (out.status === "completed"
          ? "completed"
          : out.status === "failed"
          ? "failed"
          : "processing") as any,
      };
    }),
  ];

  const currentOutput = outputs.find((o) => o.targetLanguage === activeTab);
  const isOriginal = activeTab === "original";

  const videoDownloadUrl = !isOriginal
    ? `/api/projects/${projectId}/download/${activeTab}/video`
    : undefined;
  const srtDownloadUrl = !isOriginal
    ? `/api/projects/${projectId}/download/${activeTab}/srt`
    : undefined;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
          Ready to go wider.
        </h2>
        <p className="text-sm text-[#55524C]">
          Preview your localized Reel in each language and download production-ready MP4s and subtitle files.
        </p>
      </div>

      {/* Tabs */}
      <LanguageTabs tabs={tabs} activeTab={activeTab} onTabSelect={setActiveTab} />

      {/* Studio Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white p-6 sm:p-8 rounded-3xl border border-[#121212]/10 shadow-lg">
        {/* Video Canvas Column */}
        <div className="md:col-span-6 flex flex-col items-center">
          <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-[#121212]/15 shadow-md">
            {isOriginal ? (
              <video
                key="original"
                src={sourcePreviewUrl}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            ) : currentOutput?.status === "completed" ? (
              <video
                key={activeTab}
                src={`/api/projects/${projectId}/download/${activeTab}/video?redirect=true&inline=true`}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white space-y-3 bg-[#111111]">
                {currentOutput?.status === "failed" ? (
                  <>
                    <AlertCircle className="w-10 h-10 text-[#FF552E]" />
                    <p className="text-sm font-semibold">Localization failed for this language.</p>
                    <button
                      onClick={() => onRetryLanguage(activeTab)}
                      disabled={isRetrying}
                      className="px-4 py-2 bg-[#FF441F] hover:bg-[#E63814] text-white rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                      <span>Retry {activeTab}</span>
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-white/70 font-mono">Loading localized video stream…</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details & Downloads Column */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Active Version
            </span>
            <h3 className="text-2xl font-bold text-[#111111] font-serif">
              {isOriginal
                ? `Original (${sourceLangInfo.label})`
                : `${SUPPORTED_LANGUAGES[activeTab as LanguageCode]?.label || activeTab} (${SUPPORTED_LANGUAGES[activeTab as LanguageCode]?.native || ""})`}
            </h3>

            {isOriginal ? (
              <p className="text-xs text-[#55524C]">Your primary uploaded source Reel.</p>
            ) : currentOutput?.status === "completed" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0FDF4] text-[#16A34A] text-xs font-semibold rounded-full border border-[#BBF7D0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Localization Ready</span>
              </div>
            ) : currentOutput?.status === "failed" ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF2F2] text-[#DC2626] text-xs font-semibold rounded-full border border-[#FECACA]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Localization Failed</span>
              </div>
            ) : null}
          </div>

          {/* Download Actions for Completed Outputs */}
          {!isOriginal && currentOutput?.status === "completed" && (
            <div className="space-y-3 pt-4 border-t border-[#121212]/10">
              <a
                href={videoDownloadUrl}
                download
                className="w-full py-3.5 px-5 rounded-2xl bg-[#111111] hover:bg-[#222222] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#FF441F]" />
                <span>Download Localized Video (MP4)</span>
              </a>

              <a
                href={srtDownloadUrl}
                download
                className="w-full py-3 px-5 rounded-2xl bg-white border border-[#121212]/15 hover:border-[#121212]/30 text-[#111111] font-semibold text-sm shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#55524C]" />
                <span>Download Subtitles (SRT)</span>
              </a>
            </div>
          )}

          {/* Retry Option for Failed Outputs */}
          {!isOriginal && currentOutput?.status === "failed" && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] space-y-3">
              <p className="text-xs text-[#991B1B]">
                {currentOutput.errorMessage || "We couldn't finish this version. Your unused credits were returned."}
              </p>
              <button
                type="button"
                disabled={isRetrying}
                onClick={() => onRetryLanguage(activeTab)}
                className="w-full py-3 px-4 rounded-xl bg-[#FF441F] hover:bg-[#E63814] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                <span>Retry {activeTab} Only</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
