"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAudioPlayer, formatAudioTime } from "@/hooks/use-audio-player";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Download,
  Loader2,
  Headphones,
} from "lucide-react";

// ─── Speed Selector ──────────────────────────────────────────────────────

const SPEEDS = [0.5, 1, 1.25, 1.5, 2];

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
        className="h-7 px-2.5 rounded-lg text-[11px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-colors tabular-nums"
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
                    ? "bg-[#DC2626] text-white"
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

// ─── Waveform Progress Bar ───────────────────────────────────────────────

function WaveformProgress({
  progress,
  onSeek,
  duration,
}: {
  progress: number;
  onSeek: (percent: number) => void;
  duration: number;
}) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);

  // Generate pseudo-random waveform bars
  const barCount = 80;
  const heights = useRef<number[]>([]);
  if (heights.current.length === 0) {
    for (let i = 0; i < barCount; i++) {
      // Sine wave modulation for natural look
      const base = 0.3 + 0.7 * Math.abs(Math.sin((i / barCount) * Math.PI));
      const noise = 0.5 + 0.5 * Math.sin(i * 7.3 + 2.1) * Math.sin(i * 3.7);
      heights.current.push(Math.max(0.15, Math.min(1, base * noise)));
    }
  }

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!barRef.current || duration <= 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const percent = Math.max(
        0,
        Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
      );
      onSeek(percent);
    },
    [onSeek, duration],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const percent = Math.max(
      0,
      Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
    );
    setHoverPercent(percent);
  }, []);

  return (
    <div
      ref={barRef}
      className="relative w-full h-12 flex items-end gap-[1.5px] cursor-pointer group"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPercent(null)}
    >
      {heights.current.map((h, i) => {
        const barPercent = (i / barCount) * 100;
        const isPlayed = barPercent <= progress;
        const isHovered = hoverPercent !== null && barPercent <= hoverPercent;
        return (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-full transition-colors duration-100",
              isPlayed
                ? "bg-[#DC2626]"
                : isHovered
                  ? "bg-[#DC2626]/40"
                  : "bg-white/20",
            )}
            style={{ height: `${h * 100}%`, minHeight: "3px" }}
          />
        );
      })}
      {/* Hover time tooltip */}
      {hoverPercent !== null && duration > 0 && (
        <div
          className="absolute -top-7 transform -translate-x-1/2 text-[10px] font-mono text-white/70 bg-zinc-900/90 px-1.5 py-0.5 rounded pointer-events-none"
          style={{ left: `${hoverPercent}%` }}
        >
          {formatAudioTime((hoverPercent / 100) * duration)}
        </div>
      )}
    </div>
  );
}

// ─── Volume Slider ───────────────────────────────────────────────────────

function VolumeSlider({
  volume,
  muted,
  onVolumeChange,
  onToggleMute,
}: {
  volume: number;
  muted: boolean;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}) {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div
      className="relative flex items-center gap-1"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={onToggleMute}
        className="text-white/60 hover:text-white transition-colors"
      >
        {muted || volume === 0 ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
      {showSlider && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-zinc-900 border border-zinc-700 rounded-lg p-2 shadow-xl">
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#DC2626]"
            style={{
              writingMode: "horizontal-tb",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Audio Player ───────────────────────────────────────────────────

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  onComplete?: () => void;
  autoCompletePercent?: number;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  title,
  onComplete,
  autoCompletePercent = 90,
  className,
}: AudioPlayerProps) {
  const {
    initAudio,
    playing,
    currentTime,
    duration,
    speed,
    volume,
    muted,
    loading,
    progressPercent,
    togglePlay,
    skipForward,
    skipBack,
    changeSpeed,
    changeVolume,
    toggleMute,
    seek,
  } = useAudioPlayer({ onComplete, autoCompletePercent });

  // Init audio on mount/url change
  useEffect(() => {
    if (audioUrl) {
      initAudio(audioUrl);
    }
  }, [audioUrl, initAudio]);

  const handleSeek = useCallback(
    (percent: number) => {
      if (duration > 0) {
        seek((percent / 100) * duration);
      }
    },
    [duration, seek],
  );

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = title ?? "audio";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden bg-zinc-950 relative",
        className,
      )}
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black opacity-90" />

      <div className="relative z-10 p-6 space-y-5">
        {/* Title and icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#DC2626]/20 flex items-center justify-center shrink-0">
            <Headphones className="w-6 h-6 text-[#DC2626]" />
          </div>
          {title && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{title}</p>
              <p className="text-[11px] text-white/50">
                {loading
                  ? "Chargement..."
                  : `Duree : ${formatAudioTime(duration)}`}
              </p>
            </div>
          )}
        </div>

        {/* Waveform progress */}
        <WaveformProgress
          progress={progressPercent}
          onSeek={handleSeek}
          duration={duration}
        />

        {/* Time display */}
        <div className="flex items-center justify-between text-[11px] text-white/50 tabular-nums font-mono -mt-2">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {/* Skip back 15s */}
          <button
            onClick={() => skipBack(15)}
            className="text-white/50 hover:text-white transition-colors relative"
            title="Reculer de 15s"
          >
            <SkipBack className="w-5 h-5" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/40">
              15
            </span>
          </button>

          {/* Play/Pause (large, centered) */}
          <button
            onClick={togglePlay}
            disabled={loading}
            className="w-14 h-14 rounded-full bg-[#DC2626] hover:bg-[#DC2626]/90 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-[#DC2626]/20"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : playing ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          {/* Skip forward 15s */}
          <button
            onClick={() => skipForward(15)}
            className="text-white/50 hover:text-white transition-colors relative"
            title="Avancer de 15s"
          >
            <SkipForward className="w-5 h-5" />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[9px] text-white/40">
              15
            </span>
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center justify-between pt-1">
          {/* Speed */}
          <SpeedSelector speed={speed} onSpeedChange={changeSpeed} />

          {/* Volume */}
          <VolumeSlider
            volume={volume}
            muted={muted}
            onVolumeChange={changeVolume}
            onToggleMute={toggleMute}
          />

          {/* Download */}
          <button
            onClick={handleDownload}
            className="text-white/40 hover:text-white transition-colors"
            title="Telecharger"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
