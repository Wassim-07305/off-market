"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { useNotifications } from "@/hooks/use-notifications";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  X,
  Bell,
  CheckCheck,
  MessageSquare,
  GraduationCap,
  Trophy,
  Calendar,
  FileText,
  Megaphone,
  Info,
  Flag,
  ClipboardCheck,
  Target,
  Award,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/database";

const NOTIFICATION_ICONS: Record<string, typeof Bell> = {
  new_message: MessageSquare,
  message: MessageSquare,
  course: GraduationCap,
  module_complete: GraduationCap,
  badge: Award,
  challenge: Trophy,
  call: Calendar,
  call_reminder: Calendar,
  form: FileText,
  form_response: FileText,
  report: Flag,
  checkin: ClipboardCheck,
  goal: Target,
  announcement: Megaphone,
  feed: Megaphone,
  system: Info,
};

function getNotificationIcon(type: string) {
  return NOTIFICATION_ICONS[type] ?? Bell;
}

function getNotificationColor(type: string): string {
  switch (type) {
    case "new_message":
    case "message":
      return "bg-blue-500/10 text-blue-500";
    case "course":
    case "module_complete":
      return "bg-emerald-500/10 text-emerald-500";
    case "badge":
    case "challenge":
      return "bg-amber-500/10 text-amber-500";
    case "call":
    case "call_reminder":
      return "bg-violet-500/10 text-violet-500";
    case "form":
    case "form_response":
      return "bg-orange-500/10 text-orange-500";
    case "report":
      return "bg-red-500/10 text-red-500";
    case "checkin":
      return "bg-teal-500/10 text-teal-500";
    case "goal":
      return "bg-indigo-500/10 text-indigo-500";
    case "announcement":
    case "feed":
      return "bg-primary/10 text-primary";
    default:
      return "bg-muted text-muted-foreground";
  }
}

/** Resolve a notification to a route based on type and data */
function getNotificationLink(
  type: string,
  data: Record<string, unknown>,
  prefix: string,
): string | null {
  switch (type) {
    case "new_message":
    case "message":
      return `${prefix}/messaging`;
    case "feed":
      return `${prefix}/feed`;
    case "report":
      return `${prefix}/feed`;
    case "checkin":
      return prefix.startsWith("/admin") || prefix.startsWith("/coach")
        ? `${prefix}/checkins`
        : `${prefix}/checkin`;
    case "goal":
      return `${prefix}/goals`;
    case "form_response":
      return data?.form_id
        ? `${prefix}/forms/${data.form_id}`
        : `${prefix}/forms`;
    case "badge":
      return `${prefix}/progress`;
    case "course":
    case "module_complete":
      return `${prefix}/school`;
    case "call":
    case "call_reminder":
      return `${prefix}/calls`;
    default:
      return null;
  }
}

export function NotificationPanel() {
  const { notificationPanelOpen, setNotificationPanelOpen } = useUIStore();
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefix = useRoutePrefix();
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    if (!notificationPanelOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotificationPanelOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [notificationPanelOpen, setNotificationPanelOpen]);

  // Keyboard shortcut alt+T
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        setNotificationPanelOpen(!notificationPanelOpen);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [notificationPanelOpen, setNotificationPanelOpen]);

  if (!notificationPanelOpen) return null;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    // Navigate to linked page
    const link = getNotificationLink(
      notification.type,
      notification.data,
      prefix,
    );
    if (link) {
      setNotificationPanelOpen(false);
      router.push(link);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead.mutate();
    }
  };

  const handleViewAll = () => {
    setNotificationPanelOpen(false);
    router.push(`${prefix}/notifications`);
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="region"
      aria-label="Notifications alt+T"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={() => setNotificationPanelOpen(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-surface border-l border-border shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="h-8 px-3 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tout lire
              </button>
            )}
            <button
              onClick={() => setNotificationPanelOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2 py-0.5">
                    <div className="h-3.5 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Aucune notification
              </p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Tu recevras des notifications pour les messages, cours et
                événements importants.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClass = getNotificationColor(notification.type);
                const link = getNotificationLink(
                  notification.type,
                  notification.data,
                  prefix,
                );
                const timeAgo = formatDistanceToNow(
                  new Date(notification.created_at),
                  { addSuffix: true, locale: fr },
                );

                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors",
                      notification.is_read
                        ? "hover:bg-muted/30"
                        : "bg-primary/[0.03] hover:bg-primary/[0.06]",
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                        colorClass,
                      )}
                    >
                      <Icon className="w-4 h-4" />
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
                        <div className="flex items-center gap-1.5 shrink-0">
                          {link && (
                            <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                          )}
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      {notification.body && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.body}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground/70 mt-1">
                        {timeAgo}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: view all */}
        {notifications.length > 0 && (
          <div className="border-t border-border/60 px-5 py-3">
            <button
              onClick={handleViewAll}
              className="w-full h-9 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
            >
              Voir toutes les notifications
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
