import "server-only";
import { sarvamFetch } from "./client";
import type {
  SarvamCreateJobRequest,
  SarvamCreateJobResult,
  SarvamStartJobResult,
  SarvamLiveStatusResult,
  SarvamExportStatusResult,
  SarvamExportItem,
  SarvamJobStatus,
} from "./types";

/**
 * Normalizes raw Sarvam create job response into clean domain type.
 */
export function normalizeCreateJobResponse(raw: any): SarvamCreateJobResult {
  const data = raw?.data || raw || {};
  const jobId = data.job_id || data.jobId || "";
  const uploadUrl = data.upload_url || data.uploadUrl || "";
  const srtUploadUrl = data.srt_upload_url || data.srtUploadUrl;

  if (!jobId || !uploadUrl) {
    throw new Error(`Invalid Sarvam create job response: ${JSON.stringify(raw)}`);
  }

  return {
    jobId,
    uploadUrl,
    srtUploadUrl,
    message: raw?.message || data?.message,
  };
}

/**
 * Normalizes raw Sarvam start job response into clean domain type.
 */
export function normalizeStartJobResponse(raw: any): SarvamStartJobResult {
  const data = raw?.data || raw || {};
  return {
    status: data.status || raw?.status || "started",
    message: raw?.message || data?.message,
    taskSubmitted: data.task_submitted ?? true,
  };
}

/**
 * Normalizes raw export items array.
 */
export function normalizeExportItems(rawItems: any[]): SarvamExportItem[] {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((item) => ({
    id: String(item.id || item._id || ""),
    exportType: item.export_type || item.exportType || "video",
    targetLanguage: item.target_language || item.targetLanguage || "",
    status: item.status || "pending",
    downloadUrl: item.download_url || item.downloadUrl,
    errorMessage: item.error_message || item.errorMessage,
  }));
}

/**
 * Normalizes raw Sarvam live status response into clean domain type.
 */
export function normalizeLiveStatusResponse(raw: any): SarvamLiveStatusResult {
  const data = raw?.data || raw || {};
  const rawStatus = (data.status || "queued").toLowerCase();

  let status: SarvamJobStatus = "queued";
  if (rawStatus === "not_started") status = "not_started";
  else if (rawStatus === "queued") status = "queued";
  else if (rawStatus === "in_progress" || rawStatus === "processing") status = "in_progress";
  else if (rawStatus === "completed" || rawStatus === "success") status = "completed";
  else if (rawStatus === "partial_failure") status = "partial_failure";
  else if (rawStatus === "failed" || rawStatus === "error") status = "failed";
  else if (rawStatus === "deleted") status = "deleted";

  return {
    jobId: String(data.job_id || data.jobId || ""),
    status,
    progress: typeof data.progress === "number" ? Math.min(100, Math.max(0, data.progress)) : (status === "completed" ? 100 : 0),
    currentStep: data.current_step || data.currentStep,
    currentStepLabel: data.current_step_label || data.currentStepLabel || (status === "completed" ? "Completed" : "Localizing voices and emotion"),
    errorCode: data.error_code || data.errorCode,
    errorMessage: data.error_message || data.errorMessage,
    exports: data.exports ? normalizeExportItems(data.exports) : undefined,
  };
}

/**
 * Normalizes raw Sarvam export status response into clean domain type.
 */
export function normalizeExportStatusResponse(raw: any): SarvamExportStatusResult {
  const rawExports = raw?.data?.exports || raw?.exports || [];
  return {
    exports: normalizeExportItems(rawExports),
    message: raw?.message,
  };
}

export async function createDubbingJob(params: {
  sourceLanguage: string;
  targetLanguages: string[];
}): Promise<SarvamCreateJobResult> {
  const payload: SarvamCreateJobRequest = {
    src_lang: params.sourceLanguage,
    target_langs: params.targetLanguages,
    export_options: ["video", "srt"],
    editor_flow: false,
    voice_cloning: true,
    num_speakers: -1,
    disable_watermark: true,
    translation_mode: "code-mixed",
    model: "mayura:v1",
    tts_engine: "sarvam_dub_pro",
    voice_cloning_engine: "sarvam_dub_pro",
  };

  const raw = await sarvamFetch<any>("/dubbing/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeCreateJobResponse(raw);
}

export async function streamUploadToSarvam(params: {
  uploadUrl: string;
  stream: any;
  contentLength: number;
  contentType: string;
}): Promise<void> {
  // Upload to Azure SAS Blob URL with required x-ms-blob-type header
  const response = await fetch(params.uploadUrl, {
    method: "PUT",
    body: params.stream,
    headers: {
      "Content-Type": params.contentType,
      "Content-Length": params.contentLength.toString(),
      "x-ms-blob-type": "BlockBlob",
    },
    // @ts-expect-error duplex is required for streaming in Node fetch
    duplex: "half",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload to Sarvam storage: ${response.status} ${response.statusText} - ${errorText}`);
  }
}

export async function startDubbingJob(jobId: string): Promise<SarvamStartJobResult> {
  const raw = await sarvamFetch<any>(`/dubbing/jobs/${jobId}/start`, {
    method: "POST",
  });
  return normalizeStartJobResponse(raw);
}

export async function getDubbingLiveStatus(jobId: string): Promise<SarvamLiveStatusResult> {
  const raw = await sarvamFetch<any>(`/dubbing/jobs/${jobId}/live-status`, {
    method: "GET",
  });
  return normalizeLiveStatusResponse(raw);
}

export async function getDubbingExportStatus(jobId: string): Promise<SarvamExportStatusResult> {
  const raw = await sarvamFetch<any>(`/dubbing/jobs/${jobId}/export-status?limit=100`, {
    method: "GET",
  });
  return normalizeExportStatusResponse(raw);
}
