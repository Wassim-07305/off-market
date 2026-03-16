"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
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
  TrendingUp,
  Flame,
  FileText,
  Loader2,
  Edit3,
  Eye,
  ChevronDown,
  Tag,
  Sparkles,
  CalendarDays,
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

function formatTimeAgo(date: string) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `il y a ${diffMins}min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `il y a ${diffDays}j`;
  return formatShortDate(date);
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
    }),
  );

  if (!entryDates.has(checkDate.getTime())) {
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
  const recent = entries.filter((e) => e.mood !== null).slice(0, 7);
  if (recent.length < 2) return null;
  const avg = recent.reduce((s, e) => s + (e.mood ?? 0), 0) / recent.length;
  return Math.round(avg * 10) / 10;
}

// Group entries by month
function groupByMonth(
  entries: JournalEntry[],
): Array<{ month: string; entries: JournalEntry[] }> {
  const groups: Record<string, JournalEntry[]> = {};
  for (const entry of entries) {
    const d = new Date(entry.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, entries]) => {
      const [year, month] = key.split("-");
      const d = new Date(Number(year), Number(month) - 1);
      const label = d.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      });
      return { month: label, entries };
    });
}

export default function JournalPage() {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } =
    useJournal();
  const [showComposer, setShowComposer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<JournalTemplate | null>(null);
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<FilterMood>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const streak = useMemo(() => getStreak(entries), [entries]);
  const moodTrend = useMemo(() => getMoodTrend(entries), [entries]);
  const totalEntries = entries.length;

  // Unique tags for quick filter
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach((e) => e.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).slice(0, 10);
  }, [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (filterMood !== "all") {
      list = list.filter((e) => e.mood === filterMood);
    }
    return list;
  }, [entries, search, filterMood]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  const handleExport = () => {
    const text = entries
      .map(
        (e) =>
          `# ${e.title}\n${formatDate(e.created_at)}${e.mood ? ` | ${MOOD_CONFIG[e.mood as Mood]?.emoji}` : ""}${e.tags.length > 0 ? ` | ${e.tags.map((t) => `#${t}`).join(" ")}` : ""}\n\n${e.content}\n\n---\n`,
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

  const startEditing = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setExpandedEntryId(null);
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
              setEditingEntry(null);
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
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-[14px] border border-border p-4 text-center">
          <FileText className="w-4 h-4 text-primary mx-auto mb-1.5" />
          <p className="text-lg font-display font-bold text-foreground">
            {totalEntries}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Entrees
          </p>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-4 text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1.5" />
          <p className="text-lg font-display font-bold text-foreground">
            {streak}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Jours de suite
          </p>
        </div>
        <div className="bg-white rounded-[14px] border border-border p-4 text-center">
          <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1.5" />
          <p className="text-lg font-display font-bold text-foreground">
            {moodTrend !== null ? `${moodTrend}/5` : "\u2014"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Humeur moy.
          </p>
        </div>
      </motion.div>

      {/* Writing prompts / Templates */}
      {!showComposer && !editingEntry && (
        <motion.div variants={staggerItem}>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Demarrer avec un template
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(
              Object.entries(JOURNAL_TEMPLATES) as [
                JournalTemplate,
                (typeof JOURNAL_TEMPLATES)[JournalTemplate],
              ][]
            ).map(([key, tpl]) => (
              <button
                key={key}
                onClick={() => startFromTemplate(key)}
                className="flex items-center gap-2 h-8 px-3.5 rounded-full bg-white border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-xs font-medium text-foreground whitespace-nowrap shrink-0"
              >
                <span>{tpl.icon}</span>
                {tpl.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Composer (create) */}
      <AnimatePresence>
        {showComposer && !editingEntry && (
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

      {/* Composer (edit) */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <JournalComposer
              template={(editingEntry.template as JournalTemplate) ?? null}
              initialData={{
                title: editingEntry.title,
                content: editingEntry.content,
                mood: editingEntry.mood ?? undefined,
                tags: editingEntry.tags,
                is_private: editingEntry.is_private,
              }}
              onSubmit={(data) => {
                updateEntry.mutate(
                  { id: editingEntry.id, ...data },
                  {
                    onSuccess: () => {
                      setEditingEntry(null);
                    },
                  },
                );
              }}
              onCancel={() => setEditingEntry(null)}
              isSubmitting={updateEntry.isPending}
              isEditing
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
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filtres
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Mood filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Humeur :
                  </span>
                  <button
                    onClick={() => setFilterMood("all")}
                    className={cn(
                      "h-7 px-2.5 rounded-full text-xs font-medium transition-all",
                      filterMood === "all"
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    Toutes
                  </button>
                  {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
                    <button
                      key={m}
                      onClick={() =>
                        setFilterMood(filterMood === m ? "all" : m)
                      }
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center transition-all",
                        filterMood === m
                          ? "bg-foreground text-background scale-110"
                          : "bg-muted hover:scale-105",
                      )}
                    >
                      <span className="text-sm">{MOOD_CONFIG[m].emoji}</span>
                    </button>
                  ))}
                </div>

                {/* Tag filter */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      Tags :
                    </span>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (search === `#${tag}`) {
                            setSearch("");
                          } else {
                            setSearch(`#${tag}`);
                          }
                        }}
                        className={cn(
                          "h-6 px-2 rounded-full text-[10px] font-medium transition-all flex items-center gap-1",
                          search === `#${tag}`
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Entries grouped by month */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-muted/50 rounded-[14px] animate-shimmer"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-[14px] border border-border p-12 text-center"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {search.trim() || filterMood !== "all"
              ? "Aucun resultat"
              : "Ton journal est vide. Commence a ecrire !"}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="space-y-6">
          {grouped.map((group) => (
            <div key={group.month}>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.month}
                </h3>
                <span className="text-[10px] text-muted-foreground/60">
                  ({group.entries.length})
                </span>
              </div>
              <div className="space-y-3">
                {group.entries.map((entry) => (
                  <JournalEntryCard
                    key={entry.id}
                    entry={entry}
                    isExpanded={expandedEntryId === entry.id}
                    onToggle={() =>
                      setExpandedEntryId(
                        expandedEntryId === entry.id ? null : entry.id,
                      )
                    }
                    onEdit={() => startEditing(entry)}
                    onDelete={() => deleteEntry.mutate(entry.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Entry Card ─── */

function JournalEntryCard({
  entry,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-[14px] border border-border group transition-all",
        isExpanded ? "border-primary/20" : "hover:border-primary/10",
      )}
    >
      {/* Collapsed header */}
      <div className="p-5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {entry.title}
              </h3>
              {entry.template && (
                <span className="text-xs shrink-0">
                  {JOURNAL_TEMPLATES[entry.template as JournalTemplate]?.icon}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
              <span>{formatTimeAgo(entry.created_at)}</span>
              <span className="text-muted-foreground/30">|</span>
              <span>{formatDate(entry.created_at)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {entry.mood && (
              <span
                className="text-sm"
                title={MOOD_CONFIG[entry.mood as Mood]?.label}
              >
                {MOOD_CONFIG[entry.mood as Mood]?.emoji}
              </span>
            )}
            {entry.is_private ? (
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isExpanded && "rotate-180",
              )}
            />
          </div>
        </div>

        {/* Preview text (collapsed) */}
        {!isExpanded && (
          <p className="text-sm text-foreground/70 line-clamp-2 leading-relaxed">
            {entry.content}
          </p>
        )}

        {entry.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
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

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 border-t border-border/50 pt-4">
              <div className="bg-muted/30 rounded-[10px] p-4 mb-4">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="h-7 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3 h-3" />
                    Modifier
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Supprimer cette entree ?")) {
                        onDelete();
                      }
                    }}
                    className="h-7 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-error hover:bg-error/10 transition-all flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                </div>
                <span className="text-[10px] text-muted-foreground/50">
                  {entry.content.length} caracteres
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Composer ─── */

function JournalComposer({
  template,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing = false,
}: {
  template: JournalTemplate | null;
  initialData?: {
    title: string;
    content: string;
    mood?: Mood;
    tags?: string[];
    is_private?: boolean;
  };
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
  isEditing?: boolean;
}) {
  const tpl = template ? JOURNAL_TEMPLATES[template] : null;
  const [title, setTitle] = useState(
    initialData?.title ?? (tpl ? tpl.label : ""),
  );
  const [content, setContent] = useState(
    initialData?.content ??
      (tpl && tpl.prompts.length > 0
        ? tpl.prompts.map((p) => `${p}\n`).join("\n")
        : ""),
  );
  const [mood, setMood] = useState<Mood | null>(initialData?.mood ?? null);
  const [tagsInput, setTagsInput] = useState(
    initialData?.tags?.join(", ") ?? "",
  );
  const [isPrivate, setIsPrivate] = useState(initialData?.is_private ?? true);

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

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="bg-white rounded-[14px] border border-primary/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {isEditing ? "Modifier l'entree" : "Nouvelle entree"}
          </h3>
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
        <p className="text-xs text-muted-foreground italic bg-primary/5 px-3 py-2 rounded-lg">
          {tpl.description}
        </p>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre"
        className="w-full h-10 px-4 bg-muted/50 border-0 rounded-[10px] text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        autoFocus
      />

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ecris tes pensees..."
          rows={10}
          className="w-full px-4 py-3 bg-muted/50 border-0 rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
        />
        <div className="absolute bottom-2 right-3 text-[10px] text-muted-foreground/40">
          {wordCount} mots | {content.length} car.
        </div>
      </div>

      {/* Mood */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Humeur :</span>
        {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
          <button
            key={m}
            onClick={() => setMood(mood === m ? null : m)}
            className={cn(
              "text-xl transition-all",
              mood === m
                ? "scale-125"
                : "opacity-40 hover:opacity-80 hover:scale-110",
            )}
            title={MOOD_CONFIG[m].label}
          >
            {MOOD_CONFIG[m].emoji}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2">
        <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (separes par des virgules)"
          className="flex-1 h-9 px-3 bg-muted/50 border-0 rounded-[10px] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsPrivate(!isPrivate)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPrivate ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
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
          {isSubmitting
            ? "Sauvegarde..."
            : isEditing
              ? "Mettre a jour"
              : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}
