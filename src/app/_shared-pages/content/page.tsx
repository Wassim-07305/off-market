"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  Kanban,
  Calendar,
  Plus,
  FileEdit,
  Clock,
  CheckCircle2,
  Archive,
  Instagram,
  Linkedin,
  Music2,
} from "lucide-react";
import { ContentBoard } from "@/components/content/content-board";
import { ContentCalendar } from "@/components/content/content-calendar";
import { ContentFormModal } from "@/components/content/content-form-modal";
import {
  useContentStats,
  type SocialContentItem,
  type ContentPlatform,
} from "@/hooks/use-social-content";

type ContentView = "board" | "calendar";

export default function ContentPage() {
  const [view, setView] = useState<ContentView>("board");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<SocialContentItem | null>(null);
  const [defaultScheduledAt, setDefaultScheduledAt] = useState<string>();
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | "all">(
    "all",
  );

  const stats = useContentStats();

  const handleEditItem = (item: SocialContentItem) => {
    setEditItem(item);
    setDefaultScheduledAt(undefined);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditItem(null);
    setDefaultScheduledAt(undefined);
    setShowForm(true);
  };

  const handleCreateForDate = (date: string) => {
    setEditItem(null);
    setDefaultScheduledAt(date);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditItem(null);
    setDefaultScheduledAt(undefined);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Contenu
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "board"
              ? "Gerez votre pipeline de contenu social"
              : "Vue calendrier des publications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-xs)" }}
          >
            {(
              [
                { key: "board" as const, label: "Board", icon: Kanban },
                {
                  key: "calendar" as const,
                  label: "Calendrier",
                  icon: Calendar,
                },
              ] as const
            ).map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                    view === v.key
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* New content button */}
          <button
            onClick={handleCreateNew}
            className={cn(
              "h-9 px-4 flex items-center gap-1.5 text-xs font-semibold rounded-xl transition-all",
              "bg-foreground text-background hover:opacity-90",
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau contenu
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
      >
        {[
          {
            label: "Brouillons",
            value: stats.draft,
            icon: FileEdit,
            color: "text-zinc-500",
          },
          {
            label: "Planifies",
            value: stats.scheduled,
            icon: Clock,
            color: "text-blue-500",
          },
          {
            label: "Publies",
            value: stats.published,
            icon: CheckCircle2,
            color: "text-emerald-500",
          },
          {
            label: "Archives",
            value: stats.archived,
            icon: Archive,
            color: "text-zinc-400",
          },
          {
            label: "Instagram",
            value: stats.byPlatform.instagram,
            icon: Instagram,
            color: "text-pink-500",
          },
          {
            label: "LinkedIn",
            value: stats.byPlatform.linkedin,
            icon: Linkedin,
            color: "text-blue-600",
          },
          {
            label: "TikTok",
            value: stats.byPlatform.tiktok,
            icon: Music2,
            color: "text-zinc-700 dark:text-zinc-300",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-2.5 bg-surface border border-border rounded-xl px-3 py-2.5"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              <Icon className={cn("w-4 h-4 shrink-0", stat.color)} />
              <div className="min-w-0">
                <p className="text-base font-bold text-foreground font-mono tabular-nums leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Platform filter */}
      <motion.div variants={staggerItem} className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Filtrer :</span>
        {(
          [
            { value: "all" as const, label: "Tout" },
            { value: "instagram" as const, label: "Instagram" },
            { value: "linkedin" as const, label: "LinkedIn" },
            { value: "tiktok" as const, label: "TikTok" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => setPlatformFilter(opt.value)}
            className={cn(
              "h-7 px-2.5 text-[11px] font-medium rounded-lg transition-all",
              platformFilter === opt.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {opt.label}
          </button>
        ))}
      </motion.div>

      {/* Content view */}
      <motion.div variants={staggerItem}>
        {view === "board" ? (
          <ContentBoard onEditItem={handleEditItem} />
        ) : (
          <ContentCalendar
            onEditItem={handleEditItem}
            onCreateForDate={handleCreateForDate}
          />
        )}
      </motion.div>

      {/* Form modal */}
      <ContentFormModal
        open={showForm}
        onClose={handleCloseForm}
        editItem={editItem}
        defaultScheduledAt={defaultScheduledAt}
      />
    </motion.div>
  );
}
