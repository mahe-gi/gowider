"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { ProcessingStatus } from "@/components/processing-status";
import { ResultStudio } from "@/components/result-studio";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ProjectStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);

  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        throw new Error("Failed to load project details.");
      }
      const data = await res.json();
      if (data.success) {
        setProjectData(data.data);
      }
    } catch (err: any) {
      console.error("Fetch project error:", err);
      setError(err.message || "Failed to load project.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProject();

    // Poll every 5 seconds if status is non-terminal
    const interval = setInterval(() => {
      if (
        projectData?.status === "processing" ||
        projectData?.status === "draft" ||
        projectData?.status === "ready"
      ) {
        fetchProject();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, projectData?.status]);

  async function handleRetryLanguage(language: string) {
    setIsRetrying(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguages: [language],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || `Failed to retry ${language}.`);
      }

      await fetchProject();
    } catch (err: any) {
      console.error("Retry error:", err);
      alert(err.message || "Failed to retry generation.");
    } finally {
      setIsRetrying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF441F]" />
          <p className="text-sm font-medium text-[#55524C]">Loading Studio…</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
          <p className="text-base font-semibold text-[#111111]">{error || "Project not found."}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#111111] text-white text-sm font-semibold hover:bg-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing =
    projectData.status === "processing" ||
    projectData.status === "draft" ||
    projectData.status === "ready";

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55524C] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Studio</span>
          </Link>
        </div>

        {/* Dynamic Studio Views */}
        {isProcessing ? (
          <ProcessingStatus
            status={projectData.status}
            currentStepLabel={projectData.latestRun?.currentStepLabel}
            progress={projectData.latestRun?.progress}
            targetLanguages={projectData.targetLanguages || []}
          />
        ) : (
          <ResultStudio
            projectId={projectData.id}
            sourcePreviewUrl={projectData.sourcePreviewUrl}
            sourceLanguage={projectData.sourceLanguage}
            outputs={projectData.outputs || []}
            onRetryLanguage={handleRetryLanguage}
            isRetrying={isRetrying}
          />
        )}
      </main>
    </div>
  );
}
