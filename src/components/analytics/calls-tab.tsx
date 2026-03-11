"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { Phone, PhoneOff, Clock, CheckCircle, Download } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useCallMetrics, exportToCSV } from "@/hooks/use-reports";
import type { DateRange } from "@/types/analytics";

interface CallsTabProps {
  range: DateRange;
}

export function CallsTab({ range }: CallsTabProps) {
  const { data, isLoading } = useCallMetrics(range);

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
      "appels.csv",
      ["Mois", "Total", "Realises"],
      data.callsByMonth.map((m) => [
        m.label,
        String(m.count),
        String(m.completed),
      ]),
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total appels" value={data.totalCalls} icon={Phone} />
        <StatCard
          title="Taux completion"
          value={`${data.completionRate}%`}
          icon={CheckCircle}
        />
        <StatCard
          title="Taux no-show"
          value={`${data.noShowRate}%`}
          icon={PhoneOff}
        />
        <StatCard
          title="Duree moyenne"
          value={`${data.avgDurationMinutes} min`}
          icon={Clock}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calls by month */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[13px] font-semibold text-foreground">
                Appels par mois
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.totalDurationHours}h au total
              </p>
            </div>
            <button
              onClick={handleExport}
              className="h-8 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
          <div className="h-64">
            {data.callsByMonth.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Phone className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucun appel sur cette periode</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.callsByMonth}>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    width={30}
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
                    name="Total"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                    opacity={0.3}
                  />
                  <Bar
                    dataKey="completed"
                    name="Realises"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mood distribution */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-6">
            Humeur post-appel
          </h3>
          {data.moodDistribution.every((m) => m.count === 0) ? (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm">Aucune note d&apos;appel</p>
            </div>
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.moodDistribution.filter((m) => m.count > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="count"
                      strokeWidth={0}
                    >
                      {data.moodDistribution
                        .filter((m) => m.count > 0)
                        .map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                    </Pie>
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {data.moodDistribution
                  .filter((m) => m.count > 0)
                  .map((m) => (
                    <div key={m.mood} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {m.label} ({m.count})
                      </span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom: call types + outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call types breakdown */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Par type d&apos;appel
          </h3>
          <div className="space-y-3">
            {data.callsByType.map((t) => {
              const pct =
                data.totalCalls > 0
                  ? Math.round((t.count / data.totalCalls) * 100)
                  : 0;
              return (
                <div key={t.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-foreground">
                      {t.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {t.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.callsByType.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun appel</p>
            )}
          </div>
        </div>

        {/* Outcomes */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Resultats des appels
          </h3>
          <div className="space-y-3">
            {data.outcomeDistribution.map((o) => {
              const total = data.outcomeDistribution.reduce(
                (s, x) => s + x.count,
                0,
              );
              const pct = total > 0 ? Math.round((o.count / total) * 100) : 0;
              return (
                <div key={o.outcome}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] text-foreground">
                      {o.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {o.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {data.outcomeDistribution.every((o) => o.count === 0) && (
              <p className="text-sm text-muted-foreground">
                Aucune note d&apos;appel enregistree
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
