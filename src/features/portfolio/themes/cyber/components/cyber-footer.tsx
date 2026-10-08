import React from "react";
import Link from "next/link";
import type { PublicSocialLink } from "../../../types";

interface CyberFooterProps {
  displayName: string;
  username: string;
  socialLinks: PublicSocialLink[];
  hideBranding?: boolean;
  cta?: { enabled: boolean; label: string; url: string } | null;
}

export function CyberFooter({
  displayName,
  username,
  socialLinks,
  hideBranding = false,
  cta,
}: CyberFooterProps) {
  // Find whatsapp link if configured
  const whatsappLink = socialLinks.find(
    (l) => l.platform === "whatsapp" && l.url
  );

  // Strictly filter out email links for privacy preservation (Rule 7)
  const visibleSocialLinks = socialLinks.filter(
    (link) =>
      link.platform !== "whatsapp" &&
      (link.platform as string) !== "email" &&
      !link.url.toLowerCase().startsWith("mailto:")
  );

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "INSTAGRAM";
      case "youtube":
        return "YOUTUBE";
      case "linkedin":
        return "LINKEDIN";
      case "x":
        return "X";
      case "website":
        return "WEBSITE";
      default:
        return platform.toUpperCase();
    }
  };

  return (
    <footer
      id="contact"
      data-testid="cyber-footer"
      className="pt-24 sm:pt-36 pb-16 font-mono"
    >
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-none bg-[#00FF88] shadow-[0_0_8px_#00FF88] animate-pulse" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#00FF88]">
            [ GET IN TOUCH // CONTACT ]
          </span>
        </div>

        <h2 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black uppercase text-white leading-tight max-w-4xl tracking-tight drop-shadow-[0_0_20px_rgba(0,255,136,0.15)]">
          LET&apos;S WORK TOGETHER ON YOUR NEXT PROJECT.
        </h2>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          {cta?.enabled && (
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs font-bold uppercase tracking-widest text-black bg-[#00FF88] hover:bg-[#33ff9f] transition-all shadow-[0_0_25px_rgba(0,255,136,0.4)]"
            >
              <span>{cta.label}</span>
              <span>↗</span>
            </a>
          )}

          {whatsappLink && (
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-[#00FF88] border border-emerald-500/40 bg-emerald-950/20 hover:border-[#00FF88] transition-all"
            >
              <span>CHAT ON WHATSAPP</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Social Links & Copyright */}
      <div className="mt-20 pt-10 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-6 sm:gap-10 text-xs uppercase tracking-widest text-zinc-400">
          {visibleSocialLinks.map((link) => (
            <a
              key={link.platform + link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00FF88] transition-colors"
            >
              {getPlatformLabel(link.platform)} ↗
            </a>
          ))}
        </div>

        <div className="text-xs text-zinc-500">
          © {new Date().getFullYear()} {displayName}. ALL RIGHTS RESERVED.
        </div>
      </div>

      {/* Bottom Sub-bar: Platform Watermark & Report Trigger */}
      <div className="mt-12 pt-6 border-t border-emerald-500/10 flex flex-wrap items-center justify-between gap-4 text-[11px] tracking-wider text-zinc-600">
        {!hideBranding ? (
          <Link
            href="/"
            className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>POWERED BY GOWIDER</span>
            <span className="text-[#00FF88] font-bold">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}

        <a
          data-testid="report-portfolio-btn"
          href={`/report?username=${username}`}
          className="hover:text-zinc-400 transition-colors underline decoration-dotted"
        >
          Report this portfolio
        </a>
      </div>
    </footer>
  );
}
