import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface EditorialAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function EditorialAbout({
  profile,
  services,
  skills,
}: EditorialAboutProps) {
  return (
    <section
      id="about"
      data-testid="editorial-about"
      className="py-20 sm:py-28 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-14 sm:mb-20 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF3B30]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
            [ PRACTICE // EDITORIAL STATEMENT ]
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {profile.location || "GLOBAL"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Bio Narrative Split (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-white leading-tight">
            {profile.headline}
          </h3>

          <div className="font-sans text-base sm:text-lg text-zinc-300 leading-relaxed space-y-5 whitespace-pre-line">
            {profile.bio ||
              "Visual artist and video editor driven by precision pacing, distinct color mood, and compelling narrative craft."}
          </div>

          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap gap-8 font-mono text-xs uppercase tracking-wider text-zinc-400">
            {profile.location && (
              <div>
                <span className="text-zinc-600">ORIGIN: </span>
                <span className="text-zinc-200">{profile.location}</span>
              </div>
            )}
            {profile.availability && (
              <div>
                <span className="text-zinc-600">AVAILABILITY: </span>
                <span className="text-[#FF3B30]">{profile.availability}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Services & Skills Chips (5 cols) */}
        <div className="lg:col-span-5 space-y-12">
          {/* Services List */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.08] pb-2 flex items-center justify-between">
                <span>SERVICES & DISCIPLINES</span>
                <span className="text-[#FF3B30] font-mono text-[10px]">
                  {services.length}
                </span>
              </h4>
              <ul className="divide-y divide-white/[0.06] font-sans text-sm sm:text-base text-zinc-200">
                {services.map((svc, i) => (
                  <li
                    key={svc.name}
                    className="py-3.5 flex items-center justify-between group hover:text-white"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#FF3B30]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{svc.name}</span>
                    </span>
                    <span className="font-mono text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      +
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Chips */}
          {skills.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.08] pb-2">
                CORE PROFICIENCIES & SOFTWARE
              </h4>
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="px-3 py-1 font-mono text-xs uppercase tracking-wider text-zinc-300 bg-white/[0.03] border border-white/[0.08] hover:border-[#FF3B30]/50 transition-colors"
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
