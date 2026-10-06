"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import type { PortfolioSettings } from "@/db/schema";
import { updatePortfolioSettingsAction } from "@/features/design/actions";

interface DesignEditorProps {
  profileId: string;
  initialSettings: PortfolioSettings;
  isPro?: boolean;
}

const THEME_OPTIONS = [
  {
    id: "cinema" as const,
    title: "Cinema",
    subtitle: "Dark, High-Contrast, Immersive",
    description:
      "Deep blacks, dramatic typography, and full-bleed video posters designed for directors and cinematographers.",
    previewGradient: "from-zinc-950 via-zinc-900 to-black",
  },
  {
    id: "editorial" as const,
    title: "Editorial",
    subtitle: "Typography-Forward & Refined",
    description:
      "Generous white space, serif headings, and structured caption rails inspired by contemporary art publications.",
    previewGradient: "from-neutral-900 via-zinc-900 to-stone-950",
  },
  {
    id: "studio" as const,
    title: "Studio",
    subtitle: "Clean Grid & Minimalist Structure",
    description:
      "Precision multi-column grids and crisp metadata ribbons optimized for commercial editing houses.",
    previewGradient: "from-zinc-900 via-neutral-950 to-black",
  },
];

const PRESET_COLORS = [
  { label: "Titanium", hex: "#E5E5E5" },
  { label: "Ruby", hex: "#EF4444" },
  { label: "Amber", hex: "#F59E0B" },
  { label: "Emerald", hex: "#10B981" },
  { label: "Cyan", hex: "#06B6D4" },
  { label: "Violet", hex: "#8B5CF6" },
];

