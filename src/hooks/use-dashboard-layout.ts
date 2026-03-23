"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export type WidgetType =
  | "stats_overview"
  | "revenue_chart"
  | "engagement_chart"
  | "recent_clients"
  | "upcoming_calls"
  | "pipeline_summary"
  | "activity_feed"
  | "goals_progress"
  | "gamification"
  | "ai_insights";

export type WidgetSize = "1x1" | "2x1" | "2x2" | "full";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: number;
  size: WidgetSize;
  visible: boolean;
}

// ─── Widget metadata ────────────────────────────────────────

export const WIDGET_META: Record<
  WidgetType,
  { label: string; defaultSize: WidgetSize }
> = {
  stats_overview: { label: "Statistiques", defaultSize: "full" },
  revenue_chart: { label: "Revenus", defaultSize: "2x1" },
  engagement_chart: { label: "Engagement", defaultSize: "2x1" },
  recent_clients: { label: "Top eleves", defaultSize: "1x1" },
  upcoming_calls: { label: "Funnel de conversion", defaultSize: "1x1" },
  pipeline_summary: { label: "Objectifs KPI", defaultSize: "1x1" },
  activity_feed: { label: "Activité récente", defaultSize: "1x1" },
  goals_progress: { label: "Insights IA", defaultSize: "1x1" },
  gamification: { label: "Gamification", defaultSize: "1x1" },
  ai_insights: { label: "AlexIA", defaultSize: "1x1" },
};

// ─── Default layout ─────────────────────────────────────────

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "w-stats",
    type: "stats_overview",
    position: 0,
    size: "full",
    visible: true,
  },
  {
    id: "w-revenue",
    type: "revenue_chart",
    position: 1,
    size: "2x1",
    visible: true,
  },
  {
    id: "w-engagement",
    type: "engagement_chart",
    position: 2,
    size: "2x1",
    visible: true,
  },
  {
    id: "w-kpi",
    type: "pipeline_summary",
    position: 3,
    size: "2x1",
    visible: true,
  },
  {
    id: "w-funnel",
    type: "upcoming_calls",
    position: 4,
    size: "2x1",
    visible: true,
  },
  {
    id: "w-activity",
    type: "activity_feed",
    position: 5,
    size: "1x1",
    visible: true,
  },
  {
    id: "w-students",
    type: "recent_clients",
    position: 6,
    size: "1x1",
    visible: true,
  },
  {
    id: "w-insights",
    type: "goals_progress",
    position: 7,
    size: "1x1",
    visible: true,
  },
];

// ─── Hooks ──────────────────────────────────────────────────

const QUERY_KEY = "dashboard-layout";

export function useDashboardLayout() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: [QUERY_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("dashboard_layouts")
        .select("widgets")
        .eq("user_id", user!.id)
        .maybeSingle() as { data: { widgets: unknown } | null; error: any };

      if (error) throw error;

      if (!data || !data.widgets) {
        return DEFAULT_WIDGETS;
      }

      // Merge saved widgets with defaults to handle newly added widget types
      const saved = data.widgets as WidgetConfig[];
      const savedTypes = new Set(saved.map((w) => w.type));
      const missing = DEFAULT_WIDGETS.filter(
        (w) => !savedTypes.has(w.type),
      ).map((w, i) => ({ ...w, position: saved.length + i, visible: false }));

      return [...saved, ...missing];
    },
    staleTime: 60_000,
  });
}

export function useSaveDashboardLayout() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgets: WidgetConfig[]) => {
      if (!user) throw new Error("Non authentifie");

      const { error } = await supabase.from("dashboard_layouts").upsert(
        {
          user_id: user.id,
          widgets: widgets as unknown as Record<string, unknown>[],
        } as never,
        { onConflict: "user_id" },
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Disposition sauvegardee");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde");
    },
  });
}

export function useResetDashboardLayout() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non authentifie");

      const { error } = await (supabase as any)
        .from("dashboard_layouts")
        .delete()
        .eq("user_id", user.id) as { error: any };

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Disposition reintialisee");
    },
    onError: () => {
      toast.error("Erreur lors de la reinitialisation");
    },
  });
}
