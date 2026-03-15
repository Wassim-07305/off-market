"use client";

import { memo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Users, DollarSign, GraduationCap, CalendarCheck } from "lucide-react";

function StatsOverviewWidgetBase() {
  const { stats, isLoading } = useDashboardStats();

  const formatRevenue = (amount: number) => {
    if (amount === 0) return "0 EUR";
    return `${amount.toLocaleString("fr-FR")} EUR`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl p-6 animate-shimmer"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="h-4 w-24 bg-muted rounded-lg mb-4" />
            <div className="h-8 w-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
    </div>
  );
}

export const StatsOverviewWidget = memo(StatsOverviewWidgetBase);
