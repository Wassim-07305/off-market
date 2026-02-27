"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useAnalytics } from "@/hooks/use-analytics";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance et metriques detaillees</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-5 animate-shimmer" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="h-3 w-20 bg-muted rounded-lg mb-2" />
              <div className="h-7 w-16 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Revenus total", value: analytics ? `${analytics.totalRevenue.toLocaleString("fr-FR")} EUR` : "0 EUR" },
    { label: "Clients total", value: String(analytics?.totalClients ?? 0) },
    { label: "Taux completion", value: `${analytics?.completionRate ?? 0}%` },
    { label: "Humeur moyenne", value: String(analytics?.avgMood ?? "\u2014") },
  ];

  const hasRevenueData = (analytics?.revenueByMonth ?? []).some((d) => d.value > 0);
  const hasCompletionData = (analytics?.completionByCourse ?? []).length > 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance et metriques detaillees
        </p>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 sm:grid-cols-4 gap-5"
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-2xl p-5 text-center transition-all duration-300 hover:translate-y-[-1px]"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-2xl font-display font-bold text-foreground tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <div className="bg-surface rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Evolution des revenus
          </h3>
          <div className="h-64">
            {!hasRevenueData ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucune donnee de revenus</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.revenueByMonth}>
                  <defs>
                    <linearGradient id="analyticsRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "none", borderRadius: "12px", fontSize: "13px", boxShadow: "var(--shadow-elevated)", padding: "8px 12px" }} formatter={(v) => [`${Number(v).toLocaleString("fr-FR")} EUR`, "Revenus"]} />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2.5} fill="url(#analyticsRevenueGradient)" dot={false} activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Completion par formation
          </h3>
          <div className="h-64">
            {!hasCompletionData ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucune formation publiee</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.completionByCourse} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "none", borderRadius: "12px", fontSize: "13px", boxShadow: "var(--shadow-elevated)", padding: "8px 12px" }} formatter={(v) => [`${v}%`, "Completion"]} />
                  <Bar dataKey="completion" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
