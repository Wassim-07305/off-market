"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  CalendarCheck,
  Users,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
} from "lucide-react";

interface WeeklySummaryData {
  sessionsCompleted: number;
  sessionsScheduled: number;
  activeStudents: number;
  messagesReceived: number;
  checkinsReceived: number;
  formCompletions: number;
  prevSessionsCompleted: number;
  prevMessagesReceived: number;
}

function useCoachWeeklySummary() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-weekly-summary", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<WeeklySummaryData> => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const prevMonday = new Date(monday);
      prevMonday.setDate(prevMonday.getDate() - 7);

      const weekStart = monday.toISOString();
      const prevWeekStart = prevMonday.toISOString();
      const prevWeekEnd = monday.toISOString();

      const [
        sessionsThisWeek,
        sessionsLastWeek,
        messagesThisWeek,
        messagesLastWeek,
        checkinsRes,
        completionsRes,
        activeStudentsRes,
      ] = await Promise.all([
        supabase
          .from("sessions")
          .select("id, status")
          .gte("scheduled_at", weekStart),
        supabase
          .from("sessions")
          .select("id, status")
          .gte("scheduled_at", prevWeekStart)
          .lt("scheduled_at", prevWeekEnd),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekStart),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .gte("created_at", prevWeekStart)
          .lt("created_at", prevWeekEnd),
        supabase
          .from("weekly_checkins")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekStart),
        supabase
          .from("lesson_progress")
          .select("id", { count: "exact", head: true })
          .gte("completed_at", weekStart),
        supabase
          .from("student_details")
          .select("id", { count: "exact", head: true })
          .neq("tag", "churned"),
      ]);

      type SessionRow = { id: string; status: string };
      const thisWeekSessions = (sessionsThisWeek.data ?? []) as SessionRow[];
      const lastWeekSessions = (sessionsLastWeek.data ?? []) as SessionRow[];

      return {
        sessionsCompleted: thisWeekSessions.filter(
          (s) => s.status === "completed",
        ).length,
        sessionsScheduled: thisWeekSessions.filter(
          (s) => s.status === "scheduled",
        ).length,
        activeStudents: activeStudentsRes.count ?? 0,
        messagesReceived: messagesThisWeek.count ?? 0,
        checkinsReceived: checkinsRes.count ?? 0,
        formCompletions: completionsRes.count ?? 0,
        prevSessionsCompleted: lastWeekSessions.filter(
          (s) => s.status === "completed",
        ).length,
        prevMessagesReceived: messagesLastWeek.count ?? 0,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

function TrendIndicator({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous === 0 && current === 0) {
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  }
  if (current >= previous) {
    return <TrendingUp className="w-3 h-3 text-emerald-500" />;
  }
  return <TrendingDown className="w-3 h-3 text-red-500" />;
}

export function CoachWeeklySummary() {
  const { data, isLoading } = useCoachWeeklySummary();

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-4">
        <CalendarCheck className="w-4 h-4 text-muted-foreground" />
        Résumé hebdomadaire
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-shimmer rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <SummaryMetric
            icon={CalendarCheck}
            label="Sessions effectuees"
            value={data?.sessionsCompleted ?? 0}
            trend={
              <TrendIndicator
                current={data?.sessionsCompleted ?? 0}
                previous={data?.prevSessionsCompleted ?? 0}
              />
            }
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <SummaryMetric
            icon={CalendarCheck}
            label="Sessions à venir"
            value={data?.sessionsScheduled ?? 0}
            color="text-violet-500"
            bgColor="bg-violet-500/10"
          />
          <SummaryMetric
            icon={Users}
            label="Élèves actifs"
            value={data?.activeStudents ?? 0}
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
          <SummaryMetric
            icon={MessageSquare}
            label="Messages recus"
            value={data?.messagesReceived ?? 0}
            trend={
              <TrendIndicator
                current={data?.messagesReceived ?? 0}
                previous={data?.prevMessagesReceived ?? 0}
              />
            }
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <SummaryMetric
            icon={BookOpen}
            label="Check-ins recus"
            value={data?.checkinsReceived ?? 0}
            color="text-amber-500"
            bgColor="bg-amber-500/10"
          />
          <SummaryMetric
            icon={BookOpen}
            label="Leçons terminées"
            value={data?.formCompletions ?? 0}
            color="text-pink-500"
            bgColor="bg-pink-500/10"
          />
        </div>
      )}
    </div>
  );
}

function SummaryMetric({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  trend?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          bgColor,
        )}
      >
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground">{value}</p>
          {trend}
        </div>
      </div>
    </div>
  );
}