export function DesignEditor({
  profileId,
  initialSettings,
  isPro = false,
}: DesignEditorProps) {
  const router = useRouter();

  const [theme, setTheme] = useState(initialSettings.theme);
  const [motionLevel, setMotionLevel] = useState(initialSettings.motionLevel);
  const [accentColor, setAccentColor] = useState(initialSettings.accentColor);
  const [hideBranding, setHideBranding] = useState(Boolean(initialSettings.hideBranding));

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const isValidHex = /^#[0-9a-fA-F]{6}$/.test(accentColor.trim());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isValidHex) {
      setMessage({
        type: "error",
        text: "Please enter a valid 6-character hex code (e.g. #E5E5E5).",
      });
      return;
    }

    startTransition(async () => {
      const res = await updatePortfolioSettingsAction(profileId, {
        theme,
        motionLevel,
        accentColor: accentColor.trim().toUpperCase(),
        hideBranding: isPro ? hideBranding : false,
      });

      if (res.success) {
        setMessage({ type: "success", text: "Design settings updated successfully." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: res.error });
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {message && (
        <div
          className={clsx(
            "rounded-lg border p-4 text-sm",
            message.type === "success"
              ? "border-emerald-800/80 bg-emerald-950/40 text-emerald-300"
              : "border-red-800/80 bg-red-950/40 text-red-300"
          )}
        >
          {message.text}
        </div>
      )}

      {/* 1. Theme Picker */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">1. Portfolio Theme</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Choose the visual language and layout architecture for your public portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {THEME_OPTIONS.map((item) => {
            const isSelected = theme === item.id;
            return (
              <div
                key={item.id}
                data-testid={`theme-card-${item.id}`}
                onClick={() => setTheme(item.id)}
                className={clsx(
                  "relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition select-none",
                  isSelected
                    ? "border-white bg-zinc-900 ring-1 ring-white"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                )}
              >
                <div>
                  <div
                    className={clsx(
                      "h-20 w-full rounded-lg bg-gradient-to-br mb-4 border border-white/10 flex items-center justify-center",
                      item.previewGradient
                    )}
                  >
                    <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
                      {item.title} Preview
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-400 mt-0.5">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Motion Level */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">2. Motion & Transitions</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Control the intensity of animations and layout dynamic transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <label
            data-testid="motion-full"
            onClick={() => setMotionLevel("full")}
            className={clsx(
              "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition select-none",
              motionLevel === "full"
                ? "border-white bg-zinc-900 ring-1 ring-white"
                : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
            )}
          >
            <input
              type="radio"
              name="motionLevel"
              value="full"
              checked={motionLevel === "full"}
              onChange={() => setMotionLevel("full")}
              className="mt-0.5 h-4 w-4 border-zinc-700 bg-zinc-950 text-white"
            />
            <div>
              <span className="text-sm font-semibold text-white block">
                Full Motion
              </span>
              <span className="text-xs text-zinc-400 leading-relaxed block mt-1">
                Fluid curtain transitions, spring physics, and animated interactive hover states.
              </span>
            </div>
          </label>

          <label
            data-testid="motion-reduced"
            onClick={() => setMotionLevel("reduced")}
            className={clsx(
              "flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition select-none",
              motionLevel === "reduced"
                ? "border-white bg-zinc-900 ring-1 ring-white"
                : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
            )}
          >
            <input
              type="radio"
              name="motionLevel"
              value="reduced"
              checked={motionLevel === "reduced"}
              onChange={() => setMotionLevel("reduced")}
              className="mt-0.5 h-4 w-4 border-zinc-700 bg-zinc-950 text-white"
            />
            <div>
              <span className="text-sm font-semibold text-white block">
                Reduced Motion
              </span>
              <span className="text-xs text-zinc-400 leading-relaxed block mt-1">
                Instant cuts and subtle fades. Respects system reduced-motion accessibility guidelines.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 3. Accent Color */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">3. Signature Accent Color</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Applied to focal points, badges, links, and selected states.
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Swatches */}
          <div className="flex flex-wrap gap-2.5 items-center">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                data-testid={`preset-color-${preset.hex}`}
                onClick={() => setAccentColor(preset.hex)}
                className={clsx(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                  accentColor.toUpperCase() === preset.hex.toUpperCase()
                    ? "border-white bg-zinc-800 text-white"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
                )}
              >
                <span
                  className="h-3 w-3 rounded-full border border-black/30"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Hex Input */}
          <div className="flex items-center gap-3 max-w-xs">
            <div
              className="h-9 w-9 shrink-0 rounded-lg border border-zinc-700"
              style={{ backgroundColor: isValidHex ? accentColor : "#333333" }}
            />
            <input
              type="text"
              value={accentColor}
              maxLength={7}
              onChange={(e) => setAccentColor(e.target.value)}
              placeholder="#E5E5E5"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm font-mono text-white focus:border-zinc-600 focus:outline-none uppercase"
            />
          </div>
          {!isValidHex && (
            <p className="text-xs text-amber-400">
              Must be a valid 6-character hex code (e.g. #E5E5E5).
            </p>
          )}
        </div>
      </div>

      {/* 4. Branding Watermark [PRO] */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">4. GoWider Watermark</h2>
              <span className="rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Remove the &quot;POWERED BY GOWIDER&quot; footer watermark from your public portfolio.
            </p>
          </div>

          <div>
            {isPro ? (
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  data-testid="hide-branding-toggle"
                  checked={hideBranding}
                  onChange={(e) => setHideBranding(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                <span className="ml-3 text-xs font-medium text-zinc-300">
                  {hideBranding ? "Watermark Hidden" : "Watermark Visible"}
                </span>
              </label>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">Locked on Free Plan</span>
                <Link
                  href="/dashboard/billing"
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition inline-flex items-center gap-1.5"
                >
                  <span>Upgrade to Pro</span>
                  <span>↗</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="submit"
          disabled={isPending || !isValidHex}
          className={clsx(
            "rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200",
            (isPending || !isValidHex) && "opacity-50 cursor-not-allowed"
          )}
        >
          {isPending ? "Saving..." : "Save Aesthetics"}
        </button>
      </div>
    </form>
  );
}
