"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { TransformationSection } from "@/components/transformation-section";
import { HowItWorks } from "@/components/how-it-works";
import { VoiceSection } from "@/components/voice-section";
import { LanguageMarquee } from "@/components/language-marquee";
import { Footer } from "@/components/footer";
import { AuthSheet } from "@/components/auth-sheet";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { data: session } = useSession();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  function handleCtaClick() {
    if (!session?.user?.id) {
      setIsAuthOpen(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      {/* Top Navigation */}
      <Navigation onOpenAuth={() => setIsAuthOpen(true)} />

      {/* Hero Section */}
      <Hero />

      {/* Product Transformation Showcase */}
      <TransformationSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Voice Preservation Section */}
      <VoiceSection />

      {/* Supported Languages Marquee */}
      <LanguageMarquee />

      {/* Final Call to Action Section */}
      <section className="py-20 bg-[#111111] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#FF552E] text-xs font-semibold">
            <span>Ready to Go Wider?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Stop recording in multiple languages. <br />
            <span className="font-serif italic font-normal text-[#FF552E]">Let GoWider do it.</span>
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
            Reach Hindi, Tamil, Telugu, and Kannada audiences with your original voice timbre and emotion.
          </p>

          <div className="pt-4 flex justify-center">
            {session?.user?.id ? (
              <Link
                href="/studio/new"
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#FF441F] hover:bg-[#E63814] rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Open Creator Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#FF441F] hover:bg-[#E63814] rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <span>Get Started with Google</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthSheet
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        callbackUrl="/dashboard"
      />
    </div>
  );
}
