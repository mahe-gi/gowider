import { Volume2, Sparkle, ArrowRight, Disc3 } from "lucide-react";

export function ExpansionSection() {
  const languageTracks = [
    {
      code: "hi-IN",
      name: "Hindi",
      native: "हिन्दी",
      color: "#FF441F",
      gradient: "from-[#FF441F]/15 to-transparent",
      borderColor: "border-[#FF441F]/30",
      waveform: [40, 75, 90, 60, 85, 95, 70, 45, 80, 65, 90, 50, 75, 95, 60, 40],
      sampleText: "आज के समय में कंटेंट की पहुंच बहुत ज़रूरी है।",
      spec: "1080p MP4 + SRT",
    },
    {
      code: "ta-IN",
      name: "Tamil",
      native: "தமிழ்",
      color: "#FF6B00",
      gradient: "from-[#FF6B00]/15 to-transparent",
      borderColor: "border-[#FF6B00]/30",
      waveform: [50, 65, 80, 95, 60, 75, 90, 70, 85, 60, 75, 90, 65, 80, 55, 45],
      sampleText: "இன்றைய காலகட்டத்தில் படைப்பாளிகளுக்கு ரீச் மிகவும் முக்கியமானது.",
      spec: "1080p MP4 + SRT",
    },
    {
      code: "kn-IN",
      name: "Kannada",
      native: "ಕನ್ನಡ",
      color: "#D9381E",
      gradient: "from-[#D9381E]/15 to-transparent",
      borderColor: "border-[#D9381E]/30",
      waveform: [35, 70, 85, 65, 90, 80, 60, 95, 75, 85, 60, 90, 70, 85, 50, 40],
      sampleText: "ಇಂದಿನ ದಿನಗಳಲ್ಲಿ ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್‌ಗಳಿಗೆ ರೀಚ್ ಬಹಳ ಮುಖ್ಯ.",
      spec: "1080p MP4 + SRT",
    },
  ];

  return (
    <section
      id="transformation"
      className="relative py-20 md:py-28 bg-[#FAF8F5] border-t border-[#121212]/08 overflow-hidden scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header (Leads directly with approved copy; No 'Expansion Engine' label) */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] leading-tight">
            Made once. <br />
            <span className="font-serif italic font-normal text-[#FF441F]">
              Understood everywhere.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#55524C] max-w-xl mx-auto leading-relaxed font-normal">
            One creator video splits into synchronized language streams with your voice identity preserved across every edition.
          </p>
        </div>

        {/* Continuous Signal Ribbon & Waveform Tracks (Zero cards, zero phone mockups) */}
        <div className="relative max-w-5xl mx-auto">
          {/* Signal Branching Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Node: Single Master Source Stream */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-6 rounded-3xl bg-[#111111] text-white space-y-5 shadow-lg border border-[#121212]/20">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-[10px] font-mono font-bold bg-[#FF441F] text-white rounded-full">
                    MASTER INPUT
                  </span>
                  <span className="text-xs font-mono text-white/60">00:42</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xl font-bold tracking-tight">1 Original Reel</p>
                  <p className="text-xs font-mono text-white/70">Telugu Creator Voice</p>
                </div>

                {/* Source Waveform Bar */}
                <div className="h-10 w-full bg-white/10 rounded-2xl flex items-center justify-between px-3 gap-1">
                  {[60, 85, 45, 90, 70, 95, 65, 80, 50, 90, 75, 85, 60, 95, 70, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#FF441F] rounded-full"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-white/60 font-mono">
                  <span>Single Upload</span>
                  <span>MP4 Master</span>
                </div>
              </div>
            </div>

            {/* Center: Signal Split Branching Indicator */}
            <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center space-y-4 text-[#FF441F]">
              <div className="w-8 h-[2px] bg-[#FF441F]/30" />
              <ArrowRight className="w-6 h-6 text-[#FF441F]" />
              <div className="w-8 h-[2px] bg-[#FF441F]/30" />
            </div>

            {/* Right: Parallel Language Signal Tracks */}
            <div className="lg:col-span-7 space-y-4">
              {languageTracks.map((track) => (
                <div
                  key={track.code}
                  className={`p-5 rounded-2xl bg-white border ${track.borderColor} shadow-xs hover:shadow-md transition-all duration-200 space-y-3`}
                >
                  {/* Track Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="text-sm font-bold text-[#111111]">{track.name} Track</span>
                    </div>
                    <span className="text-xl font-serif font-bold italic" style={{ color: track.color }}>
                      {track.native}
                    </span>
                  </div>

                  {/* Subtitle Snippet */}
                  <p className="text-xs font-serif italic text-[#55524C] leading-snug">
                    &ldquo;{track.sampleText}&rdquo;
                  </p>

                  {/* Acoustic Waveform & Format Metadata */}
                  <div className="flex items-center justify-between gap-4 pt-1 border-t border-[#121212]/05 text-[11px] font-mono text-[#8C877D]">
                    {/* Mini Waveform Ribbon */}
                    <div className="flex items-center gap-0.5 h-4 flex-1 max-w-[200px]">
                      {track.waveform.map((h, i) => (
                        <div
                          key={i}
                          className="w-1 rounded-full opacity-80"
                          style={{ height: `${h}%`, backgroundColor: track.color }}
                        />
                      ))}
                    </div>

                    <span className="shrink-0">{track.spec}</span>
                    <span className="shrink-0 text-[#111111] font-semibold">Voice Preserved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
