"use client";

import { useMemo } from "react";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { CoachStudentsOverview } from "@/components/dashboard/coach-students-overview";
import { CoachActivityFeed } from "@/components/dashboard/coach-activity-feed";
import { CoachMetrics } from "@/components/dashboard/coach-metrics";
import { RiskAnalysisPanel } from "@/components/dashboard/risk-analysis-panel";
import { AiPeriodicReport } from "@/components/dashboard/ai-periodic-report";
import { CoachAlertsPanel } from "@/components/crm/coach-alerts-panel";
import { CoachUnreadMessages } from "@/components/dashboard/coach-unread-messages";
import { CoachWeeklySummary } from "@/components/dashboard/coach-weekly-summary";
import { useStudents, getStudentDetail } from "@/hooks/use-students";
import { useCoachAlerts } from "@/hooks/use-coach-alerts";
import { useSessions } from "@/hooks/use-sessions";
import { useAuth } from "@/hooks/use-auth";
import {
  Users,
  AlertTriangle,
  CalendarCheck,
  HeartPulse,
  Megaphone,
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

export default function CoachDashboardPage() {
  const { profile } = useAuth();
  const { students, isLoading: studentsLoading } = useStudents({ limit: 200 });
  const { isLoading: alertsLoading } = useCoachAlerts();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const { data: announcements } = useAnnouncements();
  const upcoming = useMemo(() => {
    if (!sessionsData) return [];
    const now = new Date().toISOString();
    return sessionsData.filter(
      (s) => s.status === "scheduled" && s.scheduled_at > now,
    );
  }, [sessionsData]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const atRiskCount = students.filter(
      (s) => getStudentDetail(s)?.tag === "at_risk",
    ).length;
    const upcomingSessions = upcoming.length;
    const avgHealth =
      totalStudents > 0
        ? Math.round(
            students.reduce(
              (sum, s) => sum + (getStudentDetail(s)?.health_score ?? 0),
              0,
            ) / totalStudents,
          )
        : 0;

    return { totalStudents, atRiskCount, upcomingSessions, avgHealth };
  }, [students, upcoming]);

  const isLoading = studentsLoading || alertsLoading || sessionsLoading;
  const firstName = profile?.full_name?.split(" ")[0] ?? "Coach";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-lg font-semibold text-foreground">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Voici un aperçu de tes élèves et de ton activité
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-[14px] p-5 animate-pulse"
            >
              <div className="h-4 w-24 bg-zinc-100 rounded mb-4" />
              <div className="h-7 w-16 bg-zinc-100 rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total eleves"
              value={stats.totalStudents}
              icon={Users}
            />
            <StatCard
              title="A risque"
              value={stats.atRiskCount}
              icon={AlertTriangle}
              className={
                stats.atRiskCount > 0 ? "border-red-200 bg-red-50/30" : ""
              }
            />
            <StatCard
              title="Sessions à venir"
              value={stats.upcomingSessions}
              icon={CalendarCheck}
            />
            <StatCard
              title="Sante moyenne"
              value={`${stats.avgHealth}%`}
              icon={HeartPulse}
            />
          </>
        )}
      </motion.div>


      {/* Alerts section */}
      <motion.div variants={staggerItem}>
        <CoachAlertsPanel />
      </motion.div>

      {/* 2-column layout */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-5 gap-4"
      >
        {/* Left: Students overview (3 cols) */}
        <div className="lg:col-span-3">
          <CoachStudentsOverview />
        </div>

        {/* Right: Activity feed + Metrics (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Annonces */}
          <div className="bg-surface border border-border rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <div className="size-7 rounded-lg bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center">
                  <Megaphone className="size-3.5 text-white" />
                </div>
                Annonces
              </h3>
              <Link
                href="/coach/feed"
                className="text-xs text-[#AF0000] hover:text-[#DC2626] transition-colors font-medium"
              >
                Voir tout
              </Link>
            </div>

            {!announcements ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-12 bg-zinc-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-2">
                {announcements.slice(0, 3).map((ann) => {
                  const dateStr = new Date(ann.created_at).toLocaleDateString(
                    "fr-FR",
                    { day: "numeric", month: "short" },
                  );
                  return (
                    <div
                      key={ann.id}
                      className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 flex items-start gap-3 hover:border-border transition-colors"
                    >
                      <div
                        className={cn(
                          "size-8 rounded-lg flex items-center justify-center shrink-0",
                          ann.type === "info"
                            ? "bg-gradient-to-br from-blue-100 to-blue-50"
                            : ann.type === "success"
                              ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                              : ann.type === "warning"
                                ? "bg-gradient-to-br from-amber-100 to-amber-50"
                                : "bg-zinc-100",
                        )}
                      >
                        <Megaphone
                          className={cn(
                            "size-4",
                            ann.type === "info"
                              ? "text-blue-500"
                              : ann.type === "success"
                                ? "text-emerald-500"
                                : ann.type === "warning"
                                  ? "text-amber-500"
                                  : "text-muted-foreground",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {ann.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aucune annonce pour le moment.
              </p>
            )}
          </div>

          <CoachWeeklySummary />
          <CoachUnreadMessages />
          <AiPeriodicReport />
          <RiskAnalysisPanel />
          <CoachActivityFeed />
          <CoachMetrics />
        </div>
      </motion.div>
    </motion.div>
  );
}
