"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TopStudents } from "@/components/dashboard/top-students";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import {
  Users,
  DollarSign,
  GraduationCap,
  CalendarCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, defaultTransition } from "@/lib/animations";

export default function DashboardPage() {
  const { stats, isLoading } = useDashboardStats();

  const formatRevenue = (amount: number) => {
    if (amount === 0) return "0 EUR";
    return `${amount.toLocaleString("fr-FR")} EUR`;
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d&apos;ensemble de ton activite
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-6 animate-shimmer" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="h-4 w-24 bg-muted rounded-lg mb-4" />
              <div className="h-8 w-16 bg-muted rounded-lg" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Clients actifs"
              value={stats.totalClients}
              change={stats.clientChange}
              changeLabel="vs mois dernier"
              icon={Users}
            />
            <StatCard
              title="Revenus du mois"
              value={formatRevenue(stats.revenueThisMonth)}
              change={stats.revenueChange}
              changeLabel="vs mois dernier"
              icon={DollarSign}
            />
            <StatCard
              title="Formations actives"
              value={stats.activeCourses}
              icon={GraduationCap}
            />
            <StatCard
              title="Check-ins semaine"
              value={stats.weeklyCheckins}
              icon={CalendarCheck}
            />
          </>
        )}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <RevenueChart />
        <EngagementChart />
      </motion.div>

      {/* Bottom section */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <ActivityFeed />
        <TopStudents />
        <AIInsightsCard />
      </motion.div>
    </motion.div>
  );
}
