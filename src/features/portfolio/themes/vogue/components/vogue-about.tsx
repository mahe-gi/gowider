import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface VogueAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function VogueAbout({ profile, services, skills }: VogueAboutProps) {
  return (
    <section
      id="profile"
      data-testid="vogue-about"
      className="py-24 sm:py-36 border-b border-white/[0.08]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Left Column: Editorial Statement (7 cols) */}
        <div className="lg:col-span-7 space-y-10">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-amber-200/80">
            About the Director
          </div>

          <h2 className="font-serif italic text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] tracking-tight">
            {profile.headline}
          </h2>

          <div className="font-sans text-base sm:text-lg text-stone-300 leading-relaxed space-y-4 whitespace-pre-line font-light">
            {profile.bio ||
              "Director and visual editor working across commercial luxury, high fashion lookbooks, and high-contrast editorial motion."}
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-wrap gap-10 font-mono text-xs uppercase tracking-wider text-stone-400">
            {profile.location && (
              <div>
                <span className="text-stone-500">ATELIER: </span>
                <span className="text-stone-200">{profile.location}</span>
              </div>
            )}
            {profile.availability && (
              <div>
                <span className="text-stone-500">COMMISSIONS: </span>
                <span className="text-amber-200">{profile.availability}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Services & Repertoire Disciplines (5 cols) */}
        <div className="lg:col-span-5 space-y-12">
          {services.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 border-b border-white/[0.08] pb-3">
                CREATIVE DISCIPLINES
              </h3>
              <ul className="space-y-3 font-serif text-base sm:text-lg text-stone-200 italic">
                {services.map((svc, i) => (
                  <li key={svc.name + i} className="flex items-center gap-3">
                    <span className="text-amber-200 text-xs font-mono not-italic">✦</span>
                    <span>{svc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-stone-400 border-b border-white/[0.08] pb-3">
                TECHNICAL CAPABILITIES
              </h3>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs text-stone-300">
                {skills.map((skill, i) => (
                  <span
                    key={skill.name + i}
                    className="border border-white/[0.08] bg-stone-950 px-3 py-1.5 uppercase tracking-wider"
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
