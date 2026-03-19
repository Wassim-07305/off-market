"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRevenueChart } from "@/hooks/use-dashboard-stats";
import { TrendingUp } from "lucide-react";

export function RevenueChart() {
  const { data: chartData, isLoading } = useRevenueChart();

  const totalRevenue = (chartData ?? []).reduce((sum, d) => sum + d.revenue, 0);
  const hasData = (chartData ?? []).some((d) => d.revenue > 0);

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">Revenus</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            6 derniers mois
          </p>
        </div>
        <span className="text-2xl font-display font-bold text-foreground tracking-tight">
          {totalRevenue.toLocaleString("fr-FR")}{" "}
          <span className="text-sm font-mono text-muted-foreground font-normal">
            EUR
          </span>
        </span>
      </div>
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="h-40 w-full animate-shimmer rounded-xl" />
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune donnee de revenus</p>
            <p className="text-xs mt-1 text-muted-foreground/60">
              Les revenus apparaitront ici quand des factures seront payees
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
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
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={40}
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
                formatter={(value) => [
                  `${Number(value).toLocaleString("fr-FR")} EUR`,
                  "Revenus",
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--primary)",
                  stroke: "var(--surface)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
