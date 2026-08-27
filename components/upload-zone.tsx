"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, Film, AlertCircle, Loader2 } from "lucide-react";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_MB, MAX_DURATION_SECONDS } from "@/lib/constants";

interface UploadZoneProps {
  onUploadSuccess: (data: {
    projectId: string;
    sourcePreviewUrl: string;
    durationSeconds: number;
    fileName: string;
    fileSizeBytes: number;
  }) => void;
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  async function validateAndUploadFile(file: File) {
    setErrorMessage(null);

    // 1. Validate MIME type
    if (file.type !== "video/mp4" && file.type !== "video/quicktime") {
      setErrorMessage("Unsupported format. Please upload an MP4 or MOV video file.");
      return;
    }

    // 2. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    // 3. Inspect Video Duration in Browser for fast UI feedback
    setStatusMessage("Checking video duration…");
    const videoUrl = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.src = videoUrl;

    const duration: number = await new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve(videoElement.duration);
      };
      videoElement.onerror = () => {
        resolve(0);
      };
    });

    if (duration > MAX_DURATION_SECONDS) {
      setErrorMessage(
        `This Reel is ${formatTime(duration)}. For GoWider, videos must be up to 1:30 (90 seconds).`
      );
      URL.revokeObjectURL(videoUrl);
      setStatusMessage(null);
      return;
    }

    // 4. Start Upload Flow
    setIsUploading(true);
    setStatusMessage("Preparing secure direct upload…");
    setUploadProgress(10);

    try {
      // Step A: Request Presigned Target from Backend
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        }),
      });

      const presignData = await presignRes.json();
      if (!presignRes.ok || !presignData.success) {
        throw new Error(presignData.error?.message || "Failed to initiate upload.");
      }

      const { projectId, uploadUrl } = presignData.data;

      // Step B: Upload Direct to Private Storage
      setStatusMessage("Uploading directly to storage…");
      setUploadProgress(30);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 60) + 30;
            setUploadProgress(Math.min(90, percent));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Storage upload rejected with status ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error occurred during direct upload."));
        xhr.send(file);
      });

      // Step C: Confirm Upload to Backend (Server performs fail-closed media atom verification)
      setStatusMessage("Verifying upload integrity on server…");
      setUploadProgress(95);

      const completeRes = await fetch("/api/uploads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });

      const completeData = await completeRes.json();
      if (!completeRes.ok || !completeData.success) {
        throw new Error(completeData.error?.message || "Failed to verify video on server.");
      }

      if (!completeData.data?.durationSeconds) {
        throw new Error("Server failed to return verified video duration.");
      }

      const verifiedDuration = completeData.data.durationSeconds;

      setUploadProgress(100);
      setStatusMessage("Upload verified! Loading Creator Studio…");

      // Transition to Studio Workspace
      onUploadSuccess({
        projectId,
        sourcePreviewUrl: videoUrl,
        durationSeconds: verifiedDuration,
        fileName: file.name,
        fileSizeBytes: file.size,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(err.message || "Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
      setStatusMessage(null);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndUploadFile(files[0]);
    }
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndUploadFile(files[0]);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer overflow-hidden ${
          isDragging
            ? "border-[#FF441F] bg-[#FFF5F2] scale-[1.01]"
            : "border-[#121212]/15 hover:border-[#121212]/30 bg-white/80 hover:bg-white shadow-sm"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF1EE] flex items-center justify-center text-[#FF441F]">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-[#111111]">{statusMessage || "Uploading Reel…"}</p>
              <div className="w-48 sm:w-64 h-2 mx-auto bg-[#EAE6DD] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF441F] transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs font-mono text-[#8C877D]">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FFF1EE] border border-[#FF441F]/15 flex items-center justify-center text-[#FF441F] shadow-2xs group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-[#111111]">
                Drop your Reel here
              </h3>
              <p className="text-sm text-[#55524C]">or click to browse from your device</p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-[#8C877D] bg-[#F4F0E8] rounded-full">
              <Film className="w-3.5 h-3.5" />
              <span>MP4 or MOV · Max 100 MB · Up to 90 seconds</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] text-sm flex items-start gap-3 shadow-2xs animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upload issue</p>
            <p className="text-xs sm:text-sm text-[#B91C1C] mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
