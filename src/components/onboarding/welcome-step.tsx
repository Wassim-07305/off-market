"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { useState, useRef } from "react";

interface WelcomeStepProps {
  firstName: string;
  onNext: () => void;
}

export function WelcomeStep({ firstName, onNext }: WelcomeStepProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    setVideoPlaying(true);
    videoRef.current?.play();
  };

  return (
    <div className="flex flex-col items-center text-center">
      {/* Logo with glow */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="mb-6 relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl" />
        <Image
          src="/logo.png"
          alt="Off Market"
          width={96}
          height={96}
          className="relative rounded-3xl"
          priority
        />
      </motion.div>

      {/* Premium badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 border border-amber-500/30 px-4 py-1.5"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-xs font-medium text-amber-300">
          Programme Premium
        </span>
      </motion.div>

      {/* Welcome title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl"
      >
        {firstName ? `Bienvenue ${firstName} !` : "Bienvenue chez Off Market !"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mb-8 max-w-lg text-lg text-white/50 leading-relaxed"
      >
        Tu rejoins une communaute d&apos;entrepreneurs ambitieux.
        Decouvre en 2 minutes comment la plateforme va t&apos;accompagner
        vers tes objectifs.
      </motion.p>

      {/* Welcome video */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="mb-8 w-full max-w-lg rounded-2xl overflow-hidden border border-white/10 bg-black/30 aspect-video relative"
      >
        {!videoPlaying ? (
          <button
            onClick={handlePlayVideo}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:bg-primary/80 group-hover:border-primary transition-all duration-300">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
              Regarder la video d&apos;accueil
            </span>
          </button>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            controls
            playsInline
            poster="/images/onboarding-poster.jpg"
          >
            <source src="/videos/welcome.mp4" type="video/mp4" />
          </video>
        )}
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40"
      >
        C&apos;est parti
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </div>
  );
}
