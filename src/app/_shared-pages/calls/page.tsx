"use client";

import { useState } from "react";
import { useCalls } from "@/hooks/use-calls";
import { WeekView } from "@/components/calls/week-view";
import { CallFormModal } from "@/components/calls/call-form-modal";
import { CallTypeBadge } from "@/components/calls/call-type-badge";
import { CALL_STATUS_COLORS, type CallCalendarWithRelations } from "@/types/calls";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import Link from "next/link";
import {
  Phone,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  List,
  Video,
} from "lucide-react";

export default function CallsPage() {
  const [view, setView] = useState<"week" | "list">("week");
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [showForm, setShowForm] = useState(false);
  const [editCall, setEditCall] = useState<CallCalendarWithRelations | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>();
  const [defaultTime, setDefaultTime] = useState<string>();

  const prefix = useRoutePrefix();
  const { calls, isLoading } = useCalls(weekStart);

  /** An appointment is joinable 15 min before → 30 min after its scheduled time */
  const isJoinable = (call: CallCalendarWithRelations) => {
    if (call.status === "annule") return false;
    const callDate = new Date(`${call.date}T${call.time}`);
    const now = Date.now();
    const fifteenMinBefore = callDate.getTime() - 15 * 60_000;
    const thirtyMinAfter = callDate.getTime() + 30 * 60_000;
    return now >= fifteenMinBefore && now <= thirtyMinAfter;
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
    const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"];
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
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Appels
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {calls.length} appel{calls.length !== 1 ? "s" : ""} cette semaine
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-xs)" }}>
            <button
              onClick={() => setView("week")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                view === "week" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              Semaine
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                view === "list" ? "bg-foreground text-background" : "bg-surface text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
              Liste
            </button>
          </div>
          <button
            onClick={handleNewCall}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvel appel
          </button>
        </div>
      </motion.div>

      {/* Week navigation */}
      <motion.div
        variants={staggerItem}
        className="flex items-center gap-3"
      >
        <button
          onClick={() => navigateWeek(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToToday}
          className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          Aujourd&apos;hui
        </button>
        <button
          onClick={() => navigateWeek(1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground font-mono">
          {formatWeekRange()}
        </span>
      </motion.div>

      {/* Content */}
      <motion.div variants={staggerItem}>
        {view === "week" ? (
          <WeekView
            calls={calls}
            weekStart={weekStart}
            isLoading={isLoading}
            onCallClick={handleCallClick}
            onSlotClick={handleSlotClick}
          />
        ) : (
          <div className="bg-surface rounded-2xl divide-y divide-border/30" style={{ boxShadow: "var(--shadow-card)" }}>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-shimmer" />
                ))}
              </div>
            ) : calls.length === 0 ? (
              <div className="p-12 text-center">
                <Phone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun appel cette semaine
                </p>
              </div>
            ) : (
              calls.map((call) => (
                <button
                  key={call.id}
                  onClick={() => handleCallClick(call)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                >
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", CALL_STATUS_COLORS[call.status])} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{call.title}</p>
                      <CallTypeBadge type={call.call_type} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{call.date}</span> a <span className="font-mono">{call.time.slice(0, 5)}</span> · <span className="font-mono">{call.duration_minutes} min</span>
                      {call.client && ` · ${call.client.full_name}`}
                    </p>
                  </div>
                  {isJoinable(call) ? (
                    <Link
                      href={`${prefix}/calls/${call.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 px-3 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Video className="w-3 h-3" />
                      Rejoindre
                    </Link>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))
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
