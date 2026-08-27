"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Hero } from "@/components/hero";
import { TransformationSection } from "@/components/transformation-section";
import { UploadZone } from "@/components/upload-zone";
import { StudioVideo } from "@/components/studio-video";
import { LanguageSelector } from "@/components/language-selector";
import { GenerationSummary } from "@/components/generation-summary";
import { HowItWorks } from "@/components/how-it-works";
import { VoiceSection } from "@/components/voice-section";
import { LanguageMarquee } from "@/components/language-marquee";
import { Footer } from "@/components/footer";
import { AuthSheet } from "@/components/auth-sheet";
import { CreditSheet } from "@/components/credit-sheet";
import { LanguageCode } from "@/lib/constants";

export default function LandingPage() {
  const router = useRouter();

  // Project state
  const [activeProject, setActiveProject] = useState<{
    projectId: string;
    sourcePreviewUrl: string;
    durationSeconds: number;
    fileName: string;
    fileSizeBytes: number;
  } | null>(null);

  // Studio configuration
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("te-IN");
  const [targetLanguages, setTargetLanguages] = useState<LanguageCode[]>(["hi-IN", "ta-IN", "kn-IN"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User & Wallet state
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<{ balancePaise: number; availablePaise: number } | null>(null);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [creditModalData, setCreditModalData] = useState<{
    requiredPaise: number;
    availablePaise: number;
    generationRunId?: string;
  }>({ requiredPaise: 0, availablePaise: 0 });

  // Fetch session & wallet info
  useEffect(() => {
    async function checkAuthAndWallet() {
      try {
        const walletRes = await fetch("/api/wallet");
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          if (walletData.success) {
            setWallet(walletData.data);
            setUser({ name: "Creator" }); // Authenticated
            // Automatically merge any guest project
            await fetch("/api/auth/guest-merge", { method: "POST" });
          }
        }
      } catch {
        // Guest user
      }
    }
    checkAuthAndWallet();
  }, []);

  function handleUploadSuccess(data: {
    projectId: string;
    sourcePreviewUrl: string;
    durationSeconds: number;
    fileName: string;
    fileSizeBytes: number;
  }) {
    setActiveProject(data);
    const studioElement = document.getElementById("studio");
    studioElement?.scrollIntoView({ behavior: "smooth" });
  }

  function handleTargetToggle(lang: LanguageCode) {
    if (targetLanguages.includes(lang)) {
      setTargetLanguages(targetLanguages.filter((l) => l !== lang));
    } else {
      if (targetLanguages.length < 3) {
        setTargetLanguages([...targetLanguages, lang]);
      }
    }
  }

  async function handleGenerate(confirmVoiceRights: boolean) {
    if (!activeProject) return;

    setIsSubmitting(true);
    try {
      // 1. Configure project in backend
      const configRes = await fetch(`/api/projects/${activeProject.projectId}/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguages,
          confirmVoiceRights,
        }),
      });

      const configData = await configRes.json();
      if (!configRes.ok || !configData.success) {
        throw new Error(configData.error?.message || "Failed to configure project.");
      }

      // 2. Trigger Generation
      const genRes = await fetch(`/api/projects/${activeProject.projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const genData = await genRes.json();

      if (genRes.status === 401) {
        // User needs to authenticate
        setIsAuthOpen(true);
        setIsSubmitting(false);
        return;
      }

      if (genRes.status === 402) {
        // Insufficient credits
        setCreditModalData({
          requiredPaise: genData.error?.requiredCostPaise || 0,
          availablePaise: genData.error?.availablePaise || 0,
          generationRunId: genData.error?.generationRunId,
        });
        setIsCreditOpen(true);
        setIsSubmitting(false);
        return;
      }

      if (!genRes.ok || !genData.success) {
        throw new Error(genData.error?.message || "Failed to start generation.");
      }

      // 3. Success -> Navigate to Project Status / Results Studio
      router.push(`/project/${activeProject.projectId}`);
    } catch (err: any) {
      console.error("Generate error:", err);
      alert(err.message || "Failed to start localization.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      {/* Top Navigation */}
      <Navigation
        user={user}
        walletBalancePaise={wallet?.availablePaise || 0}
        onOpenTopup={() => {
          setCreditModalData({ requiredPaise: 0, availablePaise: wallet?.availablePaise || 0 });
          setIsCreditOpen(true);
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Hero Section */}
      <Hero />

      {/* Product Transformation Showcase */}
      <TransformationSection />

      {/* Live GoWider Creator Studio Section */}
      <section id="studio" className="py-20 bg-[#F4F0E8] border-y border-[#121212]/08">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF441F] font-bold">
              Creator Studio
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Your turn.
            </h2>
            <p className="text-sm text-[#55524C]">
              Drop a Reel and choose who gets to understand it.
            </p>
          </div>

          {!activeProject ? (
            /* Upload Zone State */
            <UploadZone onUploadSuccess={handleUploadSuccess} />
          ) : (
            /* Active Studio Workspace State */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#121212]/10 shadow-xl animate-in fade-in zoom-in-95 duration-300">
              {/* Left Media Canvas */}
              <div className="lg:col-span-5 flex justify-center">
                <StudioVideo
                  src={activeProject.sourcePreviewUrl}
                  fileName={activeProject.fileName}
                  durationSeconds={activeProject.durationSeconds}
                  onReplaceVideo={() => setActiveProject(null)}
                />
              </div>

              {/* Right Configuration Controls */}
              <div className="lg:col-span-7 space-y-6">
                <LanguageSelector
                  sourceLanguage={sourceLanguage}
                  targetLanguages={targetLanguages}
                  onSourceChange={(lang) => {
                    setSourceLanguage(lang);
                    setTargetLanguages(targetLanguages.filter((l) => l !== lang));
                  }}
                  onTargetToggle={handleTargetToggle}
                />

                <GenerationSummary
                  durationSeconds={activeProject.durationSeconds}
                  targetLanguages={targetLanguages}
                  isSubmitting={isSubmitting}
                  onGenerate={handleGenerate}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Voice Cloning Identity Section */}
      <VoiceSection />

      {/* Supported Languages Marquee */}
      <LanguageMarquee />

      {/* Minimal Footer */}
      <Footer />

      {/* Modals */}
      <AuthSheet isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CreditSheet
        isOpen={isCreditOpen}
        onClose={() => setIsCreditOpen(false)}
        requiredPaise={creditModalData.requiredPaise}
        availablePaise={creditModalData.availablePaise}
        generationRunId={creditModalData.generationRunId}
        onPaymentSuccess={(newBal) => {
          setWallet((prev) => (prev ? { ...prev, availablePaise: newBal } : { balancePaise: newBal, availablePaise: newBal }));
          // If we had an active project, auto-trigger generation
          if (activeProject) {
            handleGenerate(true);
          }
        }}
      />
    </div>
  );
}
