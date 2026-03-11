"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RetentionChartProps {
  clients: Array<{
    created_at: string;
    last_seen_at: string | null;
  }>;
}

export function RetentionChart({ clients }: RetentionChartProps) {
  const data = useMemo(() => {
    if (!clients || clients.length === 0) return [];

    const now = new Date();
    // Group clients by cohort month (creation month)
    // Then compute how many are still active at each month offset
    const cohorts = new Map<
      string,
      { total: number; activeByMonth: Map<number, number> }
    >();

    for (const c of clients) {
      const created = new Date(c.created_at);
      const cohortKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;

      if (!cohorts.has(cohortKey)) {
        cohorts.set(cohortKey, { total: 0, activeByMonth: new Map() });
      }

      const cohort = cohorts.get(cohortKey)!;
      cohort.total++;

      // Calculate months active
      const lastSeen = c.last_seen_at ? new Date(c.last_seen_at) : now;
      const monthsActive = Math.max(
        0,
        (lastSeen.getFullYear() - created.getFullYear()) * 12 +
          (lastSeen.getMonth() - created.getMonth()),
      );

      // Mark active for each month up to monthsActive
      for (let m = 0; m <= Math.min(monthsActive, 11); m++) {
        cohort.activeByMonth.set(m, (cohort.activeByMonth.get(m) ?? 0) + 1);
      }
    }

    // Average retention rate per month offset
    const months = Array.from({ length: 12 }, (_, i) => i);
    return months.map((m) => {
      let totalCohorts = 0;
      let sumRate = 0;

      for (const [, cohort] of cohorts) {
        const active = cohort.activeByMonth.get(m);
        if (active !== undefined) {
          sumRate += (active / cohort.total) * 100;
          totalCohorts++;
        }
      }

      return {
        month: m === 0 ? "M0" : `M+${m}`,
        retention: totalCohorts > 0 ? Math.round(sumRate / totalCohorts) : 0,
      };
    });
  }, [clients]);

  if (data.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Courbe de retention
          </h4>
          <p className="text-xs text-muted-foreground">
            Retention moyenne par cohorte mensuelle
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="retentionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v: number) => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              boxShadow: "var(--shadow-elevated)",
            }}
            formatter={(value: number | undefined) => [
              `${value ?? 0}%`,
              "Retention",
            ]}
          />
          <Area
            type="monotone"
            dataKey="retention"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#retentionGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
