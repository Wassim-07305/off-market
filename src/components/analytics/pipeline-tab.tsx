"use client";

import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Users,
  Target,
  TrendingUp,
  UserCheck,
  UserMinus,
  Download,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { usePipelineReport, exportToCSV } from "@/hooks/use-reports";

const STAGE_CHART_COLORS = [
  "#3b82f6", // prospect - blue
  "#6366f1", // qualifie - indigo
  "#f59e0b", // proposition - amber
  "#f97316", // closing - orange
  "#22c55e", // client - green
  "#71717a", // perdu - zinc
];

export function PipelineTab() {
  const { data, isLoading } = usePipelineReport();

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
      "pipeline.csv",
      ["Etape", "Contacts", "Valeur (EUR)"],
      data.contactsByStage.map((s) => [
        s.label,
        String(s.count),
        String(s.totalValue),
      ]),
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Contacts total"
          value={data.totalContacts}
          icon={Users}
        />
        <StatCard
          title="Valeur pipeline"
          value={formatCurrency(data.totalPipelineValue)}
          icon={Target}
        />
        <StatCard
          title="Taux conversion"
          value={`${data.conversionRate}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Deal moyen"
          value={formatCurrency(data.avgDealValue)}
          icon={Target}
        />
      </div>

      {/* Pipeline funnel chart */}
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Pipeline par etape
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Repartition des contacts dans le pipeline
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
        <div className="h-72">
          {data.contactsByStage.every((s) => s.count === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Users className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Aucun contact dans le pipeline</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.contactsByStage}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
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
                  formatter={(v, name) => {
                    if (name === "count") return [v, "Contacts"];
                    return [formatCurrency(Number(v)), "Valeur"];
                  }}
                />
                <Bar
                  dataKey="count"
                  name="count"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                >
                  {data.contactsByStage.map((_, idx) => (
                    <Cell key={idx} fill={STAGE_CHART_COLORS[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom: sources + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Sources d&apos;acquisition
          </h3>
          <div className="space-y-3">
            {data.contactsBySource
              .filter((s) => s.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((src) => {
                const pct =
                  data.totalContacts > 0
                    ? Math.round((src.count / data.totalContacts) * 100)
                    : 0;
                return (
                  <div key={src.source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] text-foreground">
                        {src.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {src.count} ({pct}%)
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
            {data.contactsBySource.every((s) => s.count === 0) && (
              <p className="text-sm text-muted-foreground">Aucun contact</p>
            )}
          </div>
        </div>

        {/* Recent conversions/losses */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            30 derniers jours
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {data.recentlyConverted}
                </p>
                <p className="text-xs text-muted-foreground">
                  Convertis en clients
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <UserMinus className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {data.recentlyLost}
                </p>
                <p className="text-xs text-muted-foreground">Perdus</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
