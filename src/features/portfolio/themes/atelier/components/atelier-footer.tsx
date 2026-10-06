import React from "react";
import Link from "next/link";
import type { PublicSocialLink } from "../../../types";

interface AtelierFooterProps {
  displayName: string;
  username: string;
  socialLinks: PublicSocialLink[];
  hideBranding?: boolean;
  cta?: { enabled: boolean; label: string; url: string } | null;
}

export function AtelierFooter({
  displayName,
  username,
  socialLinks,
  hideBranding = false,
  cta,
}: AtelierFooterProps) {
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
        return "X / TWITTER";
      case "website":
        return "PORTAL";
      default:
        return platform.toUpperCase();
    }
  };

  return (
    <footer
      id="contact"
      data-testid="atelier-footer"
      className="pt-24 sm:pt-36 pb-16"
    >
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-none bg-[#D6D3CD]" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#A8A29E]">
            ACQUISITIONS &amp; COMMISSIONS
          </span>
        </div>

        <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-[#F5F5F4] leading-[1.05] tracking-[-0.02em] max-w-4xl">
          INITIATE A COMMISSION OR INQUIRE FOR EXHIBITION SCREENINGS.
        </h2>

        {/* Direct Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-4">
          {cta?.enabled && (
            <a
              href={cta.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs font-bold uppercase tracking-widest text-[#0C0A09] bg-[#E7E5E4] hover:bg-[#F5F5F4] transition-all shadow-[0_0_20px_rgba(231,229,228,0.2)]"
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
              className="inline-flex items-center gap-3 px-8 py-4 font-mono text-xs font-semibold uppercase tracking-widest text-[#D6D3CD] border border-[#292524] bg-[#141210] hover:border-[#78716C] transition-all"
            >
              <span>DIRECT WHATSAPP INQUIRY</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Social Links & Copyright */}
      <div className="mt-20 pt-10 border-t border-[#292524]/60 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-6 sm:gap-10 font-mono text-xs uppercase tracking-widest text-[#A8A29E]">
          {visibleSocialLinks.map((link) => (
            <a
              key={link.platform + link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#F5F5F4] transition-colors"
            >
              {getPlatformLabel(link.platform)} ↗
            </a>
          ))}
        </div>

        <div className="font-mono text-xs text-[#78716C]">
          © {new Date().getFullYear()} {displayName}. FINE-ART ATELIER ARCHIVE.
        </div>
      </div>

      {/* Bottom Sub-bar: Platform Watermark & Report Trigger */}
      <div className="mt-12 pt-6 border-t border-[#292524]/40 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] tracking-wider text-[#78716C]">
        {!hideBranding ? (
          <Link
            href="/"
            className="hover:text-[#A8A29E] transition-colors inline-flex items-center gap-1.5"
          >
            <span>POWERED BY GOWIDER</span>
            <span className="text-[#D6D3CD] font-semibold">[PRO]</span>
          </Link>
        ) : (
          <span />
        )}

        <a
          data-testid="report-portfolio-btn"
          href={`/report?username=${username}`}
          className="hover:text-[#A8A29E] transition-colors underline decoration-dotted"
        >
          Report this portfolio
        </a>
      </div>
    </footer>
  );
}
