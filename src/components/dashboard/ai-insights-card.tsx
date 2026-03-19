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
  Sparkles,
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

const insightBorderColors: Record<string, string> = {
  student_risk: "border-l-error",
  engagement_drop: "border-l-warning",
  content_suggestion: "border-l-info",
  revenue_insight: "border-l-success",
  weekly_summary: "border-l-primary",
};

const insightIconColors: Record<string, string> = {
  student_risk: "text-error",
  engagement_drop: "text-warning",
  content_suggestion: "text-info",
  revenue_insight: "text-success",
  weekly_summary: "text-primary",
};

export function AIInsightsCard() {
  const supabase = useSupabase();

  interface AiInsight {
    id: string;
    type: string;
    title: string;
    description: string | null;
    is_dismissed: boolean;
    created_at: string;
  }

  const { data: insights } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("ai_insights")
        .select("*")
        .eq("is_dismissed", false)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as AiInsight[];
    },
  });

  const handleDismiss = async (id: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("ai_insights")
      .update({ is_dismissed: true })
      .eq("id", id);
  };

  return (
    <div
      className="bg-surface rounded-xl p-6 relative overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-[13px] font-semibold text-foreground">
            Insights IA
          </h3>
        </div>

        {!insights || insights.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun insight pour le moment
          </p>
        ) : (
          <div className="space-y-2.5">
            {insights.map((insight) => {
              const Icon = insightIcons[insight.type] || Lightbulb;
              const borderColor =
                insightBorderColors[insight.type] || "border-l-primary";
              const iconColor =
                insightIconColors[insight.type] || "text-primary";
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl bg-muted/30 border-l-[3px] group transition-colors duration-200 hover:bg-muted/50",
                    borderColor,
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", iconColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground">
                      {insight.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                      {insight.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-200"
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
    </div>
  );
}
