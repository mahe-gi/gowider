import Link from "next/link";

interface CuratedEditorCard {
  discipline: string;
  role: string;
  theme: "Cinema" | "Editorial" | "Studio";
  accent: string;
  tools: string[];
  posterUrl: string;
  reelTitle: string;
}

const CURATED_SHOWCASES: CuratedEditorCard[] = [
  {
    discipline: "COMMERCIAL & AUTOMOTIVE",
    role: "Senior Commercial Colorist & Editor",
    theme: "Cinema",
    accent: "#E5E5E5",
    tools: ["DaVinci Resolve Studio", "Premiere Pro", "ACES Workflow"],
    posterUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
    reelTitle: "AERODYNAMICS // 2026 COMMERCIAL REEL",
  },
  {
    discipline: "NARRATIVE & DOCUMENTARY",
    role: "Feature Documentary & Film Editor",
    theme: "Editorial",
    accent: "#FF3B30",
    tools: ["Avid Media Composer", "FilmConvert Nitrate", "Sound Design"],
    posterUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1000&q=80",
    reelTitle: "THE LONG HORIZON // FESTIVAL CUT",
  },
  {
    discipline: "MUSIC VIDEO & 3D MOTION",
    role: "VFX Supervisor & Music Video Director",
    theme: "Studio",
    accent: "#2997FF",
    tools: ["After Effects", "Blender 3D", "Unreal Engine"],
    posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    reelTitle: "NEON PROTOCOL // TOUR VISUALS",
  },
];

export function CreatorShowcase() {
  return (
    <section className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 block mb-2">
              05 // CURATED SPOTLIGHT
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              BUILT FOR VISUAL STORYTELLERS
            </h2>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            Static Poster Demonstration • Zero Live Player Overhead
          </div>
        </div>

        {/* 3 Curated Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CURATED_SHOWCASES.map((item, idx) => (
            <div
              key={idx}
              className="border border-white/[0.1] bg-[#0A0A0A] hover:border-white/30 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
            >
              {/* Media Poster Stage (Static only) */}
              <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${item.posterUrl}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Top Tags */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-white bg-black/80 px-2 py-0.5 border border-white/20">
                    {item.theme} Style
                  </span>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.accent }}
                  />
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 block">
                    {item.discipline}
                  </span>
                  <h4 className="font-display text-base font-bold uppercase text-white truncate mt-0.5">
                    {item.reelTitle}
                  </h4>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-white mb-2">
                    {item.role}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 my-4">
                    {item.tools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-white/[0.04] text-zinc-400 border border-white/[0.08]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-zinc-400">
                    Poster-First Engine
                  </span>
                  <Link
                    href="/signin"
                    className="font-mono text-xs uppercase tracking-wider font-bold text-white hover:underline flex items-center gap-1"
                  >
                    Build Yours ↗
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
