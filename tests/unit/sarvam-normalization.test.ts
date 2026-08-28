import { describe, it, expect } from "vitest";
import {
  normalizeCreateJobResponse,
  normalizeStartJobResponse,
  normalizeLiveStatusResponse,
  normalizeExportStatusResponse,
  normalizeExportItems,
} from "@/lib/sarvam/dubbing";

describe("Sarvam API Response Normalization", () => {
  it("normalizes create-job response from envelope", () => {
    const rawEnvelope = {
      status: "success",
      message: "Upload job created successfully",
      data: {
        job_id: "job_12345_test",
        upload_url: "https://storage.blob.core.windows.net/test-upload-url",
        srt_upload_url: "https://storage.blob.core.windows.net/test-srt-url",
        processing_started: false,
      },
    };

    const normalized = normalizeCreateJobResponse(rawEnvelope);
    expect(normalized).toEqual({
      jobId: "job_12345_test",
      uploadUrl: "https://storage.blob.core.windows.net/test-upload-url",
      srtUploadUrl: "https://storage.blob.core.windows.net/test-srt-url",
      message: "Upload job created successfully",
    });
  });

  it("normalizes start-job response from envelope", () => {
    const rawEnvelope = {
      status: "success",
      message: "Project started successfully",
      data: {
        project_id: "job_12345_test",
        status: "queued",
        task_submitted: true,
      },
    };

    const normalized = normalizeStartJobResponse(rawEnvelope);
    expect(normalized).toEqual({
      status: "queued",
      message: "Project started successfully",
      taskSubmitted: true,
    });
  });

  it("normalizes live-status 'queued' fixture", () => {
    const raw = {
      status: "success",
      message: "Live status retrieved successfully",
      data: {
        job_id: "job_test_queued",
        job_name: null,
        status: "queued",
        current_step: "queued",
        current_step_label: "Queued",
        progress: 0,
        export: null,
        exports: null,
        error_message: null,
      },
    };

    const normalized = normalizeLiveStatusResponse(raw);
    expect(normalized.status).toBe("queued");
    expect(normalized.progress).toBe(0);
    expect(normalized.currentStep).toBe("queued");
    expect(normalized.currentStepLabel).toBe("Queued");
  });

  it("normalizes live-status 'in_progress' fixture", () => {
    const raw = {
      status: "success",
      message: "Live status retrieved successfully",
      data: {
        job_id: "job_test_progress",
        job_name: null,
        status: "in_progress",
        current_step: "dubbing",
        current_step_label: "Localizing voices and emotion",
        progress: 52,
        export: null,
        exports: null,
        error_message: null,
      },
    };

    const normalized = normalizeLiveStatusResponse(raw);
    expect(normalized.status).toBe("in_progress");
    expect(normalized.progress).toBe(52);
    expect(normalized.currentStep).toBe("dubbing");
    expect(normalized.currentStepLabel).toBe("Localizing voices and emotion");
  });

  it("normalizes live-status 'completed' fixture", () => {
    const raw = {
      status: "success",
      message: "Live status retrieved successfully",
      data: {
        job_id: "b8f4aa4c-388b-4001-a4c3-d311b4077cb1",
        job_name: null,
        status: "completed",
        current_step: "completed",
        current_step_label: "Completed",
        progress: 100,
        export: null,
        exports: [],
        error_message: null,
      },
    };

    const normalized = normalizeLiveStatusResponse(raw);
    expect(normalized.status).toBe("completed");
    expect(normalized.progress).toBe(100);
    expect(normalized.currentStep).toBe("completed");
    expect(normalized.currentStepLabel).toBe("Completed");
  });

  it("normalizes live-status 'failed' fixture with error code and message", () => {
    const raw = {
      status: "success",
      message: "Live status retrieved successfully",
      data: {
        job_id: "job_test_failed",
        status: "failed",
        error_code: "UNSUPPORTED_AUDIO_FORMAT",
        error_message: "Audio stream in video could not be decoded.",
        progress: 15,
      },
    };

    const normalized = normalizeLiveStatusResponse(raw);
    expect(normalized.status).toBe("failed");
    expect(normalized.errorCode).toBe("UNSUPPORTED_AUDIO_FORMAT");
    expect(normalized.errorMessage).toBe("Audio stream in video could not be decoded.");
  });

  it("normalizes export-status envelope fixture", () => {
    const raw = {
      status: "success",
      message: "Export statuses retrieved successfully",
      data: {
        exports: [
          {
            id: "exp_video_hi",
            export_type: "video",
            target_language: "hi-IN",
            status: "completed",
            download_url: "https://azure-blob.net/exports/hi.mp4",
          },
          {
            id: "exp_srt_hi",
            export_type: "srt",
            target_language: "hi-IN",
            status: "completed",
            download_url: "https://azure-blob.net/exports/hi.srt",
          },
          {
            id: "exp_video_te",
            export_type: "video",
            target_language: "te-IN",
            status: "completed",
            download_url: "https://azure-blob.net/exports/te.mp4",
          },
          {
            id: "exp_srt_te",
            export_type: "srt",
            target_language: "te-IN",
            status: "completed",
            download_url: "https://azure-blob.net/exports/te.srt",
          },
        ],
      },
    };

    const normalized = normalizeExportStatusResponse(raw);
    expect(normalized.exports).toHaveLength(4);
    expect(normalized.exports[0]).toEqual({
      id: "exp_video_hi",
      exportType: "video",
      targetLanguage: "hi-IN",
      status: "completed",
      downloadUrl: "https://azure-blob.net/exports/hi.mp4",
      errorMessage: undefined,
    });
    expect(normalized.exports[2].targetLanguage).toBe("te-IN");
  });
});
