import React from "react";
import Link from "next/link";
import type { PublicSocialLink } from "../../../types";

interface VogueFooterProps {
  displayName: string;
  username: string;
  socialLinks: PublicSocialLink[];
  hideBranding?: boolean;
}

export function VogueFooter({
  displayName,
  username,
  socialLinks,
  hideBranding = false,
}: VogueFooterProps) {
  const whatsappLink = socialLinks.find(
    (l) => l.platform === "whatsapp" && l.url
  );

  const visibleSocialLinks = socialLinks.filter(
    (link) =>
      link.platform !== "whatsapp" &&
      (link.platform as string) !== "email" &&
      !link.url.toLowerCase().startsWith("mailto:")
  );

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case "instagram":
        return "Instagram";
      case "youtube":
        return "YouTube";
      case "linkedin":
        return "LinkedIn";
      case "x":
        return "X";
      case "website":
        return "Website";
      default:
        return platform;
    }
  };

  return (
    <footer
      id="contact"
      data-testid="vogue-footer"
      className="pt-24 sm:pt-36 pb-16"
    >
      <div className="space-y-12">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-amber-200/80">
          Contact
        </div>

        <h2 className="font-serif italic text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight select-none leading-[0.95]">
          Let&apos;s Work Together.
        </h2>

        {whatsappLink && (
          <div className="pt-4">
            <a
              href={whatsappLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-black bg-[#EFE3C3] hover:bg-white transition-all shadow-xl hover:scale-[1.02]"
            >
              <span>CHAT ON WHATSAPP</span>
              <span>→</span>
            </a>
          </div>
        )}
      </div>

      {/* Social Links */}
      <div className="mt-24 pt-10 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-8 font-serif italic text-sm text-stone-300">
          {visibleSocialLinks.map((link) => (
            <a
              key={link.platform + link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-200 transition-colors"
            >
              {getPlatformLabel(link.platform)} ↗
            </a>
          ))}
        </div>

        <div className="font-mono text-xs text-stone-500">
          © {new Date().getFullYear()} {displayName}. All Rights Reserved.
        </div>
      </div>

      {/* Platform Branding & Report */}
      <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-wider text-stone-600">
        {!hideBranding ? (
          <Link
            href="/"
            className="hover:text-stone-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>POWERED BY GOWIDER</span>
            <span className="text-amber-200/60 font-semibold">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}

        <a
          data-testid="report-portfolio-btn"
          href={`/report?username=${username}`}
          className="hover:text-stone-400 transition-colors underline decoration-dotted"
        >
          Report this portfolio
        </a>
      </div>
    </footer>
  );
}
