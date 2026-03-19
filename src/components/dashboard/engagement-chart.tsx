"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEngagementChart } from "@/hooks/use-dashboard-stats";
import { Activity } from "lucide-react";

export function EngagementChart() {
  const { data: chartData, isLoading } = useEngagementChart();

  const hasData = (chartData ?? []).some(
    (d) => d.messages > 0 || d.checkins > 0,
  );

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground">
            Engagement
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cette semaine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-[11px] text-muted-foreground">Messages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-[11px] text-muted-foreground">Check-ins</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="h-40 w-full animate-shimmer rounded-xl" />
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Activity className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune activité cette semaine</p>
            <p className="text-xs mt-1 text-muted-foreground/60">
              L&apos;engagement de tes clients apparaitra ici
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <XAxis
                dataKey="day"
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
                dataKey="messages"
                fill="var(--primary)"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="checkins"
                fill="#22C55E"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
