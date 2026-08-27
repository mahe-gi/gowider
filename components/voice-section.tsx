import { Mic } from "lucide-react";

export function VoiceSection() {
  return (
    <section className="py-20 bg-[#FAF8F5] border-t border-[#121212]/05">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF441F] font-bold">
              Voice & Identity Preservation
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#111111] leading-tight">
              Still sounds like you.
            </h2>
            <p className="text-base text-[#55524C] leading-relaxed">
              Localize your message without turning your content into a robotic voice-over. GoWider preserves your vocal identity, cadence, and emotion across every Indian language.
            </p>
          </div>

          <div className="lg:col-span-6 p-8 rounded-3xl bg-white border border-[#121212]/10 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F]">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111]">Multi-Track Voice Synchronization</p>
                <p className="text-xs text-[#8C877D]">Neural Voice & Cadence Matching</p>
              </div>
            </div>

            {/* Simulated Multi-Track Waveforms */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-[#55524C]">
                  <span>Telugu (Original Voice)</span>
                  <span>100% match</span>
                </div>
                <div className="h-2 w-full bg-[#EAE6DD] rounded-full overflow-hidden">
                  <div className="h-full bg-[#111111] w-full rounded-full" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-[#55524C]">
                  <span>Hindi (Voice Preserved)</span>
                  <span>Preserved timbre</span>
                </div>
                <div className="h-2 w-full bg-[#EAE6DD] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF441F] w-full rounded-full animate-pulse" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-[#55524C]">
                  <span>Tamil (Voice Preserved)</span>
                  <span>Preserved timbre</span>
                </div>
                <div className="h-2 w-full bg-[#EAE6DD] rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF7A00] w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
