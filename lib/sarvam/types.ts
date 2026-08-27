export interface SarvamCreateJobRequest {
  src_lang: string;
  target_langs: string[];
  export_options?: ("video" | "audio" | "srt")[];
  editor_flow?: boolean;
  voice_cloning?: boolean;
  num_speakers?: number;
  disable_watermark?: boolean;
}

export interface SarvamCreateJobResponse {
  job_id: string;
  upload_url: string;
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

export interface SarvamLiveStatusResponse {
  job_id: string;
  status: SarvamJobStatus;
  progress?: number;
  current_step?: string;
  current_step_label?: string;
  error_code?: string;
  error_message?: string;
  message?: string;
}

export type SarvamExportType = "video" | "audio" | "srt";
export type SarvamExportStatus = "pending" | "in_progress" | "completed" | "failed";

export interface SarvamExportItem {
  id: string;
  export_type: SarvamExportType;
  target_language: string;
  status: SarvamExportStatus;
  download_url?: string;
  is_stale?: boolean;
  error_message?: string;
}

export interface SarvamExportStatusResponse {
  status: string;
  message?: string;
  data: {
    exports: SarvamExportItem[];
  };
}
