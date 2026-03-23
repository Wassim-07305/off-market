"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { formatDate, cn } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle,
  Check,
  FileText,
  MessageSquare,
  LogIn,
  Flag,
  StickyNote,
  Phone,
  CreditCard,
  ChevronDown,
  Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const activityIcons: Record<string, LucideIcon> = {
  module_started: BookOpen,
  module_completed: CheckCircle,
  lesson_completed: Check,
  form_submitted: FileText,
  message_sent: MessageSquare,
  login: LogIn,
  milestone_reached: Flag,
  note_added: StickyNote,
  call_scheduled: Phone,
  payment_received: CreditCard,
};

const activityLabels: Record<string, string> = {
  module_started: "a commence un module",
  module_completed: "a terminé un module",
  lesson_completed: "a terminé une leçon",
  form_submitted: "a soumis un formulaire",
  message_sent: "a envoye un message",
  login: "s'est connecte",
  milestone_reached: "a atteint un jalon",
  note_added: "note ajoutee",
  call_scheduled: "appel planifie",
  payment_received: "paiement recu",
};

const activityDotColors: Record<string, string> = {
  module_completed: "bg-success",
  lesson_completed: "bg-success",
  payment_received: "bg-success",
  milestone_reached: "bg-warning",
  message_sent: "bg-info",
  form_submitted: "bg-info",
  call_scheduled: "bg-primary",
};

const FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "module_started", label: "Modules" },
  { value: "lesson_completed", label: "Leçons" },
  { value: "form_submitted", label: "Formulaires" },
  { value: "message_sent", label: "Messages" },
  { value: "call_scheduled", label: "Appels" },
  { value: "payment_received", label: "Paiements" },
];

interface ActivityRow {
  id: string;
  student_id: string;
  activity_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  student: { full_name: string; avatar_url: string | null } | null;
}

export function CoachActivityFeed() {
  const supabase = useSupabase();
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);

  const { data: activities, isLoading } = useQuery({
    queryKey: ["coach-activity-feed", typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("student_activities")
        .select(
          "*, student:profiles!student_activities_student_id_fkey(full_name, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (typeFilter !== "all") {
        query = query.eq("activity_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityRow[];
    },
  });

  const displayedActivities = (activities ?? []).slice(0, displayCount);
  const hasMore = (activities ?? []).length > displayCount;

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h3 className="text-[13px] font-semibold text-foreground mb-4">
          Activité récente
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 animate-shimmer rounded-lg" />
                <div className="h-2.5 w-20 animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground">
          Activité récente
        </h3>

        {/* Type filter */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] bg-muted/50 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
          >
            {FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label}
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 z-20 bg-surface border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTypeFilter(opt.value);
                    setShowDropdown(false);
                    setDisplayCount(20);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-[13px] hover:bg-muted transition-colors",
                    typeFilter === opt.value
                      ? "text-primary font-medium"
                      : "text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity list */}
      <div className="relative max-h-[400px] overflow-y-auto">
        {displayedActivities.length > 0 && (
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        )}

        <div className="space-y-3">
          {displayedActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Activity className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Aucune activité recente</p>
            </div>
          ) : (
            displayedActivities.map((activity) => {
              const Icon = activityIcons[activity.activity_type] || BookOpen;
              const dotColor =
                activityDotColors[activity.activity_type] || "bg-primary";

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 relative group hover:bg-muted/30 -mx-2 px-2 py-1.5 rounded-lg transition-colors duration-200"
                >
                  <div className="relative z-10 w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                    <div className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground">
                      <span className="font-medium">
                        {activity.student?.full_name ?? "Utilisateur"}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {activityLabels[activity.activity_type] ??
                          activity.activity_type}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {formatDate(activity.created_at, "relative")}
                    </p>
                  </div>
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/50 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setDisplayCount((c) => c + 20)}
          className="w-full mt-4 py-2 text-[13px] text-primary hover:text-primary-hover font-medium rounded-xl hover:bg-primary/5 transition-colors"
        >
          Voir plus
        </button>
      )}
    </div>
  );
}
