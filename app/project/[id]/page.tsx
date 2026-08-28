"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ProcessingStatus } from "@/components/processing-status";
import { ResultStudio } from "@/components/result-studio";
import { DeleteReelDialog } from "@/components/delete-reel-dialog";
import { ArrowLeft, Loader2, WifiOff, Trash2, AlertTriangle } from "lucide-react";

export default function ProjectStudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveErrorsRef = useRef(0);
  const latestRunStatusRef = useRef<string | null>(null);

  // Helper to determine if a run is actively processing
  const isActiveRun = useCallback((status?: string) => {
    return status === "queued" || status === "uploading_to_sarvam" || status === "processing" || status === "exporting";
  }, []);

  const fetchProject = useCallback(async (isBackgroundPoll = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        // Clear any pending poll timer on fatal or client errors
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

        if (res.status === 401) {
          router.push(`/api/auth/signin?callbackUrl=/project/${projectId}`);
          return;
        }

        if (res.status === 403) {
          setError("You do not have permission to view this Reel.");
          return;
        }

        if (res.status === 404) {
          setError("That Reel isn't here.");
          return;
        }

        if (res.status === 429) {
          // Respect Retry-After header if present
          const retryAfterHeader = res.headers.get("Retry-After");
          let delayMs = 30000;
          if (retryAfterHeader) {
            const parsedSeconds = parseInt(retryAfterHeader, 10);
            if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
              delayMs = parsedSeconds * 1000;
            } else {
              const parsedDate = Date.parse(retryAfterHeader);
              if (!isNaN(parsedDate)) {
                delayMs = Math.max(parsedDate - Date.now(), 5000);
              }
            }
          }
          if (isActiveRun(latestRunStatusRef.current ?? undefined)) {
            scheduleNextPoll(delayMs);
          }
          return;
        }

        throw new Error("Unable to load this Reel. Please try again.");
      }

      const data = await res.json();
      if (data.success && data.data) {
        setProjectData(data.data);
        setError(null);
        consecutiveErrorsRef.current = 0;
        latestRunStatusRef.current = data.data.latestRun?.status || null;

        // Schedule next poll if generation is active and tab is visible and online
        if (
          isActiveRun(data.data.latestRun?.status) &&
          typeof document !== "undefined" &&
          document.visibilityState === "visible" &&
          (typeof navigator === "undefined" || navigator.onLine)
        ) {
          scheduleNextPoll(10000);
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;

      console.error("Fetch project error:", err.message);
      consecutiveErrorsRef.current += 1;

      if (!isBackgroundPoll) {
        setError(err.message || "Unable to load this Reel.");
      } else {
        // Exponential backoff for network/5xx background errors (15s -> 30s -> 60s max)
        const backoffMs = Math.min(15000 * Math.pow(2, consecutiveErrorsRef.current - 1), 60000);
        if (isActiveRun(latestRunStatusRef.current ?? undefined)) {
          scheduleNextPoll(backoffMs);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router, isActiveRun]);

  function scheduleNextPoll(delayMs: number) {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = setTimeout(() => {
      fetchProject(true);
    }, delayMs);
  }

  // Effect: Initial fetch and visibility / online listeners
  useEffect(() => {
    setIsOffline(typeof navigator !== "undefined" ? !navigator.onLine : false);
    fetchProject();

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        // Immediate refresh when user switches back to tab
        fetchProject(true);
      } else {
        // Pause background polling while tab is hidden
        if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      }
    }

    function handleOnline() {
      setIsOffline(false);
      fetchProject(true);
    }

    function handleOffline() {
      setIsOffline(true);
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [fetchProject]);

  async function handleRetryLanguage(language: string) {
    setIsRetrying(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguages: [language] }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || `Failed to retry ${language}.`);
      }

      await fetchProject();
    } catch (err: any) {
      console.error("Retry error:", err);
      setActionError(err.message || "Failed to retry generation.");
    } finally {
      setIsRetrying(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
        <Navigation variant="app" />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-8 animate-pulse">
          <div className="h-6 w-32 bg-[#EADCC9]/50 rounded-full" />
          <div className="h-96 rounded-3xl bg-white/70 border border-[#121212]/05 p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF441F]" />
            <p className="text-sm font-medium text-[#55524C]">Loading Studio…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
        <Navigation variant="app" />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F] mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[#111111]">{error || "That Reel isn't here."}</h2>
            <p className="text-xs text-[#55524C]">The project may have been deleted or does not exist.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111111] text-white text-xs font-semibold hover:bg-[#222222] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isProcessing =
    projectData.status === "processing" ||
    projectData.status === "uploading" ||
    isActiveRun(projectData.latestRun?.status);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5]">
      <Navigation variant="app" />

      {/* Network Offline Banner */}
      {isOffline && (
        <div className="bg-[#FFF7ED] border-b border-[#FED7AA] px-4 py-2 text-center text-xs font-medium text-[#EA580C] flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Connection lost. We&apos;ll reconnect automatically once you&apos;re back online.</span>
        </div>
      )}

      {/* Action Error Notification */}
      {actionError && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-xs text-[#DC2626] font-medium">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-[#DC2626] hover:text-[#991B1B] font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header Breadcrumb & Options */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55524C] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          {!isProcessing && (
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8C877D] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Reel</span>
            </button>
          )}
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

      {/* Delete Confirmation Dialog */}
      <DeleteReelDialog
        isOpen={isDeleteDialogOpen}
        projectId={projectData.id}
        reelName={projectData.displayName || "this Reel"}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDeleted={() => {
          router.push("/projects");
        }}
      />

      <Footer />
    </div>
  );
}
