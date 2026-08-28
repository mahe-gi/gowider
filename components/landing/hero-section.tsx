"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Play, Volume2, CheckCircle2 } from "lucide-react";

interface HeroSectionProps {
  onOpenAuth: () => void;
}

export function HeroSection({ onOpenAuth }: HeroSectionProps) {
  const { data: session } = useSession();

  const containerRef = useRef<HTMLDivElement>(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const rafId = useRef<number | null>(null);
  const rectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  const updateRect = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      rectRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    updateRect();
    window.addEventListener("resize", updateRect);

    function animate() {
      // Spring damping interpolation (lerp factor 0.08)
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--tilt-x", (currentX.current * 3.5).toFixed(2));
        containerRef.current.style.setProperty("--tilt-y", (currentY.current * 3.5).toFixed(2));
      }

      rafId.current = requestAnimationFrame(animate);
    }

    rafId.current = requestAnimationFrame(animate);

    function handleMouseMove(e: MouseEvent) {
      if (!rectRef.current) updateRect();
      if (!rectRef.current || rectRef.current.width === 0) return;

      const relX = (e.clientX - (rectRef.current.left + rectRef.current.width / 2)) / (rectRef.current.width / 2);
      const relY = (e.clientY - (rectRef.current.top + rectRef.current.height / 2)) / (rectRef.current.height / 2);

      targetX.current = Math.max(-1, Math.min(1, relX));
      targetY.current = Math.max(-1, Math.min(1, relY));
    }

    function handleMouseLeave() {
      targetX.current = 0;
      targetY.current = 0;
    }

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", updateRect);
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", updateRect);
      if (container) {
        container.removeEventListener("mouseenter", updateRect);
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [updateRect]);

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Ambient warm lighting aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[800px] h-[350px] bg-gradient-to-b from-[#FF441F]/08 to-transparent blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Direct Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#111111] leading-[1.05]">
              One reel. <br />
              <span className="font-serif italic font-normal text-[#FF441F]">Every audience.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#55524C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Turn one Reel into multiple language versions while keeping it recognizably yours.
            </p>

            {/* Direct CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {session?.user?.id ? (
                <Link
                  href="/studio/new"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#111111] hover:bg-[#222222] rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <span>Localize a Reel</span>
                  <ArrowRight className="w-4 h-4 text-[#FF441F] group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#111111] hover:bg-[#222222] rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <span>Get Started with Google</span>
                  <ArrowRight className="w-4 h-4 text-[#FF441F] group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-6 py-4 text-base font-medium text-[#55524C] hover:text-[#111111] hover:bg-[#121212]/05 rounded-full transition-colors text-center"
              >
                See how it works
              </a>
            </div>

            {/* Spec Capabilities Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-[#8C877D] font-mono">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> MP4 / MOV
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Up to 90 seconds
              </span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> Up to 3 languages
              </span>
            </div>
          </div>

          {/* Right Column: One Master Reel + Projected Language Surfaces (No 3 phone cards) */}
          <div className="lg:col-span-5 flex justify-center w-full py-4">
            <div
              ref={containerRef}
              style={{
                perspective: "1200px",
                // @ts-expect-error custom CSS variable for zero-rerender spring tilt
                "--tilt-x": "0",
                "--tilt-y": "0",
              }}
              className="relative w-full max-w-[340px] sm:max-w-[380px] h-[440px] sm:h-[480px] flex items-center justify-center select-none"
            >
              {/* Projected Language Surface 1: Hindi (Fans Left) */}
              <div
                className="absolute left-0 top-6 w-[200px] sm:w-[220px] h-[340px] sm:h-[370px] rounded-3xl p-4 bg-gradient-to-br from-[#FF441F] to-[#991B00] text-white shadow-xl border border-white/20 -translate-x-12 sm:-translate-x-16 -rotate-12 scale-90 opacity-90 transition-transform duration-200"
                style={{
                  transform: "rotateX(calc(var(--tilt-y) * -0.6deg)) rotateY(calc(var(--tilt-x) * 0.6deg)) translateZ(-30px)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black/30 rounded-full">
                    Hindi
                  </span>
                  <span className="text-lg font-serif italic font-bold">हिन्दी</span>
                </div>
                <div className="mt-8 space-y-2 text-white/80">
                  <div className="h-1 w-12 bg-white/40 rounded-full" />
                  <p className="text-xs font-serif italic leading-snug">
                    &ldquo;आज के समय में कंटेंट की पहुंच...&rdquo;
                  </p>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[9px] font-mono text-white/60">
                  <span>Voice Preserved</span>
                  <span>9:16</span>
                </div>
              </div>

              {/* Projected Language Surface 2: Tamil (Fans Right) */}
              <div
                className="absolute right-0 top-8 w-[200px] sm:w-[220px] h-[340px] sm:h-[370px] rounded-3xl p-4 bg-gradient-to-bl from-[#FF6B00] to-[#B33E00] text-white shadow-xl border border-white/20 translate-x-12 sm:translate-x-16 rotate-12 scale-90 opacity-90 transition-transform duration-200"
                style={{
                  transform: "rotateX(calc(var(--tilt-y) * -0.6deg)) rotateY(calc(var(--tilt-x) * 0.6deg)) translateZ(-30px)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-black/30 rounded-full">
                    Tamil
                  </span>
                  <span className="text-lg font-serif italic font-bold">தமிழ்</span>
                </div>
                <div className="mt-8 space-y-2 text-white/80">
                  <div className="h-1 w-12 bg-white/40 rounded-full" />
                  <p className="text-xs font-serif italic leading-snug">
                    &ldquo;இன்றைய காலகட்டத்தில் படைப்பாளிகளுக்கு...&rdquo;
                  </p>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[9px] font-mono text-white/60">
                  <span>Voice Preserved</span>
                  <span>9:16</span>
                </div>
              </div>

              {/* Projected Language Surface 3: Kannada (Fans Bottom Center) */}
              <div
                className="absolute bottom-2 w-[190px] sm:w-[210px] h-[100px] rounded-2xl p-3 bg-gradient-to-r from-[#D9381E] to-[#7A1200] text-white shadow-lg border border-white/20 translate-y-6 scale-95 opacity-85 transition-transform duration-200"
                style={{
                  transform: "rotateX(calc(var(--tilt-y) * -0.4deg)) rotateY(calc(var(--tilt-x) * 0.4deg)) translateZ(-50px)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-white/90">Kannada</span>
                  <span className="text-base font-serif italic font-bold">ಕನ್ನಡ</span>
                </div>
                <p className="text-[10px] text-white/70 font-mono pt-1">
                  1080p Localized Edition
                </p>
              </div>

              {/* THE SINGLE DOMINANT MASTER REEL OBJECT */}
              <div
                className="relative z-20 w-[230px] sm:w-[250px] h-[370px] sm:h-[410px] rounded-3xl p-5 bg-gradient-to-b from-[#1C1B1A] to-[#0A0A0A] text-white shadow-[0_25px_60px_rgba(0,0,0,0.45)] border border-white/20 flex flex-col justify-between transition-transform duration-100"
                style={{
                  transform: "rotateX(calc(var(--tilt-y) * -1deg)) rotateY(calc(var(--tilt-x) * 1deg)) translateZ(20px)",
                }}
              >
                {/* Master Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 text-[10px] font-mono font-bold bg-[#FF441F] text-white rounded-full">
                    SOURCE MASTER
                  </span>
                  <span className="text-sm font-serif italic font-bold text-white/90">
                    తెలుగు
                  </span>
                </div>

                {/* Center Audio/Play Representation */}
                <div className="my-auto text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-mono text-white/70">Original Reel · 00:42</p>
                    <p className="text-sm font-bold tracking-tight">Telugu Master Track</p>
                  </div>
                </div>

                {/* Master Status Footnote */}
                <div className="space-y-1.5 pt-2 border-t border-white/15">
                  <div className="flex items-center justify-between text-[10px] text-white/70 font-mono">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3 h-3 text-[#FF441F]" /> Single Creator Voice
                    </span>
                    <span>9:16 HD</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden flex gap-1">
                    <div className="h-full bg-white w-2/3 rounded-full" />
                    <div className="h-full bg-white/50 flex-1 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
