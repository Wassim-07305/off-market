"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Video URL helpers
// ---------------------------------------------------------------------------

function getVideoEmbed(url: string): {
  type: "iframe" | "video" | "none";
  src: string;
  platform?: "youtube" | "vimeo" | "loom";
} {
  if (!url) return { type: "none", src: "" };

  // Format DB migre : youtube:VIDEO_ID
  if (url.startsWith("youtube:")) {
    const id = url.slice("youtube:".length);
    if (id)
      return {
        type: "iframe",
        src: `https://www.youtube.com/embed/${id}`,
        platform: "youtube",
      };
  }

  // YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let id: string | null | undefined = null;
    if (url.includes("youtu.be")) {
      id = url.split("/").pop()?.split("?")[0];
    } else {
      try {
        id = new URL(url).searchParams.get("v");
      } catch {
        id = null;
      }
    }
    if (id)
      return {
        type: "iframe",
        src: `https://www.youtube.com/embed/${id}`,
        platform: "youtube",
      };
  }

  // Vimeo
  if (url.includes("vimeo.com")) {
    const id = url.split("/").pop()?.split("?")[0];
    if (id)
      return {
        type: "iframe",
        src: `https://player.vimeo.com/video/${id}`,
        platform: "vimeo",
      };
  }

  // Loom
  if (url.includes("loom.com")) {
    const id = url.split("/").pop()?.split("?")[0];
    if (id)
      return {
        type: "iframe",
        src: `https://www.loom.com/embed/${id}`,
        platform: "loom",
      };
  }

  return { type: "video", src: url };
}

// ---------------------------------------------------------------------------
// Speed Controls
// ---------------------------------------------------------------------------

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function SpeedSelector({
  speed,
  onSpeedChange,
}: {
  speed: number;
  onSpeedChange: (speed: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-7 px-2 rounded-md text-[11px] font-bold text-white/80 hover:text-white bg-surface/10 hover:bg-surface/20 transition-colors tabular-nums"
      >
        {speed}x
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-20 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[80px]">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onSpeedChange(s);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-1.5 text-xs font-medium text-left transition-colors tabular-nums",
                  s === speed
                    ? "bg-primary text-white"
                    : "text-zinc-300 hover:bg-zinc-800",
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Video Player with speed controls
// ---------------------------------------------------------------------------

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  autoCompletePercent?: number;
  className?: string;
}

export function EnhancedVideoPlayer({
  videoUrl,
  onTimeUpdate,
  onComplete,
  autoCompletePercent = 80,
  className,
}: EnhancedVideoPlayerProps) {
  const embed = getVideoEmbed(videoUrl);

  if (embed.type === "none") return null;

  // For iframes (YouTube, Vimeo, Loom), we can't control speed natively.
  // Show a simpler player with embedded controls.
  if (embed.type === "iframe") {
    return (
      <div
        className={cn(
          "aspect-video rounded-2xl overflow-hidden bg-black relative group",
          className,
        )}
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <iframe
          src={embed.src}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {/* Platform badge */}
        {embed.platform && (
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/60 text-white/80 backdrop-blur-sm capitalize">
              {embed.platform}
            </span>
          </div>
        )}
      </div>
    );
  }

  // For direct videos, show our enhanced player
  return (
    <DirectVideoPlayer
      src={embed.src}
      onTimeUpdate={onTimeUpdate}
      onComplete={onComplete}
      autoCompletePercent={autoCompletePercent}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Direct video player with custom controls
// ---------------------------------------------------------------------------

function DirectVideoPlayer({
  src,
  onTimeUpdate,
  onComplete,
  autoCompletePercent,
  className,
}: {
  src: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  autoCompletePercent: number;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [autoCompleted, setAutoCompleted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    onTimeUpdate?.(video.currentTime, video.duration);

    if (!autoCompleted && video.duration) {
      const percent = (video.currentTime / video.duration) * 100;
      if (percent >= autoCompletePercent) {
        setAutoCompleted(true);
        onComplete?.();
      }
    }
  }, [onTimeUpdate, onComplete, autoCompleted, autoCompletePercent]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = newSpeed;
    setSpeed(newSpeed);
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(
      0,
      Math.min(video.duration, video.currentTime + seconds),
    );
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current;
      if (!video) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      video.currentTime = percent * duration;
    },
    [duration],
  );

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "aspect-video rounded-2xl overflow-hidden bg-black relative group cursor-pointer",
        className,
      )}
      style={{ boxShadow: "var(--shadow-elevated)" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playing) setShowControls(false);
      }}
    >
      <video
        ref={videoRef}
        src={src.includes("#") ? src : `${src}#t=0.1`}
        preload="metadata"
        className="w-full h-full"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (video) setDuration(video.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {/* Play overlay (when paused & no controls) */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-surface/20 backdrop-blur-md flex items-center justify-center hover:bg-surface/30 transition-colors"
          >
            <Play className="w-7 h-7 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Custom controls bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-4 transition-opacity duration-300",
          showControls || !playing ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1.5 rounded-full bg-surface/20 mb-3 cursor-pointer group/progress"
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full bg-primary relative transition-[width] duration-100"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover/progress:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white/80 hover:text-white transition-colors"
          >
            {playing ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          {/* Skip back/forward */}
          <button
            onClick={() => skip(-10)}
            className="text-white/60 hover:text-white transition-colors"
            title="-10s"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => skip(10)}
            className="text-white/60 hover:text-white transition-colors"
            title="+10s"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Time */}
          <span className="text-[11px] text-white/60 tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Speed */}
          <SpeedSelector speed={speed} onSpeedChange={handleSpeedChange} />

          {/* Volume */}
          <button
            onClick={toggleMute}
            className="text-white/60 hover:text-white transition-colors"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
