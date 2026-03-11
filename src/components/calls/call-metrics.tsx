"use client";

import { useState } from "react";
import { useCallMetrics } from "@/hooks/use-calls";
import { CALL_TYPES, SATISFACTION_CONFIG } from "@/types/calls";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import {
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  BarChart3,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CallMetrics() {
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  const dateRange = (() => {
    const now = new Date();
    if (period === "week") {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      return {
        from: from.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      };
    }
    if (period === "month") {
      const from = new Date(now);
      from.setMonth(from.getMonth() - 1);
      return {
        from: from.toISOString().split("T")[0],
        to: now.toISOString().split("T")[0],
      };
    }
    return undefined;
  })();

  const { data: metrics, isLoading } = useCallMetrics(dateRange);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const maxByDay = Math.max(...metrics.byDay, 1);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Period selector */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center justify-between"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Metriques d&apos;appels
        </h2>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          {(
            [
              { key: "week", label: "7j" },
              { key: "month", label: "30j" },
              { key: "all", label: "Tout" },
            ] as const
          ).map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "h-8 px-3 text-xs font-medium transition-all",
                period === p.key
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total appels</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {metrics.total}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {metrics.realise} realise{metrics.realise > 1 ? "s" : ""}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">
              Taux completion
            </span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {metrics.completionRate}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {metrics.noShowRate}% no-show
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground">Duree moyenne</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {metrics.avgDuration} min
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Satisfaction</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {metrics.avgSatisfaction > 0 ? `${metrics.avgSatisfaction}/5` : "—"}
          </p>
          {metrics.avgSatisfaction > 0 && (
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {SATISFACTION_CONFIG[Math.round(metrics.avgSatisfaction)]?.emoji}{" "}
              {metrics.totalRatings} avis
            </p>
          )}
        </div>
      </motion.div>

      {/* Distribution row */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* By type */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Par type
          </h3>
          <div className="space-y-2">
            {CALL_TYPES.map((type) => {
              const count = metrics.byType[type.value] ?? 0;
              const pct =
                metrics.total > 0
                  ? Math.round((count / metrics.total) * 100)
                  : 0;
              return (
                <div key={type.value} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16 shrink-0">
                    {type.label}
                  </span>
                  <div className="flex-1 h-5 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/20 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-foreground w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* By day */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" />
            Par jour
          </h3>
          <div className="flex items-end gap-2 h-24">
            {metrics.byDay.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full flex flex-col justify-end"
                  style={{ height: "60px" }}
                >
                  <div
                    className={cn(
                      "w-full rounded-t-md transition-all",
                      count > 0 ? "bg-primary/30" : "bg-muted/30",
                    )}
                    style={{
                      height: `${(count / maxByDay) * 100}%`,
                      minHeight: count > 0 ? "4px" : "0",
                    }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {DAY_LABELS[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Status breakdown */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Realises:{" "}
            {metrics.realise}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> No-show:{" "}
            {metrics.noShow}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-400" /> Annules:{" "}
            {metrics.annule}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" /> Reportes:{" "}
            {metrics.reporte}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
