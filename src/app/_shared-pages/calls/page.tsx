"use client";

import { useState } from "react";
import { useCalls } from "@/hooks/use-calls";
import { WeekView } from "@/components/calls/week-view";
import { CallFormModal } from "@/components/calls/call-form-modal";
import { CallTypeBadge } from "@/components/calls/call-type-badge";
import {
  CALL_STATUS_COLORS,
  type CallCalendarWithRelations,
} from "@/types/calls";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import {
  useGoogleCalendarStatus,
  useGoogleCalendarEvents,
} from "@/hooks/use-google-calendar";
import Link from "next/link";
import { CallMetrics } from "@/components/calls/call-metrics";
import {
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Video,
  BarChart3,
} from "lucide-react";

/* ─── Status badge config ─── */
const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  planifie: {
    label: "Planifie",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    dot: "bg-blue-500",
  },
  realise: {
    label: "Realise",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  no_show: {
    label: "No-show",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  annule: {
    label: "Annule",
    bg: "bg-zinc-100 dark:bg-zinc-500/10",
    text: "text-zinc-600 dark:text-zinc-400",
    dot: "bg-zinc-400",
  },
  reporte: {
    label: "Reporte",
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
  },
};

export default function CallsPage() {
  const [view, setView] = useState<"week" | "list" | "metrics">("week");
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [showForm, setShowForm] = useState(false);
  const [editCall, setEditCall] = useState<CallCalendarWithRelations | null>(
    null,
  );
  const [defaultDate, setDefaultDate] = useState<string>();
  const [defaultTime, setDefaultTime] = useState<string>();

  const [showGoogle, setShowGoogle] = useState(true);

  const prefix = useRoutePrefix();
  const { calls, isLoading } = useCalls(weekStart);
  const googleStatus = useGoogleCalendarStatus();
  const isGoogleConnected = googleStatus.data?.connected ?? false;
  const googleEvents = useGoogleCalendarEvents(
    weekStart,
    isGoogleConnected && showGoogle,
  );

  /** An appointment is joinable all day on its scheduled date */
  const isJoinable = (call: CallCalendarWithRelations) => {
    if (call.status === "annule") return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    return call.date === todayStr;
  };

  const navigateWeek = (direction: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    setWeekStart(monday);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const formatWeekRange = () => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Aout",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${weekStart.getDate()} ${months[weekStart.getMonth()]} — ${weekEnd.getDate()} ${months[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`;
  };

  const handleCallClick = (call: CallCalendarWithRelations) => {
    setEditCall(call);
    setShowForm(true);
  };

  const handleSlotClick = (date: string, time: string) => {
    setEditCall(null);
    setDefaultDate(date);
    setDefaultTime(time);
    setShowForm(true);
  };

  const handleNewCall = () => {
    setEditCall(null);
    setDefaultDate(undefined);
    setDefaultTime(undefined);
    setShowForm(true);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Appels
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {calls.length} appel{calls.length !== 1 ? "s" : ""} cette semaine
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Google Agenda toggle */}
          {isGoogleConnected && (
            <button
              onClick={() => setShowGoogle((prev) => !prev)}
              className={cn(
                "h-9 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all duration-200",
                showGoogle
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60"
                  : "bg-white dark:bg-surface border border-zinc-200/80 text-muted-foreground hover:text-foreground",
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Google
            </button>
          )}
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-zinc-200/80 dark:border-border/50">
            <button
              onClick={() => setView("week")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all duration-200",
                view === "week"
                  ? "bg-[#AF0000] text-white"
                  : "bg-white dark:bg-surface text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted",
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Semaine
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all duration-200 border-x border-zinc-200/80 dark:border-border/50",
                view === "list"
                  ? "bg-[#AF0000] text-white"
                  : "bg-white dark:bg-surface text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted",
              )}
            >
              <List className="w-3.5 h-3.5" />
              Liste
            </button>
            <button
              onClick={() => setView("metrics")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all duration-200",
                view === "metrics"
                  ? "bg-[#AF0000] text-white"
                  : "bg-white dark:bg-surface text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted",
              )}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Stats
            </button>
          </div>
          <button
            onClick={handleNewCall}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#AF0000]/20 transition-all duration-300 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel appel
          </button>
        </div>
      </motion.div>

      {/* Week navigation */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <button
          onClick={() => navigateWeek(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted border border-zinc-200/80 dark:border-border/50 bg-white dark:bg-surface transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToToday}
          className="h-8 px-3 rounded-xl text-xs font-semibold text-[#AF0000] hover:bg-[#AF0000]/5 border border-[#AF0000]/20 transition-all duration-200"
        >
          Aujourd&apos;hui
        </button>
        <button
          onClick={() => navigateWeek(1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted border border-zinc-200/80 dark:border-border/50 bg-white dark:bg-surface transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-foreground font-mono tracking-tight">
          {formatWeekRange()}
        </span>
      </motion.div>

      {/* Content */}
      <motion.div variants={staggerItem}>
        {view === "metrics" ? (
          <CallMetrics />
        ) : view === "week" ? (
          <WeekView
            calls={calls}
            weekStart={weekStart}
            isLoading={isLoading}
            onCallClick={handleCallClick}
            onSlotClick={handleSlotClick}
            googleEvents={showGoogle ? googleEvents.data : undefined}
          />
        ) : (
          <div
            className="bg-white dark:bg-surface border border-zinc-200/80 dark:border-border/50 rounded-2xl divide-y divide-zinc-100 dark:divide-border/30 overflow-hidden"
            style={{
              boxShadow:
                "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
            }}
          >
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-14 bg-zinc-50 dark:bg-muted rounded-xl animate-shimmer"
                  />
                ))}
              </div>
            ) : calls.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Aucun appel cette semaine
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Cliquez sur &quot;Nouvel appel&quot; pour en planifier un
                </p>
              </div>
            ) : (
              calls.map((call) => {
                const badge =
                  STATUS_BADGE[call.status] ?? STATUS_BADGE.planifie;
                return (
                  <button
                    key={call.id}
                    onClick={() => handleCallClick(call)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50/80 dark:hover:bg-muted/50 transition-all duration-200 text-left group"
                  >
                    {/* Status badge */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0",
                        badge.bg,
                        badge.text,
                      )}
                    >
                      <span
                        className={cn("w-1.5 h-1.5 rounded-full", badge.dot)}
                      />
                      {badge.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {call.title}
                        </p>
                        <CallTypeBadge type={call.call_type} />
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        <span className="font-mono">{call.date}</span> a{" "}
                        <span className="font-mono">
                          {call.time.slice(0, 5)}
                        </span>{" "}
                        ·{" "}
                        <span className="font-mono">
                          {call.duration_minutes} min
                        </span>
                        {call.client && ` · ${call.client.full_name}`}
                      </p>
                    </div>
                    {isJoinable(call) ? (
                      <Link
                        href={`${prefix}/calls/${call.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="h-8 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-1.5 shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Rejoindre
                      </Link>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </motion.div>

      {/* Form modal */}
      <CallFormModal
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditCall(null);
        }}
        editCall={editCall}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </motion.div>
  );
}
