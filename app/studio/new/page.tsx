"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { UploadZone } from "@/components/upload-zone";
import { StudioVideo } from "@/components/studio-video";
import { LanguageSelector } from "@/components/language-selector";
import { GenerationSummary } from "@/components/generation-summary";
import { CreditSheet } from "@/components/credit-sheet";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { LanguageCode } from "@/lib/constants";

export default function NewStudioPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Active Upload / Project state
  const [activeProject, setActiveProject] = useState<{
    projectId: string;
    sourcePreviewUrl: string;
    durationSeconds: number;
    fileName: string;
    fileSizeBytes: number;
  } | null>(null);

  const [studioError, setStudioError] = useState<string | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>("te-IN");
  const [targetLanguages, setTargetLanguages] = useState<LanguageCode[]>(["hi-IN", "ta-IN", "kn-IN"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wallet & Modals
  const [wallet, setWallet] = useState<{ balancePaise: number; availablePaise: number } | null>(null);
  const [isCreditOpen, setIsCreditOpen] = useState(false);
  const [creditModalData, setCreditModalData] = useState<{
    requiredPaise: number;
    availablePaise: number;
    generationRunId?: string;
  }>({ requiredPaise: 0, availablePaise: 0 });

  // Fetch wallet
  useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/wallet")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success) setWallet(data.data);
        })
        .catch(() => {});
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
        <Navigation variant="app" />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF441F]" />
          <p className="text-sm font-medium text-[#55524C]">Loading Studio…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    signIn("google", { callbackUrl: "/studio/new" });
    return null;
  }

  function handleUploadSuccess(data: {
    projectId: string;
    sourcePreviewUrl: string;
    durationSeconds: number;
    fileName: string;
    fileSizeBytes: number;
  }) {
    setActiveProject(data);
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
    setStudioError(null);
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

      if (genRes.status === 402) {
        // Insufficient credits -> Open credit sheet
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
        throw new Error(genData.error?.message || "Failed to start localization.");
      }

      // 3. Success -> Navigate to Project Workspace
      router.push(`/project/${activeProject.projectId}`);
    } catch (err: any) {
      console.error("Generate error:", err);
      setStudioError(err.message || "Failed to start localization.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation
        variant="app"
        user={session?.user}
        walletBalancePaise={wallet?.availablePaise || 0}
        onOpenTopup={() => {
          setCreditModalData({ requiredPaise: 0, availablePaise: wallet?.availablePaise || 0 });
          setIsCreditOpen(true);
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55524C] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-[#8C877D]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF441F]" />
            <span>Voice-Preserving Video Studio</span>
          </div>
        </div>

        {studioError && (
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-xs text-[#DC2626] font-medium animate-in fade-in">
            <span>{studioError}</span>
            <button
              onClick={() => setStudioError(null)}
              className="text-[#DC2626] hover:text-[#991B1B] font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Studio Workspace Content */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#FF441F] font-bold">
              Creator Studio
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Localize a new Reel.
            </h1>
            <p className="text-sm text-[#55524C]">
              Upload a short video and select up to 3 Indian languages to generate voice-preserved versions.
            </p>
          </div>

          {!activeProject ? (
            /* Upload Zone State */
            <div className="max-w-2xl mx-auto">
              <UploadZone onUploadSuccess={handleUploadSuccess} />
            </div>
          ) : (
            /* Active Studio Configuration Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-5xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-[#121212]/10 shadow-xl animate-in fade-in zoom-in-95 duration-300">
              {/* Left Media Preview */}
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
      </main>

      <Footer />

      {/* Credit Top-Up Modal */}
      <CreditSheet
        isOpen={isCreditOpen}
        onClose={() => setIsCreditOpen(false)}
        requiredPaise={creditModalData.requiredPaise}
        availablePaise={creditModalData.availablePaise}
        generationRunId={creditModalData.generationRunId}
        onPaymentSuccess={(newBal) => {
          setWallet((prev) => (prev ? { ...prev, availablePaise: newBal } : { balancePaise: newBal, availablePaise: newBal }));
          if (activeProject) {
            router.push(`/project/${activeProject.projectId}`);
          }
        }}
      />
    </div>
  );
}
