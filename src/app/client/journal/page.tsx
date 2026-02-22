"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useJournal } from "@/hooks/use-journal";
import { MOOD_CONFIG } from "@/types/coaching";
import type { Mood } from "@/types/coaching";
import { BookOpen, Plus, X, Lock, Globe, Trash2 } from "lucide-react";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function JournalPage() {
  const { entries, isLoading, createEntry, deleteEntry } = useJournal();
  const [showComposer, setShowComposer] = useState(false);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vos reflexions et apprentissages
          </p>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle entree
        </button>
      </motion.div>

      {/* Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <JournalComposer
              onSubmit={(data) => {
                createEntry.mutate(data, {
                  onSuccess: () => setShowComposer(false),
                });
              }}
              onCancel={() => setShowComposer(false)}
              isSubmitting={createEntry.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Votre journal est vide. Commencez a ecrire !
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              variants={fadeInUp}
              transition={defaultTransition}
              className="bg-surface border border-border rounded-xl p-5 group"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{entry.title}</h3>
                  <p className="text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.mood && (
                    <span className="text-lg">{MOOD_CONFIG[entry.mood as Mood]?.emoji}</span>
                  )}
                  {entry.is_private ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <button
                    onClick={() => deleteEntry.mutate(entry.id)}
                    className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
              {entry.tags.length > 0 && (
                <div className="flex gap-1 mt-3">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function JournalComposer({
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  onSubmit: (data: {
    title: string;
    content: string;
    mood?: Mood;
    tags?: string[];
    is_private?: boolean;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      mood: mood ?? undefined,
      tags: tags.length > 0 ? tags : undefined,
      is_private: isPrivate,
    });
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Nouvelle entree</h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ecrivez vos pensees..."
        rows={5}
        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />

      {/* Mood */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Humeur:</span>
        {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => setMood(mood === m ? null : m)}
            className={`text-xl transition-transform ${
              mood === m ? "scale-125" : "opacity-50 hover:opacity-100"
            }`}
          >
            {MOOD_CONFIG[m].emoji}
          </button>
        ))}
      </div>

      {/* Tags */}
      <input
        type="text"
        value={tagsInput}
        onChange={(e) => setTagsInput(e.target.value)}
        placeholder="Tags (separes par des virgules)"
        className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsPrivate(!isPrivate)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
          {isPrivate ? "Prive" : "Visible par le coach"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className="h-9 px-4 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
