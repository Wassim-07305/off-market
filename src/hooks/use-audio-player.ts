"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface UseAudioPlayerOptions {
  onComplete?: () => void;
  autoCompletePercent?: number;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}) {
  const { onComplete, autoCompletePercent = 90 } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoCompleted, setAutoCompleted] = useState(false);

  // Initialize audio element
  const initAudio = useCallback(
    (url: string) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }

      const audio = new Audio(url);
      audio.preload = "metadata";
      audioRef.current = audio;

      // Reset state
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setLoading(true);
      setAutoCompleted(false);

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration);
        setLoading(false);
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);

        // Auto-complete at threshold
        if (
          !autoCompleted &&
          audio.duration > 0 &&
          onComplete
        ) {
          const percent = (audio.currentTime / audio.duration) * 100;
          if (percent >= autoCompletePercent) {
            setAutoCompleted(true);
            onComplete();
          }
        }
      });

      audio.addEventListener("ended", () => {
        setPlaying(false);
      });

      audio.addEventListener("play", () => setPlaying(true));
      audio.addEventListener("pause", () => setPlaying(false));

      audio.addEventListener("error", () => {
        setLoading(false);
      });

      return audio;
    },
    [onComplete, autoCompletePercent, autoCompleted],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      Math.min(audioRef.current.duration || 0, time),
    );
  }, []);

  const skipForward = useCallback((seconds = 15) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(
      audioRef.current.duration || 0,
      audioRef.current.currentTime + seconds,
    );
  }, []);

  const skipBack = useCallback((seconds = 15) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(
      0,
      audioRef.current.currentTime - seconds,
    );
  }, []);

  const changeSpeed = useCallback((newSpeed: number) => {
    if (!audioRef.current) return;
    audioRef.current.playbackRate = newSpeed;
    setSpeed(newSpeed);
  }, []);

  const changeVolume = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && muted) {
      audioRef.current.muted = false;
      setMuted(false);
    }
  }, [muted]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  }, []);

  const progressPercent =
    duration > 0 ? (currentTime / duration) * 100 : 0;

  return {
    audioRef,
    initAudio,
    playing,
    currentTime,
    duration,
    speed,
    volume,
    muted,
    loading,
    progressPercent,
    play,
    pause,
    togglePlay,
    seek,
    skipForward,
    skipBack,
    changeSpeed,
    changeVolume,
    toggleMute,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────

export function formatAudioTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
