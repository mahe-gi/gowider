import "server-only";
import { sarvamFetch } from "./client";
import type {
  SarvamCreateJobRequest,
  SarvamCreateJobResponse,
  SarvamLiveStatusResponse,
  SarvamExportStatusResponse,
} from "./types";

export async function createDubbingJob(params: {
  sourceLanguage: string;
  targetLanguages: string[];
}): Promise<SarvamCreateJobResponse> {
  const payload: SarvamCreateJobRequest = {
    src_lang: params.sourceLanguage,
    target_langs: params.targetLanguages,
    export_options: ["video", "srt"],
    editor_flow: false,
    voice_cloning: true,
    num_speakers: -1,
    disable_watermark: true,
  };

  const response = await sarvamFetch<any>("/dubbing/jobs", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const job_id = response.data?.job_id || response.job_id;
  const upload_url = response.data?.upload_url || response.upload_url;

  if (!job_id || !upload_url) {
    throw new Error(`Invalid response from Sarvam job creation: ${JSON.stringify(response)}`);
  }

  return {
    job_id,
    upload_url,
    message: response.message,
  };
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

export async function startDubbingJob(jobId: string): Promise<{ status: string; message?: string }> {
  return sarvamFetch<{ status: string; message?: string }>(`/dubbing/jobs/${jobId}/start`, {
    method: "POST",
  });
}

export async function getDubbingLiveStatus(jobId: string): Promise<SarvamLiveStatusResponse> {
  return sarvamFetch<SarvamLiveStatusResponse>(`/dubbing/jobs/${jobId}/live-status`, {
    method: "GET",
  });
}

export async function getDubbingExportStatus(jobId: string): Promise<SarvamExportStatusResponse> {
  return sarvamFetch<SarvamExportStatusResponse>(`/dubbing/jobs/${jobId}/export-status?limit=100`, {
    method: "GET",
  });
}
