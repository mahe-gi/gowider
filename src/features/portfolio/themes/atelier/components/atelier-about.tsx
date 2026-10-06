import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface AtelierAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function AtelierAbout({
  profile,
  services,
  skills,
}: AtelierAboutProps) {
  return (
    <section
      id="practice"
      data-testid="atelier-about"
      className="py-20 sm:py-32 border-b border-[#292524]/60"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Curatorial Statement */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-none bg-[#D6D3CD]" />
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[#D6D3CD]">
              CURATORIAL STATEMENT &amp; OEUVRE
            </h2>
          </div>

          <p className="font-serif text-2xl sm:text-3xl text-[#F5F5F4] font-light leading-relaxed">
            {profile.bio || profile.headline}
          </p>

          {profile.location && (
            <div className="pt-4 font-mono text-xs uppercase tracking-widest text-[#78716C]">
              PERMANENT STUDIO BASE: <span className="text-[#D6D3CD]">{profile.location}</span>
            </div>
          )}
        </div>

        {/* Disciplines & Archival Toolkit */}
        <div className="lg:col-span-5 space-y-12">
          {services.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#A8A29E] border-b border-[#292524]/60 pb-3">
                CURATORIAL DISCIPLINES
              </h3>
              <ul className="space-y-2.5">
                {services.map((svc) => (
                  <li
                    key={svc.name}
                    className="flex items-center gap-3 font-serif text-base text-[#E7E5E4]"
                  >
                    <span className="font-mono text-xs text-[#78716C]">/</span>
                    <span>{svc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#A8A29E] border-b border-[#292524]/60 pb-3">
                MEDIUM &amp; PALETTE PROFICIENCIES
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="border border-[#292524] bg-[#141210] px-3 py-1 font-mono text-xs text-[#D6D3CD]"
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
