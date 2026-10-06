import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface NoirAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function NoirAbout({ profile, services, skills }: NoirAboutProps) {
  return (
    <section
      id="practice"
      data-testid="noir-about"
      className="py-20 sm:py-32 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-16 sm:mb-20 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
          [ DIRECTORIAL METHODOLOGY & CAPABILITIES ]
        </h2>
        <span className="font-mono text-xs uppercase tracking-widest text-amber-500/80">
          {profile.location || "WORLDWIDE COMMISSIONS"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Bio Statement (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase tracking-tight text-white leading-snug">
            {profile.headline}
          </h3>

          <div className="font-sans text-base sm:text-lg text-zinc-400 leading-relaxed space-y-4 whitespace-pre-line">
            {profile.bio ||
              "Filmmaker and directorial editor crafting visceral cinematic narratives, rhythm-driven commercials, and anamorphic visual statements."}
          </div>

          <div className="pt-6 border-t border-white/[0.06] flex flex-wrap gap-8 font-mono text-xs uppercase tracking-wider text-zinc-500">
            {profile.location && (
              <div>
                <span className="text-zinc-600">PRODUCTION BASE: </span>
                <span className="text-zinc-200">{profile.location}</span>
              </div>
            )}
            {profile.availability && (
              <div>
                <span className="text-zinc-600">AVAILABILITY: </span>
                <span className="text-amber-400">{profile.availability}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Direction Roles & Camera Toolkit (5 cols) */}
        <div className="lg:col-span-5 space-y-12">
          {/* Directorial Disciplines */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-amber-400/90 border-b border-white/[0.06] pb-2">
                DIRECTORIAL DISCIPLINES
              </h4>
              <ul className="space-y-3 font-sans text-sm sm:text-base text-zinc-300">
                {services.map((svc, i) => (
                  <li key={svc.name + i} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-amber-500/60">
                      0{i + 1} {"//"}
                    </span>
                    <span className="font-medium text-white">{svc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technical Toolkit & Post Systems */}
          {skills.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.06] pb-2">
                POST-PRODUCTION SYSTEMS
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill, i) => (
                  <span
                    key={skill.name + i}
                    className="font-mono text-xs border border-white/[0.08] bg-zinc-950 px-3 py-1.5 text-zinc-300 uppercase tracking-wider"
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
