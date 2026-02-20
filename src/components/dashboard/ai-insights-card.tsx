"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import {
  AlertTriangle,
  TrendingDown,
  Lightbulb,
  DollarSign,
  BarChart,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const insightIcons: Record<string, LucideIcon> = {
  student_risk: AlertTriangle,
  engagement_drop: TrendingDown,
  content_suggestion: Lightbulb,
  revenue_insight: DollarSign,
  weekly_summary: BarChart,
};

const insightColors: Record<string, string> = {
  student_risk: "text-error bg-error/10",
  engagement_drop: "text-warning bg-warning/10",
  content_suggestion: "text-info bg-info/10",
  revenue_insight: "text-success bg-success/10",
  weekly_summary: "text-primary bg-primary/10",
};

export function AIInsightsCard() {
  const supabase = useSupabase();

  const { data: insights } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const handleDismiss = async (id: string) => {
    await supabase
      .from("ai_insights")
      .update({ is_dismissed: true })
      .eq("id", id);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
          <Lightbulb className="w-3 h-3 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Insights IA
        </h3>
      </div>

      {!insights || insights.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Aucun insight pour le moment
        </p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight) => {
            const Icon = insightIcons[insight.type] || Lightbulb;
            const colorClasses =
              insightColors[insight.type] || "text-primary bg-primary/10";
            return (
              <div
                key={insight.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                    colorClasses
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {insight.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {insight.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDismiss(insight.id)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
