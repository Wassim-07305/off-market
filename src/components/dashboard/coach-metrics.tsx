"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useStudents } from "@/hooks/use-students";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PieChart as PieChartIcon, BarChart3 } from "lucide-react";

const TAG_COLORS: Record<string, string> = {
  at_risk: "#ef4444",
  churned: "#6b7280",
  new: "#3b82f6",
  standard: "#f59e0b",
  vip: "#10b981",
};

const TAG_LABELS: Record<string, string> = {
  at_risk: "A risque",
  churned: "Churned",
  new: "Nouveau",
  standard: "Standard",
  vip: "VIP",
};

export function CoachMetrics() {
  const { students, isLoading: studentsLoading } = useStudents({ limit: 200 });
  const supabase = useSupabase();

  // Engagement trend: activities per day over last 14 days
  const { data: engagementData, isLoading: engagementLoading } = useQuery({
    queryKey: ["coach-engagement-trend"],
    queryFn: async () => {
      const now = new Date();
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(now.getDate() - 13);
      fourteenDaysAgo.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("student_activities")
        .select("created_at")
        .gte("created_at", fourteenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by day
      const days: { date: string; label: string; count: number }[] = [];
      for (let i = 0; i < 14; i++) {
        const d = new Date(fourteenDaysAgo);
        d.setDate(fourteenDaysAgo.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = d.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
        });
        days.push({ date: dateStr, label: dayLabel, count: 0 });
      }

      (data ?? []).forEach((row: any) => {
        const dateStr = row.created_at.split("T")[0];
        const day = days.find((d) => d.date === dateStr);
        if (day) day.count++;
      });

      return days;
    },
  });

  // Health distribution from students data
  const healthDistribution = (() => {
    const counts: Record<string, number> = {
      at_risk: 0,
      churned: 0,
      new: 0,
      standard: 0,
      vip: 0,
    };

    students.forEach((s) => {
      const details = s.student_details as any;
      const tag = (Array.isArray(details) ? details[0]?.tag : details?.tag) ?? "standard";
      if (tag in counts) counts[tag]++;
    });

    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([tag, count]) => ({
        name: TAG_LABELS[tag] ?? tag,
        value: count,
        color: TAG_COLORS[tag] ?? "#6b7280",
      }));
  })();

  const isLoading = studentsLoading || engagementLoading;
  const hasHealthData = healthDistribution.length > 0;
  const hasEngagementData = (engagementData ?? []).some((d) => d.count > 0);

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h3 className="text-[13px] font-semibold text-foreground mb-4">
          Metriques
        </h3>
        <div className="space-y-6">
          <div className="h-48 animate-shimmer rounded-xl" />
          <div className="h-48 animate-shimmer rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground mb-6">
        Metriques
      </h3>

      {/* Health distribution pie chart */}
      <div className="mb-8">
        <p className="text-[12px] text-muted-foreground font-medium mb-3">
          Repartition des eleves
        </p>
        {!hasHealthData ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <PieChartIcon className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune donnee</p>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
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
                    formatter={(value) => [
                      `${Number(value)} eleve${Number(value) !== 1 ? "s" : ""}`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {healthDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement trend bar chart */}
      <div>
        <p className="text-[12px] text-muted-foreground font-medium mb-3">
          Engagement (14 derniers jours)
        </p>
        {!hasEngagementData ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune activité</p>
          </div>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                  }}
                  dy={4}
                  interval={1}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--muted-foreground)",
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                  }}
                  width={28}
                  allowDecimals={false}
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
                    `${Number(value)} activité${Number(value) !== 1 ? "s" : ""}`,
                    "Engagement",
                  ]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
