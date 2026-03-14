"use client";

import { motion } from "framer-motion";
import { Play, ArrowRight, Star, MessageCircle, Calendar } from "lucide-react";
import { useState, useRef } from "react";

interface CsmProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface MeetCsmStepProps {
  csm: CsmProfile | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  onNext: () => void;
  isLoading: boolean;
}

export function MeetCsmStep({
  csm,
  videoUrl,
  thumbnailUrl,
  onNext,
  isLoading,
}: MeetCsmStepProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-white/40">Chargement...</p>
      </div>
    );
  }

  if (!csm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center"
      >
        <div className="mb-6 w-24 h-24 rounded-3xl bg-white/10 flex items-center justify-center">
          <Star className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Ton coach sera bientot assigne
        </h3>
        <p className="text-white/50 max-w-md mb-8">
          L&apos;equipe Off Market te contactera sous 24h pour te presenter
          ton coach personnalise.
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
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
            <img
              src={csm.avatar_url}
              alt={csm.full_name}
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
          {csm.bio && (
            <p className="text-sm text-white/50 leading-relaxed mb-4">
              {csm.bio}
            </p>
          )}

          {/* Quick stats/badges */}
          <div className="flex items-center justify-center gap-3">
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

      {/* CSM welcome video */}
      {videoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 w-full max-w-md rounded-2xl overflow-hidden border border-white/10 bg-black/30 aspect-video relative"
        >
          {!videoPlaying ? (
            <button
              onClick={() => {
                setVideoPlaying(true);
                videoRef.current?.play();
              }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
            >
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt="Video"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
              )}
              <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
                <Play className="w-7 h-7 text-white ml-1" />
              </div>
              <span className="relative z-10 text-sm text-white/50 group-hover:text-white/70 transition-colors">
                Message de {csm.full_name}
              </span>
            </button>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              playsInline
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          )}
        </motion.div>
      )}

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={onNext}
        className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
      >
        Continuer
        <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
