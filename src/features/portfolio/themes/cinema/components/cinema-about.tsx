import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface CinemaAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function CinemaAbout({ profile, services, skills }: CinemaAboutProps) {
  return (
    <section id="about" data-testid="cinema-about" className="py-20 sm:py-28 border-b border-white/[0.08]">
      {/* Section Header */}
      <div className="mb-16 sm:mb-20 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-400">
          [ 02 // PRACTICE & CAPABILITIES ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {profile.location || "GLOBAL"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Bio Narrative (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white leading-snug">
            {profile.headline}
          </h3>

          <div className="font-sans text-base sm:text-lg text-zinc-400 leading-relaxed space-y-4 whitespace-pre-line">
            {profile.bio ||
              "Visual storyteller and video editor specializing in rhythm, pacing, and high-impact visual sequencing."}
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex flex-wrap gap-8 font-mono text-xs uppercase tracking-wider text-zinc-500">
            {profile.location && (
              <div>
                <span className="text-zinc-600">BASED: </span>
                <span className="text-zinc-300">{profile.location}</span>
              </div>
            )}
            {profile.availability && (
              <div>
                <span className="text-zinc-600">STATUS: </span>
                <span className="text-emerald-400">{profile.availability}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Services & Technical Toolkit (5 cols) */}
        <div className="lg:col-span-5 space-y-12">
          {/* Services List */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.06] pb-2">
                SERVICES
              </h4>
              <ul className="space-y-3 font-sans text-sm sm:text-base text-zinc-300">
                {services.map((svc, i) => (
                  <li key={svc.name} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{svc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Skills / Tool Stack */}
          {skills.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.06] pb-2">
                TOOLKIT & CRAFT
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="px-3 py-1 font-mono text-xs uppercase tracking-wider text-zinc-300 bg-white/[0.03] border border-white/[0.08]"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
