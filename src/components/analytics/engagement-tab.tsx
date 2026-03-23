"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { RetentionChart } from "@/components/analytics/retention-chart";
import {
  Users,
  UserCheck,
  UserMinus,
  Heart,
  Activity,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useEngagementReport, exportToCSV } from "@/hooks/use-reports";
import type { DateRange } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface EngagementTabProps {
  range: DateRange;
}

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function useRetentionClients() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["retention-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("created_at, last_seen_at")
        .eq("role", "client");
      if (error) throw error;
      return data as Array<{ created_at: string; last_seen_at: string | null }>;
    },
  });
}

export function EngagementTab({ range }: EngagementTabProps) {
  const { data, isLoading } = useEngagementReport(range);
  const { data: retentionClients } = useRetentionClients();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl p-6 animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="h-3 w-20 bg-muted rounded-lg mb-3" />
              <div className="h-8 w-24 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const handleExport = () => {
    exportToCSV(
      "engagement.csv",
      ["Type d'activité", "Nombre"],
      data.activityByType.map((a) => [a.label, String(a.count)]),
    );
  };

  // Heatmap: compute max for color intensity
  const maxHeatmapCount = Math.max(
    ...data.activityHeatmap.map((h) => h.count),
    1,
  );
  const heatmapGrid = new Map<string, number>();
  for (const h of data.activityHeatmap) {
    heatmapGrid.set(`${h.day}-${h.hour}`, h.count);
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Clients total"
          value={data.totalClients}
          icon={Users}
        />
        <StatCard
          title="Clients actifs"
          value={data.activeClients}
          icon={UserCheck}
        />
        <StatCard
          title="Taux retention"
          value={`${data.retentionRate}%`}
          icon={Heart}
        />
        <StatCard
          title="Score sante moyen"
          value={data.avgHealthScore}
          icon={Activity}
        />
      </div>

      {/* Tag distribution + Activity by type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tag distribution */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Segmentation des eleves
          </h3>
          <div className="space-y-3">
            {data.tagDistribution.map((tag) => {
              const pct =
                data.totalClients > 0
                  ? Math.round((tag.count / data.totalClients) * 100)
                  : 0;
              return (
                <div key={tag.tag}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium",
                          tag.color,
                        )}
                      >
                        {tag.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {tag.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/60 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity by type */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-semibold text-foreground">
              Activites par type
            </h3>
            <button
              onClick={handleExport}
              className="h-8 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
          <div className="h-64">
            {data.activityByType.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Activity className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucune activité sur cette période</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.activityByType} layout="vertical">
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    width={110}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "13px",
                      boxShadow: "var(--shadow-elevated)",
                      padding: "8px 12px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Actions"
                    fill="var(--primary)"
                    radius={[0, 6, 6, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h3 className="text-[13px] font-semibold text-foreground mb-1">
          Heatmap d&apos;activité
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Activite par jour et heure
        </p>
        {data.activityHeatmap.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Pas assez de donnees pour afficher le heatmap
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Hour labels */}
              <div className="flex mb-1 ml-12">
                {[6, 8, 10, 12, 14, 16, 18, 20, 22].map((h) => (
                  <div
                    key={h}
                    className="text-[10px] text-muted-foreground font-mono"
                    style={{
                      width: `${(100 / 24) * 2}%`,
                      marginLeft: `${((h - 6) / 24) * 100 - (h > 6 ? ((h - 6 - 2) / 24) * 100 : 0)}%`,
                    }}
                  >
                    {h}h
                  </div>
                ))}
              </div>
              {/* Grid */}
              {DAY_LABELS.map((dayLabel, dayIdx) => (
                <div key={dayIdx} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-muted-foreground w-8 text-right font-mono">
                    {dayLabel}
                  </span>
                  <div className="flex-1 flex gap-[2px]">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const count = heatmapGrid.get(`${dayIdx}-${hour}`) ?? 0;
                      const intensity =
                        count > 0 ? Math.max(0.15, count / maxHeatmapCount) : 0;
                      return (
                        <div
                          key={hour}
                          className="flex-1 h-5 rounded-[3px] transition-colors"
                          style={{
                            backgroundColor:
                              count > 0
                                ? `rgba(var(--primary-rgb, 99, 102, 241), ${intensity})`
                                : "var(--muted)",
                          }}
                          title={`${dayLabel} ${hour}h: ${count} actions`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Retention curve */}
      {retentionClients && retentionClients.length > 0 && (
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <RetentionChart clients={retentionClients} />
        </div>
      )}

      {/* Bottom stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Nouveaux clients
          </p>
          <p className="text-xl font-display font-bold text-foreground">
            {data.newClientsInPeriod}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            sur la période
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Clients perdus
          </p>
          <p className="text-xl font-display font-bold text-error">
            {data.churnedClients}
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Humeur moyenne
          </p>
          <p className="text-xl font-display font-bold text-foreground">
            {data.avgMood || "—"}/5
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Check-ins
          </p>
          <p className="text-xl font-display font-bold text-foreground">
            {data.checkinsCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            sur la période
          </p>
        </div>
      </div>
    </div>
  );
}
