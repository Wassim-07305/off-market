"use client";

import { useState, useMemo } from "react";
import {
  usePeriodComparison,
  type PeriodKPIs,
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
} from "lucide-react";

function getDefaultPeriods() {
  const now = new Date();
  // Period 2 = current month
  const p2From = new Date(now.getFullYear(), now.getMonth(), 1);
  const p2To = now;
  // Period 1 = previous month
  const p1From = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const p1To = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    p1From: p1From.toISOString().split("T")[0],
    p1To: p1To.toISOString().split("T")[0],
    p2From: p2From.toISOString().split("T")[0],
    p2To: p2To.toISOString().split("T")[0],
  };
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground">
        <Minus className="w-3 h-3" />
        0%
      </span>
    );
  }

  const isPositive = delta > 0;
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

interface KPICardProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value1: string;
  value2: string;
  delta: number;
}

function KPICard({ label, icon: Icon, value1, value2, delta }: KPICardProps) {
  return (
    <div className="bg-muted/30 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] text-muted-foreground">Période 1</p>
          <p className="text-sm font-semibold text-foreground">{value1}</p>
        </div>
        <div className="space-y-0.5 text-right">
          <p className="text-[10px] text-muted-foreground">Période 2</p>
          <p className="text-sm font-semibold text-foreground">{value2}</p>
        </div>
      </div>
      <div className="pt-1 border-t border-border">
        <DeltaBadge delta={delta} />
      </div>
    </div>
  );
}

export function PeriodComparison() {
  const defaults = useMemo(() => getDefaultPeriods(), []);
  const [p1From, setP1From] = useState(defaults.p1From);
  const [p1To, setP1To] = useState(defaults.p1To);
  const [p2From, setP2From] = useState(defaults.p2From);
  const [p2To, setP2To] = useState(defaults.p2To);

  const { data, isLoading } = usePeriodComparison({
    period1From: new Date(p1From).toISOString(),
    period1To: new Date(p1To + "T23:59:59").toISOString(),
    period2From: new Date(p2From).toISOString(),
    period2To: new Date(p2To + "T23:59:59").toISOString(),
  });

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <GitCompare className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">
          Comparaison de périodes
        </h3>
      </div>

      {/* Date pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Période 1
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={p1From}
              onChange={(e) => setP1From(e.target.value)}
              className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="date"
              value={p1To}
              onChange={(e) => setP1To(e.target.value)}
              className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Période 2
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={p2From}
              onChange={(e) => setP2From(e.target.value)}
              className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <input
              type="date"
              value={p2To}
              onChange={(e) => setP2To(e.target.value)}
              className="flex-1 h-8 px-2.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-shimmer rounded-xl bg-muted/30"
            />
          ))}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            label="Revenus"
            icon={DollarSign}
            value1={formatCurrency(data.period1.revenue)}
            value2={formatCurrency(data.period2.revenue)}
            delta={data.deltas.revenue}
          />
          <KPICard
            label="Nouveaux clients"
            icon={Users}
            value1={String(data.period1.newClients)}
            value2={String(data.period2.newClients)}
            delta={data.deltas.newClients}
          />
          <KPICard
            label="Appels completes"
            icon={Phone}
            value1={String(data.period1.callsCompleted)}
            value2={String(data.period2.callsCompleted)}
            delta={data.deltas.callsCompleted}
          />
          <KPICard
            label="Leçons terminées"
            icon={GraduationCap}
            value1={String(data.period1.lessonsCompleted)}
            value2={String(data.period2.lessonsCompleted)}
            delta={data.deltas.lessonsCompleted}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          Sélectionnez deux périodes pour comparer
        </p>
      )}
    </div>
  );
}
