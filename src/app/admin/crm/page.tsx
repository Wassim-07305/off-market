"use client";

import { useState, useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { Users, Megaphone, GraduationCap, TrendingUp, AlertTriangle, Heart, Calendar, ChevronDown, ChevronRight, Search, PhoneCall } from "lucide-react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";

const DynamicLoader = () => (
  <div className="space-y-4 p-4">
    <div className="h-8 w-48 bg-muted/50 animate-pulse rounded-xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-2xl" />
      ))}
    </div>
  </div>
);

const ClientsPage = dynamic(
  () => import("@/app/_shared-pages/clients/page"),
  { ssr: false, loading: DynamicLoader },
);
const SetterPipelinePage = dynamic(
  () => import("@/app/sales/pipeline/page").then((m) => ({ default: m.SetterPipelineView })),
  { ssr: false, loading: DynamicLoader },
);
const CloserPipelinePage = dynamic(
  () => import("@/app/sales/pipeline/page").then((m) => ({ default: m.CloserPipelineView })),
  { ssr: false, loading: DynamicLoader },
);

type CrmMode = "clients" | "pipeline" | "closer-pipeline" | "coaches";

const MODES: { key: CrmMode; label: string; icon: typeof Users }[] = [
  { key: "clients", label: "Clients", icon: Users },
  { key: "coaches", label: "Suivi Coaches", icon: GraduationCap },
  { key: "pipeline", label: "Pipeline Setter", icon: Megaphone },
  { key: "closer-pipeline", label: "Pipeline Closer", icon: PhoneCall },
];

// ─── Coach Monitoring Panel ──────────────────────────────────

