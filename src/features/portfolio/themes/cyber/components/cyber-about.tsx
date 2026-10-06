import React from "react";
import type { PublicProfile, PublicService, PublicSkill } from "../../../types";

interface CyberAboutProps {
  profile: PublicProfile;
  services: PublicService[];
  skills: PublicSkill[];
}

export function CyberAbout({
  profile,
  services,
  skills,
}: CyberAboutProps) {
  return (
    <section
      id="pipeline"
      data-testid="cyber-about"
      className="py-20 sm:py-32 border-b border-emerald-500/20 font-mono"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Practice Directive */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-none bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
            <h2 className="text-xs uppercase tracking-[0.25em] text-[#00FF88]">
              [ PIPELINE DIRECTIVE &amp; METHODOLOGY ]
            </h2>
          </div>

          <p className="text-xl sm:text-2xl text-white font-light leading-relaxed border-l-2 border-[#00FF88] pl-6 py-2 bg-emerald-950/20">
            {profile.bio || profile.headline}
          </p>

          {profile.location && (
            <div className="pt-4 text-xs uppercase tracking-widest text-zinc-500">
              PHYSICAL COMPUTE NODE: <span className="text-cyan-400">{profile.location}</span>
            </div>
          )}
        </div>

        {/* Deployable Disciplines & Pipeline */}
        <div className="lg:col-span-5 space-y-12">
          {services.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-emerald-400 border-b border-emerald-500/20 pb-3">
                DEPLOYABLE DISCIPLINES
              </h3>
              <ul className="space-y-2.5">
                {services.map((svc) => (
                  <li
                    key={svc.name}
                    className="flex items-center gap-3 text-sm text-zinc-300"
                  >
                    <span className="text-[#00FF88]">&gt;</span>
                    <span>{svc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {skills.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-cyan-400 border-b border-cyan-500/20 pb-3">
                GRAPHICS PIPELINE &amp; TOOLKIT
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="border border-cyan-500/30 bg-cyan-950/20 px-3 py-1 text-xs text-cyan-300"
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
