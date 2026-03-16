"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useSharedJournalEntries } from "@/hooks/use-journal";
import { MOOD_CONFIG } from "@/types/coaching";
import type { Mood } from "@/types/coaching";
import { BookOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDateFR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CoachJournalPage() {
  const { entries, isLoading } = useSharedJournalEntries();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return entries;
    const q = search.toLowerCase();
    return entries.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.content?.toLowerCase().includes(q),
    );
  }, [entries, search]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">
          Journal partage
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Entrees de journal partagees par vos clients
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une entree..."
          className="w-full h-9 pl-9 pr-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search
              ? "Aucune entree correspondante"
              : "Aucune entree partagee pour le moment"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => {
            const mood = entry.mood as Mood | null;
            const moodConfig = mood ? MOOD_CONFIG[mood] : null;

            return (
              <motion.div
                key={entry.id}
                variants={fadeInUp}
                transition={defaultTransition}
                className="bg-surface border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs text-muted-foreground">
                        {formatDateFR(entry.created_at)}
                      </p>
                      {moodConfig && (
                        <span
                          className={cn("text-sm", moodConfig.color)}
                          title={`Humeur : ${moodConfig.label}`}
                        >
                          {moodConfig.emoji}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {entry.title || "Sans titre"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {entry.content}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(entry.tags as string[]).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
