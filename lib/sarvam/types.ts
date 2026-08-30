export interface SarvamCreateJobRequest {
  src_lang: string;
  target_langs: string[];
  export_options?: ("video" | "audio" | "srt")[];
  editor_flow?: boolean;
  voice_cloning?: boolean;
  num_speakers?: number;
  disable_watermark?: boolean;
  translation_mode?: "code-mixed" | "modern-colloquial" | "formal";
  model?: string;
  tts_engine?: string;
  voice_cloning_engine?: string;
}

export interface SarvamCreateJobResult {
  jobId: string;
  uploadUrl: string;
  srtUploadUrl?: string;
  message?: string;
}

export type SarvamJobStatus =
  | "not_started"
  | "queued"
  | "in_progress"
  | "completed"
  | "partial_failure"
  | "failed"
  | "deleted";

export interface SarvamStartJobResult {
  status: string;
  message?: string;
  taskSubmitted?: boolean;
}

export interface SarvamLiveStatusResult {
  jobId: string;
  status: SarvamJobStatus;
  progress: number;
  currentStep?: string;
  currentStepLabel?: string;
  errorCode?: string;
  errorMessage?: string;
  exports?: SarvamExportItem[];
}

export type SarvamExportType = "video" | "audio" | "srt";
export type SarvamExportStatus = "pending" | "in_progress" | "completed" | "failed";

export interface SarvamExportItem {
  id: string;
  exportType: SarvamExportType;
  targetLanguage: string;
  status: SarvamExportStatus;
  downloadUrl?: string;
  errorMessage?: string;
}

export interface SarvamExportStatusResult {
  exports: SarvamExportItem[];
  message?: string;
}
