import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { HeroReelTransform } from "./hero-reel-transform";

export function Hero() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1EE] border border-[#FF441F]/20 text-[#FF441F] text-xs sm:text-sm font-semibold tracking-tight shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice-Cloned Indic AI Dubbing</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.05]">
              One reel. <br />
              <span className="font-serif italic font-normal text-[#FF441F]">Every audience.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-lg sm:text-xl text-[#55524C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Turn your Reel into Hindi, Tamil, Telugu, Kannada and more — without recording it again. Same content. Same voice. A much bigger audience.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#studio"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-[#111111] hover:bg-[#222222] rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                <span>Localize a Reel</span>
                <ArrowRight className="w-4 h-4 text-[#FF441F] group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-3.5 text-base font-medium text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 rounded-full transition-colors text-center"
              >
                See how it works
              </a>
            </div>

            {/* Limits Tagline */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#8C877D] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> MP4 / MOV
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Up to 90 seconds
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Up to 3 languages
              </span>
            </div>
          </div>

          {/* Right Hero Visual Transformation */}
          <div className="lg:col-span-5 flex justify-center">
            <HeroReelTransform />
          </div>
        </div>
      </div>
    </section>
  );
}
