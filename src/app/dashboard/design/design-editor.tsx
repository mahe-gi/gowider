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
  projects?: Array<{ id: string; title: string; slug: string; isPublished: boolean }>;
}

const THEME_OPTIONS = [
  {
    id: "cinema" as const,
    title: "Cinema",
    subtitle: "Split Director's Cut (60/40)",
    description:
      "Asymmetric split layout with 60% widescreen video and 40% project details, plus a theater showreel spotlight.",
    previewGradient: "from-zinc-950 via-zinc-900 to-black",
    layoutType: "60/40 Split Rows",
    isPro: false,
  },
  {
    id: "editorial" as const,
    title: "Editorial",
    subtitle: "Interactive Table Index",
    description:
      "Editorial spreadsheet table with instant hover video preview on the right and italic serif styling.",
    previewGradient: "from-neutral-900 via-zinc-900 to-stone-950",
    layoutType: "Table + Live Preview",
    isPro: false,
  },
  {
    id: "studio" as const,
    title: "Studio",
    subtitle: "3-Column Agency Grid",
    description:
      "Multi-column grid with live category filtering (All, Commercials, Music Videos) and numbered cards.",
    previewGradient: "from-zinc-900 via-neutral-950 to-black",
    layoutType: "3-Column Grid",
    isPro: false,
  },
  {
    id: "noir" as const,
    title: "Noir",
    subtitle: "Widescreen 2.39:1 Scope",
    description:
      "Cinematic anamorphic letterbox framing with warm amber accents and 2.39:1 scope aspect ratio guides.",
    previewGradient: "from-amber-950/40 via-stone-900 to-black",
    layoutType: "2.39:1 Letterbox",
    isPro: true,
  },
  {
    id: "vogue" as const,
    title: "Vogue",
    subtitle: "Staggered Lookbook",
    description:
      "Luxury fashion aesthetic with Roman numerals (I, II, III), champagne gold accents, and alternating offset cards.",
    previewGradient: "from-stone-900 via-zinc-900 to-stone-950",
    layoutType: "Staggered Lookbook",
    isPro: true,
  },
  {
    id: "atelier" as const,
    title: "Atelier",
    subtitle: "Museum Gallery Wall",
    description:
      "Warm travertine stone background, double-border framing stages, and clean classical project numbering.",
    previewGradient: "from-stone-900 via-stone-800 to-neutral-950",
    layoutType: "Museum Wall",
    isPro: true,
  },
  {
    id: "cyber" as const,
    title: "Cyber",
    subtitle: "Tech HUD Terminal",
    description:
      "Sci-fi interface with matrix green borders, corner crosshairs (+), monospace terminal font, and timecodes.",
    previewGradient: "from-emerald-950 via-teal-950 to-black",
    layoutType: "Terminal HUD",
    isPro: true,
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
  projects = [],
}: DesignEditorProps) {
  const router = useRouter();

  const [theme, setTheme] = useState(initialSettings.theme);
  const [motionLevel, setMotionLevel] = useState(initialSettings.motionLevel);
  const [accentColor, setAccentColor] = useState(initialSettings.accentColor);
  const [hideBranding, setHideBranding] = useState(Boolean(initialSettings.hideBranding));
  const [spotlightProjectId, setSpotlightProjectId] = useState<string | null>(
    initialSettings.spotlightProjectId || null
  );
  const [ctaEnabled, setCtaEnabled] = useState(Boolean(initialSettings.ctaEnabled));
  const [ctaLabel, setCtaLabel] = useState(initialSettings.ctaLabel || "");
  const [ctaUrl, setCtaUrl] = useState(initialSettings.ctaUrl || "");

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

    if (ctaEnabled && (!ctaLabel.trim() || !ctaUrl.trim())) {
      setMessage({
        type: "error",
        text: "Please provide both a label and a valid URL for your client inquiry button.",
      });
      return;
    }

    startTransition(async () => {
      const res = await updatePortfolioSettingsAction(profileId, {
        theme,
        motionLevel,
        accentColor: accentColor.trim().toUpperCase(),
        hideBranding: isPro ? hideBranding : false,
        spotlightProjectId: isPro ? (spotlightProjectId || null) : null,
        ctaEnabled: isPro ? ctaEnabled : false,
        ctaLabel: isPro && ctaEnabled ? ctaLabel.trim() : null,
        ctaUrl: isPro && ctaEnabled ? ctaUrl.trim() : null,
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {THEME_OPTIONS.map((item) => {
            const isSelected = theme === item.id;
            const isLocked = item.isPro && !isPro;

            return (
              <div
                key={item.id}
                data-testid={`theme-card-${item.id}`}
                onClick={() => {
                  if (isLocked) {
                    setMessage({
                      type: "error",
                      text: `${item.title} theme is exclusive to GoWider Pro creators. Upgrade to unlock this signature aesthetic.`,
                    });
                    return;
                  }
                  setTheme(item.id);
                }}
                className={clsx(
                  "relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition select-none",
                  isSelected
                    ? "border-white bg-zinc-900 ring-1 ring-white"
                    : isLocked
                    ? "border-zinc-800/80 bg-zinc-950/60 opacity-80 hover:opacity-100 hover:border-zinc-700"
                    : "border-zinc-800 bg-zinc-950 hover:border-zinc-700"
                )}
              >
                <div>
                  <div
                    className={clsx(
                      "h-20 w-full rounded-lg bg-gradient-to-br mb-4 border border-white/10 flex flex-col items-center justify-center relative overflow-hidden p-2",
                      item.previewGradient
                    )}
                  >
                    {/* Visual Mini Wireframe */}
                    {item.id === "studio" && (
                      <div className="grid grid-cols-3 gap-1 w-24 h-8 opacity-70">
                        <div className="bg-white/30 rounded-sm" />
                        <div className="bg-white/30 rounded-sm" />
                        <div className="bg-white/30 rounded-sm" />
                      </div>
                    )}
                    {item.id === "cinema" && (
                      <div className="w-24 h-10 border border-white/30 bg-white/10 rounded-sm flex items-center justify-center opacity-70">
                        <div className="h-1.5 w-12 bg-white/40 rounded-full" />
                      </div>
                    )}
                    {item.id === "noir" && (
                      <div className="w-24 h-8 bg-black border-y-2 border-amber-400/60 flex items-center justify-center opacity-80">
                        <span className="font-mono text-[8px] text-amber-300">2.39:1</span>
                      </div>
                    )}
                    {item.id === "editorial" && (
                      <div className="flex gap-1.5 w-24 h-9 opacity-70">
                        <div className="w-1/2 h-full bg-white/30 rounded-sm" />
                        <div className="w-1/2 h-3/4 bg-white/20 rounded-sm self-end" />
                      </div>
                    )}
                    {item.id === "vogue" && (
                      <div className="flex gap-2 w-24 h-9 opacity-80">
                        <div className="w-2/5 h-3/4 bg-stone-300/40 rounded-sm" />
                        <div className="w-3/5 h-full bg-stone-200/50 rounded-sm self-end" />
                      </div>
                    )}
                    {item.id === "atelier" && (
                      <div className="flex flex-col items-center justify-center w-24 h-9 border border-[#78716C]/50 bg-[#1C1917] p-1 opacity-80">
                        <span className="font-mono text-[8px] text-stone-300">EXHIBITION 01</span>
                      </div>
                    )}
                    {item.id === "cyber" && (
                      <div className="w-24 h-8 border border-[#00FF88]/50 bg-[#00FF88]/10 flex items-center justify-center gap-1 opacity-80">
                        <span className="h-1 w-1 rounded-full bg-[#00FF88] animate-pulse" />
                        <span className="font-mono text-[8px] text-[#00FF88]">4K // 60FPS</span>
                      </div>
                    )}

                    {item.isPro && (
                      <span className="absolute top-2 right-2 rounded bg-amber-500/20 border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <span className="rounded bg-zinc-800 border border-zinc-700/60 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                        {item.layoutType}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                    {isLocked && !isSelected && (
                      <span className="text-[10px] font-mono text-zinc-500">🔒 PRO</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-zinc-400 mt-1">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {isLocked && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500">Pro Feature</span>
                    <Link
                      href="/dashboard/billing"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-semibold text-amber-400 hover:underline"
                    >
                      Unlock with Pro →
                    </Link>
                  </div>
                )}
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

      {/* 5. Hero Showreel Spotlight [PRO] */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">5. Hero Showreel Spotlight</h2>
              <span className="rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Pin a signature master showreel at the top of your portfolio hero stage to immediately hook high-ticket clients.
            </p>
          </div>

          {!isPro && (
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

        {isPro && (
          <div className="pt-2 max-w-lg space-y-2">
            <label className="block text-xs font-medium text-zinc-300">
              Select Signature Project to Spotlight:
            </label>
            <select
              data-testid="spotlight-project-select"
              value={spotlightProjectId || ""}
              onChange={(e) => setSpotlightProjectId(e.target.value || null)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white focus:border-zinc-600 focus:outline-none"
            >
              <option value="">None (Standard Hero Showcase)</option>
              {projects
                .filter((p) => p.isPublished)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    ★ {p.title}
                  </option>
                ))}
            </select>
            {projects.filter((p) => p.isPublished).length === 0 && (
              <p className="text-xs text-zinc-500">
                You do not have any published projects yet. Publish a project first to spotlight it.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 6. Direct Client Booking & Inquiry Button [PRO] */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">6. Direct Client Booking &amp; Inquiry CTA</h2>
              <span className="rounded bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
                PRO
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Add a high-converting action button (Calendly, WhatsApp, Rate Card) directly to your portfolio hero and footer.
            </p>
          </div>

          <div>
            {isPro ? (
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  data-testid="cta-enabled-toggle"
                  checked={ctaEnabled}
                  onChange={(e) => setCtaEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white peer-checked:after:bg-black"></div>
                <span className="ml-3 text-xs font-medium text-zinc-300">
                  {ctaEnabled ? "CTA Active" : "CTA Disabled"}
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

        {isPro && ctaEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800/80">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Button Label (e.g. &ldquo;Inquire for Commercials&rdquo;)
              </label>
              <input
                type="text"
                data-testid="cta-label-input"
                maxLength={60}
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Inquire for Commercials"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Destination URL (e.g. Calendly, WhatsApp, Rate Card)
              </label>
              <input
                type="url"
                data-testid="cta-url-input"
                maxLength={500}
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://calendly.com/your-name/commercial-booking"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-white focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>
        )}
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
