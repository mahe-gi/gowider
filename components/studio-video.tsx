"use client";

import { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, RefreshCw } from "lucide-react";

interface StudioVideoProps {
  src: string;
  fileName?: string;
  durationSeconds?: number;
  onReplaceVideo?: () => void;
}

export function StudioVideo({
  src,
  fileName,
  durationSeconds,
  onReplaceVideo,
}: StudioVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  function togglePlay() {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }

  function handleTimeUpdate() {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  return (
    <div className="relative w-full max-w-sm mx-auto flex flex-col items-center">
      {/* Video Container */}
      <div className="relative w-full aspect-[9/16] rounded-3xl overflow-hidden bg-[#0A0A0A] border border-[#121212]/15 shadow-xl group">
        <video
          ref={videoRef}
          src={src}
          playsInline
          loop
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Play Overlay */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-opacity"
          >
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs font-mono">
          <div className="flex items-center gap-2">
            <button onClick={togglePlay} className="p-1 hover:text-[#FF552E] transition-colors cursor-pointer">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <span>
              {formatTime(currentTime)} / {formatTime(durationSeconds || 0)}
            </span>
          </div>

          <button onClick={toggleMute} className="p-1 hover:text-[#FF552E] transition-colors cursor-pointer">
            {isMuted ? <VolumeX className="w-4 h-4 text-[#FF552E]" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Meta Footer & Replace Option */}
      <div className="w-full mt-3 flex items-center justify-between px-2 text-xs text-[#55524C]">
        <span className="truncate max-w-[180px] font-medium" title={fileName}>
          {fileName || "Uploaded Reel"}
        </span>
        {onReplaceVideo && (
          <button
            onClick={onReplaceVideo}
            className="flex items-center gap-1 text-[#FF441F] hover:underline font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Replace Reel</span>
          </button>
        )}
      </div>
    </div>
  );
}