function CoachMonitoringPanel() {
  const supabase = useSupabase();
  const [search, setSearch] = useState("");
  const [expandedCoach, setExpandedCoach] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-coach-monitoring"],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // 1. Get all coaches
      const { data: coaches } = await sb
        .from("profiles")
        .select("id, full_name, avatar_url, email, specialties, last_seen_at, created_at")
        .in("role", ["coach"])
        .order("full_name");

      if (!coaches?.length) return { coaches: [], totals: { clients: 0, atRisk: 0, avgHealth: 0, sessions: 0 } };

      // 2. Get all active assignments
      const { data: assignments } = await sb
        .from("coach_assignments")
        .select("coach_id, client_id, assigned_at")
        .eq("status", "active");

      // 3. Get student details for health/flag/tag
      const clientIds = (assignments ?? []).map((a: { client_id: string }) => a.client_id);
      let detailsMap = new Map<string, { health_score: number; tag: string; flag: string; pipeline_stage: string; niche: string; goals: string }>();
      if (clientIds.length > 0) {
        const { data: details } = await sb
          .from("student_details")
          .select("profile_id, health_score, tag, flag, pipeline_stage, niche, goals")
          .in("profile_id", clientIds);
        for (const d of details ?? []) {
          detailsMap.set(d.profile_id, d);
        }
      }

      // 4. Get client profiles
      let clientProfileMap = new Map<string, { full_name: string; email: string; avatar_url: string | null }>();
      if (clientIds.length > 0) {
        const { data: clientProfiles } = await sb
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", clientIds);
        for (const cp of clientProfiles ?? []) {
          clientProfileMap.set(cp.id, cp);
        }
      }

      // 5. Get sessions this month per coach
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: sessions } = await sb
        .from("call_calendar")
        .select("assigned_to, id, status")
        .in("status", ["realise", "completed", "planifie"])
        .gte("date", startOfMonth.split("T")[0]);

      const sessionsByCoach = new Map<string, { total: number; completed: number }>();
      for (const s of sessions ?? []) {
        const curr = sessionsByCoach.get(s.assigned_to) ?? { total: 0, completed: 0 };
        curr.total++;
        if (s.status === "realise" || s.status === "completed") curr.completed++;
        sessionsByCoach.set(s.assigned_to, curr);
      }

      // 6. Build enriched coach data
      const assignmentsByCoach = new Map<string, { client_id: string; assigned_at: string }[]>();
      for (const a of assignments ?? []) {
        const list = assignmentsByCoach.get(a.coach_id) ?? [];
        list.push(a);
        assignmentsByCoach.set(a.coach_id, list);
      }

      let totalClients = 0;
      let totalAtRisk = 0;
      let totalHealth = 0;
      let healthCount = 0;
      let totalSessions = 0;

      const enrichedCoaches = (coaches as { id: string; full_name: string; avatar_url: string | null; email: string; specialties: string[] | null; last_seen_at: string | null; created_at: string }[]).map((coach) => {
        const coachAssignments = assignmentsByCoach.get(coach.id) ?? [];
        const coachSessions = sessionsByCoach.get(coach.id) ?? { total: 0, completed: 0 };
        const clients = coachAssignments.map((a) => {
          const profile = clientProfileMap.get(a.client_id);
          const detail = detailsMap.get(a.client_id);
          return {
            id: a.client_id,
            full_name: profile?.full_name ?? "?",
            email: profile?.email ?? "",
            avatar_url: profile?.avatar_url ?? null,
            health_score: detail?.health_score ?? 50,
            tag: detail?.tag ?? "standard",
            flag: detail?.flag ?? "green",
            pipeline_stage: detail?.pipeline_stage ?? "onboarding",
            niche: detail?.niche ?? null,
            goals: detail?.goals ?? null,
            assigned_at: a.assigned_at,
          };
        });

        const atRisk = clients.filter((c) => c.tag === "at_risk" || c.flag === "red" || c.flag === "orange");
        const avgHealth = clients.length > 0
          ? Math.round(clients.reduce((s, c) => s + c.health_score, 0) / clients.length)
          : 0;

        totalClients += clients.length;
        totalAtRisk += atRisk.length;
        totalSessions += coachSessions.total;
        if (clients.length > 0) {
          totalHealth += avgHealth * clients.length;
          healthCount += clients.length;
        }

        return {
          ...coach,
          specialties: coach.specialties ?? [],
          clientCount: clients.length,
          atRiskCount: atRisk.length,
          avgHealth,
          sessionsTotal: coachSessions.total,
          sessionsCompleted: coachSessions.completed,
          retentionRate: clients.length > 0 ? Math.round(((clients.length - atRisk.length) / clients.length) * 100) : 100,
          clients,
        };
      });

      // Sort by client count desc, then by at-risk desc
      enrichedCoaches.sort((a, b) => b.clientCount - a.clientCount || b.atRiskCount - a.atRiskCount);

      return {
        coaches: enrichedCoaches,
        totals: {
          clients: totalClients,
          atRisk: totalAtRisk,
          avgHealth: healthCount > 0 ? Math.round(totalHealth / healthCount) : 0,
          sessions: totalSessions,
        },
      };
    },
  });

  const coaches = data?.coaches ?? [];
  const totals = data?.totals ?? { clients: 0, atRisk: 0, avgHealth: 0, sessions: 0 };

  const filteredCoaches = search
    ? coaches.filter((c) => c.full_name.toLowerCase().includes(search.toLowerCase()))
    : coaches;

  const flagColor = (flag: string) => {
    switch (flag) {
      case "green": return "bg-emerald-500";
      case "yellow": return "bg-amber-500";
      case "orange": return "bg-orange-500";
      case "red": return "bg-red-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Coaches</span>
          </div>
          <p className="text-xl font-bold text-foreground">{coaches.length}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Clients assignes</span>
          </div>
          <p className="text-xl font-bold text-foreground">{totals.clients}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Eleves à risque</span>
          </div>
          <p className="text-xl font-bold text-amber-600">{totals.atRisk}</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Sessions ce mois</span>
          </div>
          <p className="text-xl font-bold text-foreground">{totals.sessions}</p>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un coach..."
          className="w-full h-9 pl-9 pr-4 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Coach Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredCoaches.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun coach trouve</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCoaches.map((coach) => (
            <div key={coach.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              {/* Coach Header */}
              <button
                onClick={() => setExpandedCoach(expandedCoach === coach.id ? null : coach.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                  {coach.avatar_url ? (
                    <img src={coach.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    coach.full_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{coach.full_name}</p>
                    {coach.specialties.length > 0 && (
                      <div className="flex gap-1 overflow-hidden">
                        {coach.specialties.slice(0, 2).map((s: string) => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                            {s}
                          </span>
                        ))}
                        {coach.specialties.length > 2 && (
                          <span className="text-[10px] text-muted-foreground">+{coach.specialties.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{coach.email}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{coach.clientCount}</p>
                    <p className="text-[10px] text-muted-foreground">Clients</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-sm font-bold", coach.atRiskCount > 0 ? "text-amber-600" : "text-foreground")}>
                      {coach.atRiskCount}
                    </p>
                    <p className="text-[10px] text-muted-foreground">A risque</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1">
                      <Heart className={cn("w-3 h-3", coach.avgHealth >= 70 ? "text-emerald-500" : coach.avgHealth >= 40 ? "text-amber-500" : "text-red-500")} />
                      <p className="text-sm font-bold text-foreground">{coach.avgHealth}%</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Sante moy.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{coach.sessionsCompleted}/{coach.sessionsTotal}</p>
                    <p className="text-[10px] text-muted-foreground">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-sm font-bold", coach.retentionRate >= 80 ? "text-emerald-600" : coach.retentionRate >= 50 ? "text-amber-600" : "text-red-600")}>
                      {coach.retentionRate}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Retention</p>
                  </div>
                </div>

                {expandedCoach === coach.id ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Expanded client list */}
              {expandedCoach === coach.id && (
                <div className="border-t border-border bg-muted/20 px-4 py-3">
                  {coach.clients.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Aucun client assigne</p>
                  ) : (
                    <div className="space-y-1">
                      <div className="overflow-x-auto">
                    <div className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 px-2 pb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        <span>Client</span>
                        <span className="text-center">Sante</span>
                        <span className="text-center">Drapeau</span>
                        <span className="text-center">Étape</span>
                        <span className="text-center">Niche</span>
                      </div>
                      {coach.clients.map((client: { id: string; full_name: string; health_score: number; flag: string; pipeline_stage: string; niche: string | null }) => (
                        <div key={client.id} className="grid grid-cols-[1fr_80px_80px_80px_100px] gap-2 items-center px-2 py-1.5 rounded-lg hover:bg-surface transition-colors">
                          <span className="text-sm text-foreground truncate">{client.full_name}</span>
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn("h-full rounded-full", client.health_score >= 70 ? "bg-emerald-500" : client.health_score >= 40 ? "bg-amber-500" : "bg-red-500")}
                                style={{ width: `${client.health_score}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">{client.health_score}</span>
                          </div>
                          <div className="flex justify-center">
                            <span className={cn("w-2.5 h-2.5 rounded-full", flagColor(client.flag))} />
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center capitalize">{client.pipeline_stage}</span>
                          <span className="text-[10px] text-muted-foreground text-center truncate">{client.niche ?? "-"}</span>
                        </div>
                      ))}
                    </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function AdminCrmPage() {
  const [mode, setMode] = useState<CrmMode>("clients");

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 w-fit">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              mode === m.key
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>
      </div>

      {/* Content */}
      {mode === "clients" ? (
        <ClientsPage />
      ) : mode === "coaches" ? (
        <CoachMonitoringPanel />
      ) : mode === "closer-pipeline" ? (
        <CloserPipelinePage />
      ) : (
        <SetterPipelinePage />
      )}
    </div>
  );
}
