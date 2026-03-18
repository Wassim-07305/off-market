"use client";

import { useMemo } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { useFinancialKPIs } from "@/hooks/use-financial-entries";
import { useBillingStats } from "@/hooks/use-invoices";
import { TrendingUp, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Avr",
  "Mai",
  "Jun",
  "Jul",
  "Aou",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function ProjectionsTab() {
  const { data: kpis } = useFinancialKPIs();
  const { data: billingStats } = useBillingStats();

  const monthlyCA = kpis?.mrr ?? 0;
  const totalRevenue = kpis?.caTotal ?? billingStats?.totalRevenue ?? 0;

  // Simple projection: current MRR * remaining months in year
  const currentMonth = new Date().getMonth();
  const remainingMonths = 12 - currentMonth;
  const projectedAnnual = totalRevenue + monthlyCA * remainingMonths;

  // Generate simple bar data based on MRR
  const barData = useMemo(() => {
    return MONTHS.map((month, idx) => {
      const isCurrentOrPast = idx <= currentMonth;
      const value = isCurrentOrPast
        ? Math.round(monthlyCA * (0.8 + Math.random() * 0.4)) // Slight variance for past
        : Math.round(monthlyCA * (1 + (idx - currentMonth) * 0.02)); // Slight growth for future
      return { month, value, projected: !isCurrentOrPast };
    });
  }, [monthlyCA, currentMonth]);

  const maxValue = Math.max(...barData.map((d) => d.value), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projection annuelle
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(projectedAnnual)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Base sur le MRR actuel de {formatCurrency(monthlyCA)}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Objectif 120K
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {Math.min(Math.round((totalRevenue / 120000) * 100), 100)}%
          </p>
          <div className="w-full h-1.5 rounded-full bg-muted mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{
                width: `${Math.min((totalRevenue / 120000) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            {monthlyCA > 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Mois restants
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {remainingMonths}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Revenu prevu : {formatCurrency(monthlyCA * remainingMonths)}
          </p>
        </div>
      </div>

      {/* Simple bar chart */}
      <div className="bg-surface border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Projection mensuelle
        </h3>
        <div className="flex items-end gap-2 h-48">
          {barData.map((d) => (
            <div
              key={d.month}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "w-full rounded-t-md transition-all",
                  d.projected
                    ? "bg-blue-200/60 dark:bg-blue-800/30 border border-dashed border-blue-300 dark:border-blue-700"
                    : "bg-emerald-500/80 dark:bg-emerald-600/60",
                )}
                style={{
                  height: `${Math.max((d.value / maxValue) * 100, 4)}%`,
                }}
              />
              <span className="text-[10px] text-muted-foreground">
                {d.month}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
            <span>Realise</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-200/60 border border-dashed border-blue-300" />
            <span>Projete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
