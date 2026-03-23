"use client";

import { useState, useMemo } from "react";
import { useReplays, useReplayCatégories } from "@/hooks/use-replays";
import { cn } from "@/lib/utils";
import {
  Play,
  Search,
  Clock,
  Calendar,
  Tag,
  Video,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

// ─── Video modal ────────────────────────────────────────────────

function VideoModal({
  title,
  videoUrl,
  onClose,
}: {
  title: string;
  videoUrl: string;
  onClose: () => void;
}) {
  const getEmbedUrl = (url: string): string | null => {
    // YouTube
    const ytMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    );
    if (ytMatch)
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&color=white`;

    // Vimeo
    const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
    if (vimeoMatch)
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

    // Loom
    const loomMatch = url.match(/(?:loom\.com\/(?:share|embed)\/)([a-f0-9]+)/);
    if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;

    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-lg font-semibold truncate pr-4">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface/10 hover:bg-surface/20 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="aspect-video rounded-2xl overflow-hidden bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} controls autoPlay className="w-full h-full" />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────

export function ReplayLibrary() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const { data: replays, isLoading } = useReplays({
    category: selectedCategory,
    search,
  });
  const { data: catégories } = useReplayCatégories();

  const activeReplay = useMemo(
    () => replays?.find((r) => r.id === activeVideoId) ?? null,
    [replays, activeVideoId],
  );

  const allCatégories = ["all", ...(catégories ?? [])];

  const CATEGORY_LABELS: Record<string, string> = {
    all: "Tous",
    mindset: "Mindset",
    strategie: "Strategie",
    technique: "Technique",
    offre: "Offre",
    acquisition: "Acquisition",
    conversion: "Conversion",
    communaute: "Communaute",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {allCatégories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Rechercher un replay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="aspect-video bg-muted animate-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-shimmer" />
                <div className="h-3 w-1/2 bg-muted rounded animate-shimmer" />
              </div>
            </div>
          ))
        ) : !replays || replays.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Video className="w-12 h-12 opacity-30 mb-4" />
            <p className="text-sm">Aucun replay disponible</p>
          </div>
        ) : (
          replays.map((replay) => (
            <motion.div key={replay.id} variants={staggerItem}>
              <button
                onClick={() => setActiveVideoId(replay.id)}
                className="w-full text-left bg-surface rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {replay.thumbnail_url ? (
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${replay.thumbnail_url})`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-zinc-900">
                      <Video className="w-10 h-10 text-white/20" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-surface/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
                      <Play className="w-5 h-5 text-foreground ml-0.5" />
                    </div>
                  </div>

                  {/* Duration badge */}
                  {(replay as any).duration_minutes && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {(replay as any).duration_minutes} min
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {replay.title}
                  </h3>

                  {replay.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {replay.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    {replay.coach && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {replay.coach.full_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(replay.recorded_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>

                  {/* Tags */}
                  {((replay as any).tags ?? []).length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {((replay as any).tags as string[])
                        .slice(0, 3)
                        .map((tag: string) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                      {((replay as any).tags ?? []).length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{((replay as any).tags ?? []).length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Video modal */}
      <AnimatePresence>
        {activeReplay && (
          <VideoModal
            title={activeReplay.title}
            videoUrl={activeReplay.video_url}
            onClose={() => setActiveVideoId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
