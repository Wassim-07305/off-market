"use client";

import { memo } from "react";
import type { WidgetType } from "@/hooks/use-dashboard-layout";
import { StatsOverviewWidget } from "@/components/dashboard/widgets/stats-overview-widget";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TopStudents } from "@/components/dashboard/top-students";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import { KpiGoalsWidget } from "@/components/dashboard/kpi-goals";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { GamificationWidget } from "@/components/dashboard/widgets/gamification-widget";
import { UpcomingCallsWidget } from "@/components/dashboard/widgets/upcoming-calls-widget";

const WIDGET_MAP: Record<WidgetType, React.ComponentType> = {
  stats_overview: StatsOverviewWidget,
  revenue_chart: RevenueChart,
  engagement_chart: EngagementChart,
  activity_feed: ActivityFeed,
  recent_clients: TopStudents,
  goals_progress: AIInsightsCard,
  pipeline_summary: KpiGoalsWidget,
  upcoming_calls: ConversionFunnel,
  gamification: GamificationWidget,
  ai_insights: UpcomingCallsWidget,
};

function WidgetRendererBase({ type }: { type: WidgetType }) {
  const Component = WIDGET_MAP[type];

  if (!Component) {
    return (
      <div
        className="bg-surface rounded-2xl p-6 flex items-center justify-center"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-sm text-muted-foreground">Widget indisponible</p>
      </div>
    );
  }

  return <Component />;
}

export const WidgetRenderer = memo(WidgetRendererBase);
