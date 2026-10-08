import React from "react";

interface ToolIconProps {
  name: string;
  className?: string;
}

/**
 * Normalizes tool name for robust matching regardless of spacing, case, or extra words.
 */
function normalizeToolName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ToolIcon({ name, className = "w-5 h-5" }: ToolIconProps) {
  const key = normalizeToolName(name);

  // 1. DaVinci Resolve
  if (key.includes("davinci") || key.includes("resolve")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    );
  }

  // 2. Adobe Premiere Pro
  if (key.includes("premiere") || key === "pr") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#00005B" />
        <text
          x="12"
          y="16.5"
          fill="#9999FF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          Pr
        </text>
      </svg>
    );
  }

  // 3. Adobe After Effects
  if (key.includes("aftereffect") || key === "ae") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#00005B" />
        <text
          x="12"
          y="16.5"
          fill="#9999FF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          Ae
        </text>
      </svg>
    );
  }

  // 4. Adobe Photoshop
  if (key.includes("photoshop") || key === "ps") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#001E36" />
        <text
          x="12"
          y="16.5"
          fill="#31A8FF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          Ps
        </text>
      </svg>
    );
  }

  // 5. Adobe Illustrator
  if (key.includes("illustrator") || key === "ai") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#330000" />
        <text
          x="12"
          y="16.5"
          fill="#FF9A00"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          Ai
        </text>
      </svg>
    );
  }

  // 6. Adobe Audition
  if (key.includes("audition") || key === "au") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#002222" />
        <text
          x="12"
          y="16.5"
          fill="#00E5FF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11.5"
          fontWeight="bold"
          textAnchor="middle"
        >
          Au
        </text>
      </svg>
    );
  }

  // 7. Blender
  if (key.includes("blender")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#EA7600" />
        <circle cx="12" cy="12" r="4.5" fill="#225B99" />
        <circle cx="12" cy="12" r="2.2" fill="#FFFFFF" />
        <path d="M12 2v5.5M12 22v-5.5M2 12h5.5M22 12h-5.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // 8. Final Cut Pro
  if (key.includes("finalcut") || key === "fcp") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
      </svg>
    );
  }

  // 9. Cinema 4D
  if (key.includes("cinema4d") || key.includes("c4d")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  }

  // 10. Unreal Engine
  if (key.includes("unreal")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8.5 7.5v9h2.2v-7.2h2.6v7.2h2.2v-9H8.5z"
          fill="currentColor"
        />
      </svg>
    );
  }

  // 11. Figma
  if (key.includes("figma")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M8 2h4v5H8a2.5 2.5 0 0 1 0-5z" fill="#F24E1E" />
        <path d="M12 2h4a2.5 2.5 0 0 1 0 5h-4V2z" fill="#FF7262" />
        <path d="M8 7h4v5H8a2.5 2.5 0 0 1 0-5z" fill="#A259FF" />
        <path d="M12 7h4a2.5 2.5 0 1 1 0 5h-4V7z" fill="#1ABCFE" />
        <path d="M8 12h4v4.5a2.5 2.5 0 1 1-4-2V12z" fill="#0ACF83" />
      </svg>
    );
  }

  // 12. CapCut
  if (key.includes("capcut")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 6l5 6-5 6M17 6l-5 6 5 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 13. Avid Media Composer
  if (key.includes("avid") || key.includes("mediacomposer")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="5" fill="#4B0082" />
        <text
          x="12"
          y="16.5"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          Avid
        </text>
      </svg>
    );
  }

  // 14. Midjourney
  if (key.includes("midjourney")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 17l9 4 9-4M3 12l9 4 9-4M3 7l9 4 9-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // 15. Pro Tools / Logic Pro / Audio DAW
  if (key.includes("protools") || key.includes("logic") || key.includes("ableton") || key.includes("sound")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 10v4M8 6v12M12 3v18M16 7v10M20 11v2" strokeLinecap="round" />
      </svg>
    );
  }

  // 16. Camera / Cinematography
  if (key.includes("camera") || key.includes("cinema") || key.includes("red") || key.includes("arri") || key.includes("sony")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  }

  // Clean monogram badge fallback for any custom or specialized tool
  const monogram = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "FX";

  return (
    <div
      className={`${className} flex items-center justify-center rounded border border-white/20 bg-white/5 font-mono text-[10px] font-bold text-zinc-300 tracking-tighter shrink-0`}
      title={name}
    >
      {monogram}
    </div>
  );
}
