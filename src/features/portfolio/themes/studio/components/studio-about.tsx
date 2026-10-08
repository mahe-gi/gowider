import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface StudioAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function StudioAbout({ profile, services, skills }: StudioAboutProps) {
  return (
    <section
      id="about"
      data-testid="studio-about"
      className="py-20 sm:py-28 border-b border-white/[0.08]"
    >
      {/* Section Header */}
      <div className="mb-14 sm:mb-20 flex items-baseline justify-between border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-[#2997FF]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-300">
            [ ABOUT &amp; SERVICES ]
          </h2>
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          {profile.location || "AVAILABLE WORLDWIDE"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Studio Overview & Bio (6 cols) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[#2997FF]">
              ABOUT
            </span>
            <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-tight text-white leading-snug">
              {profile.headline}
            </h3>
          </div>

          <div className="font-sans text-base sm:text-lg text-zinc-300 leading-relaxed space-y-4 whitespace-pre-line">
            {profile.bio ||
              "Specialized studio crafting high-impact visual narratives, color pipelines, and motion sequences."}
          </div>

          {/* Operational Metrics */}
          <div className="pt-6 border-t border-white/[0.08] grid grid-cols-2 gap-6 font-mono text-xs">
            <div>
              <span className="text-zinc-500 block mb-1">LOCATION:</span>
              <span className="text-zinc-200">{profile.location || "Remote / Global"}</span>
            </div>
            <div>
              <span className="text-zinc-500 block mb-1">STATUS:</span>
              <span className="text-[#2997FF]">
                {profile.availability || "Available for Work"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Services Cards & Skills (6 cols) */}
        <div className="lg:col-span-6 space-y-12">
          {/* Services Cards */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.08] pb-2 flex items-center justify-between">
                <span>SERVICES</span>
                <span className="text-[#2997FF]">{services.length} SERVICES</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((svc, i) => (
                  <div
                    key={svc.name}
                    className="p-4 border border-white/[0.08] bg-[#0E0E0E] hover:border-[#2997FF]/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                      <span>0{i + 1}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2997FF]/60" />
                    </div>
                    <div className="font-sans text-sm font-semibold text-zinc-200">
                      {svc.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Skills Badges */}
          {skills.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-mono text-xs uppercase tracking-widest text-zinc-400 border-b border-white/[0.08] pb-2">
                TOOLS &amp; SOFTWARE
              </h4>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="px-3 py-1 font-mono text-xs uppercase tracking-wider text-zinc-300 bg-[#0E0E0E] border border-white/[0.08] hover:border-[#2997FF] hover:text-white transition-colors"
                  >
                    <span className="text-[#2997FF] mr-1.5">▪</span>
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
