"use client";

import React, { useState, useTransition } from "react";
import { setAestheticAction } from "../actions/set-aesthetic";

interface Step4AestheticProps {
  initialTheme?: "cinema" | "editorial" | "studio";
  initialMotionLevel?: "full" | "reduced";
  onSuccess: () => void;
  onBack?: () => void;
}

const THEMES = [
  {
    id: "cinema" as const,
    name: "Cinema",
    subtitle: "Dark Charcoal / 16:9 Letterbox",
    description:
      "Deep black backgrounds, widescreen ratios, and subtle chrome. Built for narrative, commercial, and high-budget film edits.",
    accent: "#E5E5E5",
    borderClass: "border-zinc-200",
  },
  {
    id: "editorial" as const,
    name: "Editorial",
    subtitle: "High Contrast / Bold Typography",
    description:
      "Magazine-style editorial aesthetics with vivid typography and bold red accents. Tailored for fashion and high-concept creative directors.",
    accent: "#FF3B30",
    borderClass: "border-red-500",
  },
  {
    id: "studio" as const,
    name: "Studio",
    subtitle: "Modular / Clean Technical",
    description:
      "Precision grid architecture, structured metadata badges, and electric blue highlights. Perfect for motion designers and commercial agencies.",
    accent: "#2997FF",
    borderClass: "border-blue-500",
  },
];

export function Step4Aesthetic({
  initialTheme = "cinema",
  initialMotionLevel = "full",
  onSuccess,
  onBack,
}: Step4AestheticProps) {
  const [selectedTheme, setSelectedTheme] = useState<"cinema" | "editorial" | "studio">(initialTheme);
  const [motionLevel, setMotionLevel] = useState<"full" | "reduced">(initialMotionLevel);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      const res = await setAestheticAction({
        theme: selectedTheme,
        motionLevel,
      });

      if (res.success) {
        onSuccess();
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-6">
        <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
          Step 04 / 05
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Choose Your Visual Aesthetic
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Select an aesthetic framework that complements your cutting style.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 gap-3">
          {THEMES.map((theme) => {
            const isSelected = selectedTheme === theme.id;

            return (
              <label
                key={theme.id}
                data-testid={`theme-card-${theme.id}`}
                className={`relative block p-4 border cursor-pointer transition-all ${
                  isSelected
                    ? `bg-white/[0.04] border-white ring-1 ring-white/50`
                    : "bg-[#0A0A0A] border-white/10 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.id}
                  checked={isSelected}
                  onChange={() => setSelectedTheme(theme.id)}
                  className="sr-only"
                />

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-white text-base">
                        {theme.name}
                      </span>
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: theme.accent }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                      {theme.subtitle}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-mono px-2 py-0.5 uppercase tracking-wider rounded ${
                      isSelected
                        ? "bg-white text-black font-semibold"
                        : "bg-white/5 text-zinc-400 border border-white/10"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                  {theme.description}
                </p>
              </label>
            );
          })}
        </div>

        {/* Motion Level Selector */}
        <div className="border border-white/10 p-4 bg-[#0A0A0A]">
          <span className="block text-xs uppercase tracking-wider font-mono text-zinc-300 mb-2">
            Motion & Transitions
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-testid="motion-full"
              onClick={() => setMotionLevel("full")}
              className={`py-2 px-3 text-xs font-mono border text-center transition-colors ${
                motionLevel === "full"
                  ? "bg-white text-black border-white font-semibold"
                  : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30"
              }`}
            >
              Full Motion
            </button>
            <button
              type="button"
              data-testid="motion-reduced"
              onClick={() => setMotionLevel("reduced")}
              className={`py-2 px-3 text-xs font-mono border text-center transition-colors ${
                motionLevel === "reduced"
                  ? "bg-white text-black border-white font-semibold"
                  : "bg-transparent text-zinc-400 border-white/10 hover:border-white/30"
              }`}
            >
              Reduced Motion
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-2 font-mono">
            {motionLevel === "full"
              ? "Cinematic smooth scroll, parallax & reveal animations."
              : "Subtle instant cuts respecting prefers-reduced-motion."}
          </p>
        </div>

        {errorMessage && (
          <div
            data-testid="aesthetic-error"
            className="p-3 bg-red-950/40 border border-red-800/60 text-red-300 text-xs rounded-none"
          >
            {errorMessage}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={isPending}
              className="py-3 px-6 border border-white/20 text-zinc-300 font-semibold text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors disabled:opacity-50"
            >
              ← Back
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            data-testid="aesthetic-submit"
            className="flex-1 py-3 bg-white text-black font-semibold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {isPending ? "Applying..." : "Apply Aesthetic & Review →"}
          </button>
        </div>
      </form>
    </div>
  );
}
