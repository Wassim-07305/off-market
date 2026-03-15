"use client";

import { useState, useMemo } from "react";
import { useClosingStats } from "@/hooks/use-closing-stats";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Target,
  Download,
  Clock,
  Users,
  UserCheck,
  UserMinus,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { exportToCSV } from "@/hooks/use-reports";

const SOURCE_COLORS: Record<string, string> = {
  instagram: "#E4405F",
  linkedin: "#0A66C2",
  referral: "#22c55e",
  website: "#6366f1",
  lead_magnet: "#f59e0b",
  other: "#a1a1aa",
};

function getRateColor(rate: number): string {
  if (rate >= 50) return "#22c55e";
  if (rate >= 30) return "#84cc16";
  if (rate >= 15) return "#f59e0b";
  return "#ef4444";
}

interface DateRangeOption {
  label: string;
  value: string;
  from?: string;
  to?: string;
}

function getDateOptions(): DateRangeOption[] {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 6,
    now.getDate(),
  );
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate(),
  );

  return [
    { label: "Tout", value: "all" },
    {
      label: "90 jours",
      value: "90d",
      from: ninetyDaysAgo.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    },
    {
      label: "6 mois",
      value: "6m",
      from: sixMonthsAgo.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    },
    {
      label: "12 mois",
      value: "12m",
      from: oneYearAgo.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    },
  ];
}

export function ClosingRateChart() {
  const dateOptions = useMemo(() => getDateOptions(), []);
  const [selectedPeriod, setSelectedPeriod] = useState(dateOptions[0]);

  const { data, isLoading } = useClosingStats({
    from: selectedPeriod.from,
    to: selectedPeriod.to,
  });

  const chartData = useMemo(() => {
    if (!data?.bySource) return [];
    return data.bySource.map((s) => ({
      name: s.sourceLabel,
      source: s.source,
      rate: s.closingRate,
      clients: s.clientCount,
      perdus: s.perduCount,
      total: s.totalContacts,
    }));
  }, [data]);

  const handleExport = () => {
    if (!data) return;
    exportToCSV(
      "closing-rates.csv",
      [
        "Source",
        "Total",
        "Clients",
        "Perdus",
        "Taux closing (%)",
        "Valeur moy (EUR)",
        "Temps moy (jours)",
      ],
      data.bySource.map((s) => [
        s.sourceLabel,
        String(s.totalContacts),
        String(s.clientCount),
        String(s.perduCount),
        String(s.closingRate),
        String(s.avgDealValue),
        s.avgTimeToCloseDays !== null ? String(s.avgTimeToCloseDays) : "—",
      ]),
    );
  };

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Taux de closing par source
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Performance de conversion par canal d&apos;acquisition
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedPeriod.value}
              onChange={(e) => {
                const opt = dateOptions.find((o) => o.value === e.target.value);
                if (opt) setSelectedPeriod(opt);
              }}
              className="h-8 pl-3 pr-8 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>
          <button
            onClick={handleExport}
            disabled={!data}
            className="h-8 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-shimmer rounded-xl bg-muted/30"
              />
            ))}
          </div>
          <div className="h-64 animate-shimmer rounded-xl bg-muted/30" />
        </div>
      ) : !data ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          Pas de donnees disponibles
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI summary row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <Users className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Total contacts
                </span>
              </div>
              <p className="text-xl font-display font-bold text-foreground">
                {data.overall.totalContacts.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Taux closing global
                </span>
              </div>
              <p className="text-xl font-display font-bold text-foreground">
                {data.overall.overallClosingRate}%
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Valeur moy. deal
                </span>
              </div>
              <p className="text-xl font-display font-bold text-foreground">
                {formatCurrency(data.overall.avgDealValue)}
              </p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">
                  Temps moy. closing
                </span>
              </div>
              <p className="text-xl font-display font-bold text-foreground">
                {data.overall.avgTimeToCloseDays !== null
                  ? `${data.overall.avgTimeToCloseDays}j`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Horizontal bar chart */}
          {chartData.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
              <Target className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Aucun contact avec source definie</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barGap={4}>
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
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
                    formatter={(value) => [`${value}%`, "Taux closing"]}
                    labelFormatter={(label) => String(label)}
                  />
                  <Bar
                    dataKey="rate"
                    name="Taux closing"
                    radius={[0, 6, 6, 0]}
                    barSize={20}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          SOURCE_COLORS[entry.source] ??
                          getRateColor(entry.rate)
                        }
                      />
                    ))}
                    <LabelList
                      dataKey="rate"
                      position="right"
                      formatter={(v) => `${v}%`}
                      style={{
                        fill: "var(--muted-foreground)",
                        fontSize: 11,
                        fontFamily: "var(--font-mono)",
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed table */}
          {data.bySource.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Source
                    </th>
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Total
                    </th>
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Clients
                    </th>
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Perdus
                    </th>
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Taux closing
                    </th>
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Valeur moy
                    </th>
                    <th className="pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider text-right">
                      Temps moy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.bySource.map((source) => (
                    <tr
                      key={source.source}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                SOURCE_COLORS[source.source] ?? "#a1a1aa",
                            }}
                          />
                          <span className="text-[13px] text-foreground">
                            {source.sourceLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 text-[13px] text-foreground text-right font-mono">
                        {source.totalContacts}
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-[13px] text-emerald-600 font-mono">
                          {source.clientCount}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className="text-[13px] text-red-500 font-mono">
                          {source.perduCount}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center h-5 px-2 rounded-full text-[11px] font-mono font-medium",
                            source.closingRate >= 30
                              ? "bg-emerald-500/10 text-emerald-600"
                              : source.closingRate >= 15
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-red-500/10 text-red-600",
                          )}
                        >
                          {source.closingRate}%
                        </span>
                      </td>
                      <td className="py-2.5 text-[13px] text-foreground text-right font-mono">
                        {source.avgDealValue > 0
                          ? formatCurrency(source.avgDealValue)
                          : "—"}
                      </td>
                      <td className="py-2.5 text-[13px] text-foreground text-right font-mono">
                        {source.avgTimeToCloseDays !== null
                          ? `${source.avgTimeToCloseDays}j`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
