"use client";

import { useState, useMemo } from "react";
import {
  usePeriodComparison,
  getPresetDates,
  COMPARISON_PRESETS,
  type ComparisonPreset,
  type MetricComparison,
} from "@/hooks/use-period-comparison";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  GitCompare,
  DollarSign,
  Users,
  Phone,
  GraduationCap,
  MessageSquare,
  Target,
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
} from "recharts";

const METRIC_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  revenue: DollarSign,
  newClients: Users,
  callsCompleted: Phone,
  lessonsCompleted: GraduationCap,
  messagesSent: MessageSquare,
  avgLeadScore: Target,
};

const METRIC_COLORS: Record<string, { current: string; previous: string }> = {
  revenue: { current: "#ef4444", previous: "#ef444460" },
  newClients: { current: "#3b82f6", previous: "#3b82f660" },
  callsCompleted: { current: "#22c55e", previous: "#22c55e60" },
  lessonsCompleted: { current: "#f59e0b", previous: "#f59e0b60" },
  messagesSent: { current: "#8b5cf6", previous: "#8b5cf660" },
  avgLeadScore: { current: "#ec4899", previous: "#ec489960" },
};

function DeltaBadge({
  delta,
  trend,
}: {
  delta: number;
  trend: "up" | "down" | "stable";
}) {
  if (trend === "stable") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }

  const isPositive = trend === "up";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-mono font-medium",
        isPositive ? "text-emerald-500" : "text-red-500",
      )}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {isPositive ? "+" : ""}
      {delta}%
    </span>
  );
}

function formatMetricValue(
  value: number,
  format: MetricComparison["format"],
): string {
  if (format === "currency") return formatCurrency(value);
  if (format === "percent") return `${value}%`;
  return value.toLocaleString("fr-FR");
}

function MetricCard({ metric }: { metric: MetricComparison }) {
  const Icon = METRIC_ICONS[metric.key] ?? Target;
  const colors = METRIC_COLORS[metric.key] ?? {
    current: "#ef4444",
    previous: "#ef444460",
  };

  const chartData = [
    { name: "Precedent", value: metric.previous },
    { name: "Actuel", value: metric.current },
  ];

  return (
    <div className="bg-muted/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">{metric.label}</span>
        </div>
        <DeltaBadge delta={metric.changePercent} trend={metric.trend} />
      </div>

      {/* Mini bar chart */}
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
              <Cell fill={colors.previous} />
              <Cell fill={colors.current} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground">Precedent</p>
          <p className="text-sm font-semibold text-foreground">
            {formatMetricValue(metric.previous, metric.format)}
          </p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-[10px] text-muted-foreground">Actuel</p>
          <p className="text-sm font-semibold text-foreground">
            {formatMetricValue(metric.current, metric.format)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsPeriodComparison() {
  const [preset, setPreset] = useState<ComparisonPreset>("month");
  const [showCustom, setShowCustom] = useState(false);
  const presetDates = useMemo(() => getPresetDates(preset), [preset]);

  const [customP1From, setCustomP1From] = useState(presetDates.p1From);
  const [customP1To, setCustomP1To] = useState(presetDates.p1To);
  const [customP2From, setCustomP2From] = useState(presetDates.p2From);
  const [customP2To, setCustomP2To] = useState(presetDates.p2To);

  const isCustom = preset === "custom";
  const p1From = isCustom ? customP1From : presetDates.p1From;
  const p1To = isCustom ? customP1To : presetDates.p1To;
  const p2From = isCustom ? customP2From : presetDates.p2From;
  const p2To = isCustom ? customP2To : presetDates.p2To;

  const { data, isLoading } = usePeriodComparison({
    period1From: new Date(p1From).toISOString(),
    period1To: new Date(p1To + "T23:59:59").toISOString(),
    period2From: new Date(p2From).toISOString(),
    period2To: new Date(p2To + "T23:59:59").toISOString(),
  });

  // Build summary chart data (all metrics side by side)
  const summaryChartData = useMemo(() => {
    if (!data?.metrics) return [];
    return data.metrics.map((m) => ({
      name: m.label,
      precedent: m.previous,
      actuel: m.current,
    }));
  }, [data]);

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Comparaison de périodes
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Comparez les metriques entre deux périodes
            </p>
          </div>
        </div>

        {/* Preset selector */}
        <div className="relative">
          <select
            value={preset}
            onChange={(e) => {
              const val = e.target.value as ComparisonPreset;
              setPreset(val);
              setShowCustom(val === "custom");
            }}
            className="h-8 pl-3 pr-8 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            {COMPARISON_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Custom date pickers */}
      {isCustom && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Période precedente
            </p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customP1From}
                onChange={(e) => setCustomP1From(e.target.value)}
                className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">-</span>
              <input
                type="date"
                value={customP1To}
                onChange={(e) => setCustomP1To(e.target.value)}
                className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Période actuelle
            </p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customP2From}
                onChange={(e) => setCustomP2From(e.target.value)}
                className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-xs text-muted-foreground">-</span>
              <input
                type="date"
                value={customP2To}
                onChange={(e) => setCustomP2To(e.target.value)}
                className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* Metric cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 animate-shimmer rounded-xl bg-muted/30"
            />
          ))}
        </div>
      ) : data?.metrics ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {data.metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sélectionnez deux périodes pour comparer
        </p>
      )}
    </div>
  );
}
