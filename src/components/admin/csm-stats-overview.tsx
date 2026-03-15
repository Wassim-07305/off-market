"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  UserCheck,
  UserX,
  CalendarCheck,
  Heart,
} from "lucide-react";
import type { CsmOverviewStats } from "@/hooks/use-csm-management";

interface CsmStatsOverviewProps {
  stats: CsmOverviewStats;
  isLoading: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="bg-surface rounded-2xl p-4 border border-border"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
            bgColor,
          )}
        >
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground font-mono tabular-nums">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div
      className="bg-surface rounded-2xl p-4 border border-border animate-pulse"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-muted" />
        <div>
          <div className="h-7 w-12 bg-muted rounded mb-1" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function CsmStatsOverview({ stats, isLoading }: CsmStatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        icon={Users}
        label="Coaches actifs"
        value={stats.totalCoaches}
        color="text-primary"
        bgColor="bg-primary/10"
      />
      <StatCard
        icon={UserCheck}
        label="Clients assignes"
        value={stats.totalAssigned}
        color="text-emerald-600"
        bgColor="bg-emerald-500/10"
      />
      <StatCard
        icon={UserX}
        label="Non assignes"
        value={stats.totalUnassigned}
        color="text-amber-600"
        bgColor="bg-amber-500/10"
      />
      <StatCard
        icon={CalendarCheck}
        label="Sessions cette semaine"
        value={stats.sessionsThisWeek}
        color="text-blue-600"
        bgColor="bg-blue-500/10"
      />
      <StatCard
        icon={Heart}
        label="Satisfaction moyenne"
        value={`${stats.averageSatisfaction}%`}
        color="text-rose-600"
        bgColor="bg-rose-500/10"
      />
    </div>
  );
}
