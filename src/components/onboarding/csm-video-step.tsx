"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  ArrowRight,
  CheckCircle,
  Star,
  MessageCircle,
  Calendar,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────

interface CsmProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  intro_video_url?: string | null;
}

interface CsmVideoStepProps {
  csm: CsmProfile | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  currentStepNumber: number;
  totalSteps: number;
  onNext: () => void;
  isLoading?: boolean;
}

// ─── Component ──────────────────────────────────────────────────

export function CsmVideoStep({
  csm,
  videoUrl,
  thumbnailUrl,
  currentStepNumber,
  totalSteps,
  onNext,
  isLoading = false,
}: CsmVideoStepProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Determine which video URL to use: prop > csm profile field
  const effectiveVideoUrl = videoUrl ?? csm?.intro_video_url ?? null;
  const hasVideo = !!effectiveVideoUrl;

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);
    } else {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  }, [videoPlaying]);

  const handleVideoEnd = useCallback(() => {
    setVideoPlaying(false);
    setVideoEnded(true);
    setVideoWatched(true);
  }, []);

  const handleToggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const canProceed = !hasVideo || videoWatched;

  // ─── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-white/40">Chargement...</p>
      </div>
    );
  }

  // ─── No CSM assigned ────────────────────────────────────────
  if (!csm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        {/* Progress indicator */}
        <StepProgress current={currentStepNumber} total={totalSteps} />

        <div className="mb-6 w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center">
          <Star className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Ton coach sera bientot assigne
        </h3>
        <p className="text-white/50 max-w-md mb-8">
          L&apos;equipe Off Market te contactera sous 24h pour te presenter ton
          coach personnalise.
        </p>
        <button
          onClick={onNext}
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  // ─── Main render ────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {/* Progress indicator */}
      <StepProgress current={currentStepNumber} total={totalSteps} />

      {/* CSM profile card */}
      <div className="mb-8 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-4 relative"
        >
          {csm.avatar_url ? (
            <Image
              src={csm.avatar_url}
              alt={csm.full_name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-3xl object-cover border-2 border-primary/50 mx-auto"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-red-500/30 flex items-center justify-center mx-auto border-2 border-primary/50">
              <span className="text-3xl font-bold text-white">
                {csm.full_name.charAt(0)}
              </span>
            </div>
          )}
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
            Ton CSM dedie
          </p>
          <h3 className="text-xl font-bold text-white mb-2">{csm.full_name}</h3>

          {/* Quick stats/badges */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50">
              <MessageCircle className="w-3.5 h-3.5 text-primary" />
              Disponible 7j/7
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Appels hebdo
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video player OR Bio fallback */}
      {hasVideo ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 w-full max-w-md"
        >
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 aspect-video relative group">
            {!videoPlaying && !videoEnded ? (
              <button
                onClick={handlePlayPause}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                {thumbnailUrl && (
                  <Image
                    src={thumbnailUrl}
                    alt="Video"
                    fill
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                )}
                <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-primary/80 hover:border-primary transition-all duration-300">
                  <Play className="w-7 h-7 text-white ml-1" />
                </div>
                <span className="relative z-10 text-sm text-white/50 hover:text-white/70 transition-colors">
                  Message de {csm.full_name}
                </span>
              </button>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  onEnded={handleVideoEnd}
                  onTimeUpdate={() => {
                    // Mark as watched if user watched > 80%
                    if (videoRef.current) {
                      const { currentTime, duration } = videoRef.current;
                      if (duration > 0 && currentTime / duration > 0.8) {
                        setVideoWatched(true);
                      }
                    }
                  }}
                >
                  {effectiveVideoUrl.includes("youtube") ||
                  effectiveVideoUrl.includes("vimeo") ? null : (
                    <source src={effectiveVideoUrl} type="video/mp4" />
                  )}
                </video>

                {/* Custom overlay controls */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button
                    onClick={handleToggleMute}
                    className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Video ended overlay */}
            {videoEnded && !videoPlaying && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 z-10">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
                <p className="text-sm font-medium text-white">
                  Video terminee !
                </p>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      videoRef.current.play();
                      setVideoPlaying(true);
                      setVideoEnded(false);
                    }
                  }}
                  className="text-xs text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
                >
                  Revoir la video
                </button>
              </div>
            )}
          </div>

          {/* Iframe fallback for YouTube / Vimeo */}
          {effectiveVideoUrl &&
            (effectiveVideoUrl.includes("youtube") ||
              effectiveVideoUrl.includes("vimeo")) && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 aspect-video">
                <iframe
                  src={effectiveVideoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video d'introduction de ${csm.full_name}`}
                />
              </div>
            )}

          {/* "J'ai regarde la video" checkbox */}
          <AnimatePresence>
            {!videoWatched && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setVideoWatched(true)}
                className="mt-4 mx-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-sm text-white/60 hover:text-white/80"
              >
                <div className="w-5 h-5 rounded-md border-2 border-white/30 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white/0" />
                </div>
                J&apos;ai regarde la video
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {videoWatched && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 mx-auto flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400"
              >
                <CheckCircle className="w-4 h-4" />
                Video vue — bravo !
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Fallback: Bio / welcome message when no video */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6"
        >
          <p className="text-sm text-white/60 leading-relaxed text-center">
            {csm.bio
              ? csm.bio
              : `Salut ! Je suis ${csm.full_name}, ton CSM dedie. Je serai la pour t'accompagner tout au long de ton parcours Off Market. N'hesite pas a me contacter pour toute question.`}
          </p>
        </motion.div>
      )}

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onNext}
        disabled={!canProceed}
        className={cn(
          "flex items-center gap-3 rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all",
          canProceed
            ? "bg-gradient-to-r from-primary to-red-500 shadow-red-500/25 hover:scale-105"
            : "bg-white/10 cursor-not-allowed opacity-50",
        )}
      >
        Continuer
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

// ─── Step progress indicator ──────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all duration-500",
            i + 1 === current
              ? "w-8 bg-primary"
              : i + 1 < current
                ? "w-3 bg-primary/50"
                : "w-3 bg-white/15",
          )}
        />
      ))}
    </div>
  );
}
