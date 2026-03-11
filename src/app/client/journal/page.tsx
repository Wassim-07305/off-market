"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem, fadeInUp, defaultTransition } from "@/lib/animations";
import { useJournal } from "@/hooks/use-journal";
import { MOOD_CONFIG, JOURNAL_TEMPLATES } from "@/types/coaching";
import type { Mood, JournalTemplate, JournalEntry } from "@/types/coaching";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Plus,
  X,
  Lock,
  Globe,
  Trash2,
  Search,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Flame,
  FileText,
  ChevronDown,
  Loader2,
} from "lucide-react";

type FilterMood = "all" | Mood;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function getStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let checkDate = new Date(today);

  const entryDates = new Set(
    entries.map((e) => {
      const d = new Date(e.created_at);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Check today first
  if (!entryDates.has(checkDate.getTime())) {
    // Allow yesterday to count as start
    checkDate.setDate(checkDate.getDate() - 1);
    if (!entryDates.has(checkDate.getTime())) return 0;
  }

  while (entryDates.has(checkDate.getTime())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

function getMoodTrend(entries: JournalEntry[]): number | null {
  const recent = entries
    .filter((e) => e.mood !== null)
    .slice(0, 7);
  if (recent.length < 2) return null;
  const avg = recent.reduce((s, e) => s + (e.mood ?? 0), 0) / recent.length;
  return Math.round(avg * 10) / 10;
}

export default function JournalPage() {
  const { entries, isLoading, createEntry, deleteEntry } = useJournal();
  const [showComposer, setShowComposer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<JournalTemplate | null>(null);
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<FilterMood>("all");
  const [showFilters, setShowFilters] = useState(false);

  const streak = useMemo(() => getStreak(entries), [entries]);
  const moodTrend = useMemo(() => getMoodTrend(entries), [entries]);
  const totalEntries = entries.length;

  const filtered = useMemo(() => {
    let list = entries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterMood !== "all") {
      list = list.filter((e) => e.mood === filterMood);
    }
    return list;
  }, [entries, search, filterMood]);

  const handleExport = () => {
    const text = entries
      .map(
        (e) =>
          `# ${e.title}\n${formatDate(e.created_at)}${e.mood ? ` | ${MOOD_CONFIG[e.mood as Mood]?.emoji}` : ""}${e.tags.length > 0 ? ` | ${e.tags.map((t) => `#${t}`).join(" ")}` : ""}\n\n${e.content}\n\n---\n`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `journal-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startFromTemplate = (t: JournalTemplate) => {
    setSelectedTemplate(t);
    setShowComposer(true);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Journal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tes reflexions et apprentissages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entries.length > 0 && (
            <button
              onClick={handleExport}
              className="h-9 px-3 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter
            </button>
          )}
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setShowComposer(true);
            }}
            className="h-9 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ecrire
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-3 gap-3"
      >
        <div
          className="bg-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <FileText className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">{totalEntries}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Entrees</p>
        </div>
        <div
          className="bg-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">{streak}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Jours de suite</p>
        </div>
        <div
          className="bg-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">
            {moodTrend !== null ? `${moodTrend}/5` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Humeur moy.</p>
        </div>
      </motion.div>

      {/* Templates */}
      {!showComposer && (
        <motion.div variants={staggerItem}>
          <p className="text-xs font-medium text-muted-foreground mb-2">Demarrer avec un template</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(Object.entries(JOURNAL_TEMPLATES) as [JournalTemplate, typeof JOURNAL_TEMPLATES[JournalTemplate]][]).map(
              ([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => startFromTemplate(key)}
                  className="flex items-center gap-2 h-9 px-3.5 rounded-xl bg-surface border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-medium text-foreground whitespace-nowrap shrink-0"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <span>{tpl.icon}</span>
                  {tpl.label}
                </button>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Composer */}
      <AnimatePresence>
        {showComposer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <JournalComposer
              template={selectedTemplate}
              onSubmit={(data) => {
                createEntry.mutate(data, {
                  onSuccess: () => {
                    setShowComposer(false);
                    setSelectedTemplate(null);
                  },
                });
              }}
              onCancel={() => {
                setShowComposer(false);
                setSelectedTemplate(null);
              }}
              isSubmitting={createEntry.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      {entries.length > 0 && (
        <motion.div variants={staggerItem} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Rechercher dans le journal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all",
                showFilters || filterMood !== "all"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtres
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Humeur :</span>
              <button
                onClick={() => setFilterMood("all")}
                className={cn(
                  "h-7 px-2.5 rounded-full text-xs font-medium transition-all",
                  filterMood === "all"
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                Toutes
              </button>
              {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMood(filterMood === m ? "all" : m)}
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                    filterMood === m
                      ? "bg-foreground text-background scale-110"
                      : "bg-muted hover:scale-105"
                  )}
                >
                  <span className="text-sm">{MOOD_CONFIG[m].emoji}</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-surface rounded-2xl animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search.trim() || filterMood !== "all"
              ? "Aucun resultat"
              : "Ton journal est vide. Commence a ecrire !"}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface rounded-2xl p-5 group hover:border-primary/10 transition-colors"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {entry.title}
                    </h3>
                    {entry.template && (
                      <span className="text-xs">
                        {JOURNAL_TEMPLATES[entry.template as JournalTemplate]?.icon}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {entry.mood && (
                    <span className="text-lg" title={MOOD_CONFIG[entry.mood as Mood]?.label}>
                      {MOOD_CONFIG[entry.mood as Mood]?.emoji}
                    </span>
                  )}
                  {entry.is_private ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                  <button
                    onClick={() => deleteEntry.mutate(entry.id)}
                    className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-error/10 transition-colors text-muted-foreground hover:text-error opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed line-clamp-4">
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
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function JournalComposer({
  template,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  template: JournalTemplate | null;
  onSubmit: (data: {
    title: string;
    content: string;
    mood?: Mood;
    tags?: string[];
    is_private?: boolean;
    template?: string;
  }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const tpl = template ? JOURNAL_TEMPLATES[template] : null;
  const [title, setTitle] = useState(tpl ? tpl.label : "");
  const [content, setContent] = useState(
    tpl && tpl.prompts.length > 0
      ? tpl.prompts.map((p) => `${p}\n`).join("\n")
      : ""
  );
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
      template: template ?? undefined,
    });
  };

  return (
    <div
      className="bg-surface rounded-2xl p-5 space-y-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Nouvelle entree</h3>
          {tpl && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {tpl.icon} {tpl.label}
            </span>
          )}
        </div>
        <button
          onClick={onCancel}
          className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {tpl && tpl.description && (
        <p className="text-xs text-muted-foreground italic">{tpl.description}</p>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full h-10 px-4 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ecris tes pensees..."
        rows={8}
        className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
      />

      {/* Mood */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Humeur :</span>
        {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => setMood(mood === m ? null : m)}
            className={cn(
              "text-xl transition-all",
              mood === m ? "scale-125" : "opacity-40 hover:opacity-80 hover:scale-110"
            )}
            title={MOOD_CONFIG[m].label}
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
        className="w-full h-9 px-4 bg-muted border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="h-9 px-4 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <BookOpen className="w-3.5 h-3.5" />
          )}
          {isSubmitting ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
