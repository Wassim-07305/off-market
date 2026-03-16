"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Eye,
  MousePointerClick,
  Clock,
  Loader2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  useNotificationAnalytics,
  useNotificationsByType,
  useNotificationTrends,
} from "@/hooks/use-notification-analytics";
import { PeriodSelector } from "@/components/analytics/period-selector";
import { periodToDateRange } from "@/hooks/use-reports";
import { cn } from "@/lib/utils";
import type { PeriodPreset } from "@/types/analytics";
import { staggerContainer, staggerItem } from "@/lib/animations";

const PIE_COLORS = [
  "#DC2626", // red (primary CTA)
  "#2563EB", // blue
  "#16A34A", // green
  "#F59E0B", // amber
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
];

export function NotificationAnalytics() {
  const [period, setPeriod] = useState<PeriodPreset>("30d");
  const range = periodToDateRange(period);

  const { data: analytics, isLoading: analyticsLoading } =
    useNotificationAnalytics(range);
  const { data: byType, isLoading: typeLoading } =
    useNotificationsByType(range);
  const { data: trends, isLoading: trendsLoading } =
    useNotificationTrends(range);

  const isLoading = analyticsLoading || typeLoading || trendsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Analytics Notifications
          </h2>
          <p className="text-sm text-muted-foreground">
            Performance et engagement des notifications
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Total envoyees"
          value={analytics?.totalSent.toLocaleString("fr-FR") ?? "0"}
          icon={Send}
        />
        <StatCard
          title="Taux d'ouverture"
          value={`${analytics?.openRate ?? 0}%`}
          icon={Eye}
        />
        <StatCard
          title="Taux de clic"
          value={`${analytics?.clickRate ?? 0}%`}
          icon={MousePointerClick}
        />
        <StatCard
          title="Temps moyen ouverture"
          value={
            analytics?.avgOpenTimeMinutes
              ? `${analytics.avgOpenTimeMinutes} min`
              : "—"
          }
          icon={Clock}
        />
      </motion.div>

      {/* Charts row */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Pie chart — by type */}
        <div className="bg-white border border-zinc-200 rounded-[14px] p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Repartition par type
          </h3>
          {byType && byType.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byType}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {byType.map((_, i) => (
                    <Cell
                      key={i}
                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} notifications`,
                    name,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e4e4e7",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              Aucune donnee pour cette periode
            </div>
          )}
        </div>

        {/* Line chart — trends */}
        <div className="bg-white border border-zinc-200 rounded-[14px] p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Tendances quotidiennes
          </h3>
          {trends && trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trends}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e4e4e7",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  name="Envoyees"
                  stroke="#DC2626"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="opened"
                  name="Ouvertes"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="clicked"
                  name="Cliquees"
                  stroke="#16A34A"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
              Aucune donnee pour cette periode
            </div>
          )}
        </div>
      </motion.div>

      {/* Table — top notification types */}
      <motion.div variants={staggerItem}>
        <div className="bg-white border border-zinc-200 rounded-[14px] p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Performance par type
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-medium text-muted-foreground py-2.5 pr-4">
                    Type
                  </th>
                  <th className="text-right font-medium text-muted-foreground py-2.5 px-4">
                    Envoyees
                  </th>
                  <th className="text-right font-medium text-muted-foreground py-2.5 px-4">
                    Taux d'ouverture
                  </th>
                  <th className="text-right font-medium text-muted-foreground py-2.5 pl-4">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {(byType ?? []).map((item, idx) => (
                  <tr
                    key={item.type}
                    className={cn(
                      "border-b border-border/30 last:border-0",
                      "hover:bg-muted/30 transition-colors",
                    )}
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              PIE_COLORS[idx % PIE_COLORS.length],
                          }}
                        />
                        <span className="font-medium text-foreground">
                          {item.label}
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums text-foreground">
                      {item.count.toLocaleString("fr-FR")}
                    </td>
                    <td className="text-right py-3 px-4 tabular-nums text-foreground">
                      {item.openRate}%
                    </td>
                    <td className="text-right py-3 pl-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${item.openRate}%`,
                              backgroundColor:
                                item.openRate >= 50
                                  ? "#16A34A"
                                  : item.openRate >= 25
                                    ? "#F59E0B"
                                    : "#DC2626",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

                {(!byType || byType.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucune donnee pour cette periode
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
