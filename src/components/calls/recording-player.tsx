"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  Download,
  FileDown,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  ScrollText,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useExportTranscriptionPdf } from "@/hooks/use-transcription-export";

interface RecordingPlayerProps {
  src: string;
  recordingId?: string | null;
  durationSeconds?: number;
  transcriptText?: string | null;
  fileName?: string;
  className?: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function RecordingPlayer({
  src,
  recordingId,
  durationSeconds,
  transcriptText,
  fileName,
  className,
}: RecordingPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds ?? 0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const { exportPdf, isExporting } = useExportTranscriptionPdf(
    recordingId ?? null,
  );

  // Update duration when video metadata loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      if (video.duration && isFinite(video.duration)) {
        setTotalDuration(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIdx = rates.indexOf(playbackRate);
    const nextIdx = (currentIdx + 1) % rates.length;
    const newRate = rates[nextIdx];
    setPlaybackRate(newRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
    }
  }, [playbackRate]);

  const skipBack = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  }, []);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      const bar = progressRef.current;
      if (!video || !bar) return;

      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      video.currentTime = ratio * (totalDuration || video.duration || 0);
    },
    [totalDuration],
  );

  const handleDownload = useCallback(() => {
    const a = document.createElement("a");
    a.href = src;
    a.download =
      fileName ??
      `enregistrement-${new Date().toISOString().slice(0, 10)}.webm`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [src, fileName]);

  const progressPercent =
    totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className={cn("flex gap-4", className)}>
      {/* Video player */}
      <div
        className="relative flex-1 bg-zinc-950 rounded-xl overflow-hidden group"
        onMouseMove={resetHideTimer}
        onMouseEnter={() => setShowControls(true)}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video object-contain bg-black"
          preload="metadata"
          playsInline
          onClick={togglePlay}
        />

        {/* Overlay controls */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* Play/pause overlay center */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
            </button>
          )}

          {/* Bottom control bar */}
          <div className="relative z-10 px-4 pb-3 pt-8">
            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer mb-3 group/progress hover:h-2 transition-all"
            >
              <div
                className="h-full bg-red-500 rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                {/* Skip back 10s */}
                <button
                  onClick={skipBack}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  title="-10s"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                {/* Skip forward 10s */}
                <button
                  onClick={skipForward}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  title="+10s"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>

                {/* Time */}
                <span className="text-[11px] font-mono text-white/70 tabular-nums ml-1">
                  {formatTime(currentTime)} / {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Playback speed */}
                <button
                  onClick={cyclePlaybackRate}
                  className="h-7 px-2 rounded-lg text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors tabular-nums"
                  title="Vitesse de lecture"
                >
                  {playbackRate}x
                </button>

                {/* Transcript toggle */}
                {transcriptText && (
                  <button
                    onClick={() => setShowTranscript((v) => !v)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      showTranscript
                        ? "bg-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                    title="Transcription"
                  >
                    <ScrollText className="w-4 h-4" />
                  </button>
                )}

                {/* Export PDF (only if transcript available) */}
                {transcriptText && recordingId && (
                  <button
                    onClick={exportPdf}
                    disabled={isExporting}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                      isExporting
                        ? "text-white/40 cursor-not-allowed"
                        : "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                    title="Exporter PDF"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Download */}
                <button
                  onClick={handleDownload}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Telecharger"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title={
                    isFullscreen ? "Quitter le plein ecran" : "Plein ecran"
                  }
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4" />
                  ) : (
                    <Maximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript panel (shown alongside video) */}
      {showTranscript && transcriptText && (
        <div className="w-80 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col max-h-[500px]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-primary" />
              Transcription
            </h4>
            <button
              onClick={() => setShowTranscript(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {transcriptText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
