"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import type { Notification, NotificationCategory } from "@/types/database";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  CreditCard,
  GraduationCap,
  Trophy,
  Settings,
  Archive,
  Trash2,
  ExternalLink,
  Check,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

// ─── Category configuration ──────────────────────────────

interface CategoryConfig {
  value: NotificationCategory | "all";
  label: string;
  icon: typeof Bell;
  color: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    value: "all",
    label: "Toutes",
    icon: Inbox,
    color: "bg-muted text-muted-foreground",
  },
  {
    value: "messaging",
    label: "Messages",
    icon: MessageSquare,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    value: "billing",
    label: "Facturation",
    icon: CreditCard,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    value: "coaching",
    label: "Coaching",
    icon: GraduationCap,
    color: "bg-violet-500/10 text-violet-500",
  },
  {
    value: "gamification",
    label: "Gamification",
    icon: Trophy,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    value: "system",
    label: "Systeme",
    icon: Settings,
    color: "bg-slate-500/10 text-slate-500",
  },
  {
    value: "general",
    label: "General",
    icon: Bell,
    color: "bg-primary/10 text-primary",
  },
];

const CATEGORY_ICON_MAP: Record<NotificationCategory, typeof Bell> = {
  messaging: MessageSquare,
  billing: CreditCard,
  coaching: GraduationCap,
  gamification: Trophy,
  system: Settings,
  general: Bell,
};

const CATEGORY_COLOR_MAP: Record<NotificationCategory, string> = {
  messaging: "bg-blue-500/10 text-blue-500",
  billing: "bg-emerald-500/10 text-emerald-500",
  coaching: "bg-violet-500/10 text-violet-500",
  gamification: "bg-amber-500/10 text-amber-500",
  system: "bg-slate-500/10 text-slate-500",
  general: "bg-primary/10 text-primary",
};

type ReadFilter = "all" | "unread" | "read";

// ─── Component ───────────────────────────────────────────

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState<
    NotificationCategory | "all"
  >("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");

  const categoryForHook = activeCategory === "all" ? undefined : activeCategory;

  const {
    notifications,
    isLoading,
    unreadCount,
    countByCategory,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    archiveAllRead,
    deleteNotification,
  } = useNotifications({ category: categoryForHook });

  const prefix = useRoutePrefix();
  const router = useRouter();

  // Apply read/unread filter
  const filtered = notifications.filter((n) => {
    if (readFilter === "unread") return !n.is_read;
    if (readFilter === "read") return n.is_read;
    return true;
  });

  const handleClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    const url = notification.action_url;
    if (url) {
      router.push(url.startsWith("/") ? url : `${prefix}${url}`);
    }
  };

  const handleArchive = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    archiveNotification.mutate(notificationId, {
      onSuccess: () => toast.success("Notification archivee"),
    });
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification.mutate(notificationId, {
      onSuccess: () => toast.success("Notification supprimee"),
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined, {
      onSuccess: () =>
        toast.success("Toutes les notifications marquees comme lues"),
    });
  };

  const handleArchiveAllRead = () => {
    archiveAllRead.mutate(undefined, {
      onSuccess: () => toast.success("Notifications lues archivees"),
    });
  };

  const timeAgo = (date: string) =>
    formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });

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
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                : "Toutes lues"}
            </p>
          </div>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="h-9 px-4 rounded-lg text-xs font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Tout marquer comme lu
            </button>
          )}
          <button
            onClick={handleArchiveAllRead}
            disabled={archiveAllRead.isPending}
            className="h-9 px-4 rounded-lg text-xs font-medium text-muted-foreground border border-border hover:bg-muted/50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Archive className="w-3.5 h-3.5" />
            Archiver les lus
          </button>
        </div>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        variants={staggerItem}
        className="bg-surface border border-border rounded-xl p-4"
      >
        <div className="flex items-center gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 pr-4 border-r border-border">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {unreadCount}
            </span>
            <span className="text-xs text-muted-foreground">non lues</span>
          </div>
          {CATEGORIES.filter((c) => c.value !== "all").map((cat) => {
            const count = countByCategory[cat.value] ?? 0;
            if (count === 0) return null;
            const Icon = cat.icon;
            return (
              <div
                key={cat.value}
                className="flex items-center gap-1.5 shrink-0"
              >
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {count}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Category filter tabs */}
      <motion.div
        variants={staggerItem}
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count =
            cat.value === "all"
              ? unreadCount
              : (countByCategory[cat.value] ?? 0);
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5",
                activeCategory === cat.value
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              {count > 0 && (
                <span
                  className={cn(
                    "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                    activeCategory === cat.value
                      ? "bg-surface/20 text-white"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Read/unread filter toggle */}
      <motion.div variants={staggerItem} className="flex gap-1">
        {(
          [
            { value: "all", label: "Toutes" },
            { value: "unread", label: "Non lues" },
            { value: "read", label: "Lues" },
          ] as const
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setReadFilter(f.value)}
            className={cn(
              "px-3 py-1 rounded-lg text-xs font-medium transition-all",
              readFilter === f.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-surface rounded-2xl animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">
            {readFilter === "unread"
              ? "Aucune notification non lue"
              : readFilter === "read"
                ? "Aucune notification lue"
                : activeCategory !== "all"
                  ? `Aucune notification dans ${CATEGORIES.find((c) => c.value === activeCategory)?.label ?? "cette catégorie"}`
                  : "Aucune notification"}
          </p>
          <p className="text-xs text-muted-foreground">
            {readFilter === "unread"
              ? "Vous etes a jour !"
              : "Les nouvelles notifications apparaitront ici."}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div variants={staggerItem} className="space-y-1.5">
            {filtered.map((notification) => {
              const Icon = CATEGORY_ICON_MAP[notification.category] ?? Bell;
              const colorClass =
                CATEGORY_COLOR_MAP[notification.category] ??
                "bg-muted text-muted-foreground";

              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="group relative"
                >
                  <button
                    onClick={() => handleClick(notification)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all",
                      notification.is_read
                        ? "bg-surface hover:bg-muted/30"
                        : "bg-primary/[0.03] hover:bg-primary/[0.06] border border-primary/10",
                    )}
                    style={{ boxShadow: "var(--shadow-card)" }}
                  >
                    {/* Category icon */}
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                        colorClass,
                      )}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-snug",
                            notification.is_read
                              ? "text-foreground"
                              : "text-foreground font-medium",
                          )}
                        >
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                            {timeAgo(notification.created_at)}
                          </span>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                      </div>
                      {notification.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      {notification.action_url && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-primary mt-1.5">
                          <ExternalLink className="w-3 h-3" />
                          Voir
                        </span>
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleArchive(e, notification.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Archiver"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
