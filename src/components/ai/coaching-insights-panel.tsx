"use client";

import { useState } from "react";
import {
  useCoachingInsights,
  type InsightItem,
  type RecommendationItem,
} from "@/hooks/use-coaching-insights";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

// ─── Priority config ────────────────────────────────────────

const PRIORITY_STYLES: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: { label: "Haute", color: "text-red-400", bg: "bg-red-500/10" },
  medium: { label: "Moyenne", color: "text-amber-400", bg: "bg-amber-500/10" },
  low: { label: "Basse", color: "text-blue-400", bg: "bg-blue-500/10" },
};

// ─── Component ──────────────────────────────────────────────

interface CoachingInsightsPanelProps {
  clientId?: string;
  className?: string;
}

export function CoachingInsightsPanel({
  clientId,
  className,
}: CoachingInsightsPanelProps) {
  const { insights, meta, isLoading, generateInsights } =
    useCoachingInsights(clientId);
  const [period, setPeriod] = useState<"week" | "month">("month");

  return (
    <div
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Insights coaching IA
              </h3>
              {meta && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {meta.clientCount} client
                  {meta.clientCount > 1 ? "s" : ""} &middot;{" "}
                  {meta.daysBack} jours &middot; Généré le{" "}
                  {new Date(meta.generatedAt).toLocaleDateString("fr-FR")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period toggle */}
            <div className="flex rounded-lg overflow-hidden border border-zinc-700">
              <button
                onClick={() => setPeriod("week")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  period === "week"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                7j
              </button>
              <button
                onClick={() => setPeriod("month")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  period === "month"
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white",
                )}
              >
                30j
              </button>
            </div>

            {/* Generate button */}
            <button
              onClick={() => generateInsights.mutate(period)}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generer les insights
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!insights && !isLoading && (
        <div className="p-8 text-center">
          <Brain className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 mb-1">
            Aucun insight généré pour le moment
          </p>
          <p className="text-xs text-zinc-600">
            Clique sur &quot;Generer les insights&quot; pour lancer l&apos;analyse IA
          </p>
        </div>
      )}

      {isLoading && (
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-400">
            Analyse des donnees en cours...
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            Cela peut prendre quelques secondes
          </p>
        </div>
      )}

      {insights && !isLoading && (
        <div className="divide-y divide-zinc-800">
          {/* Patterns */}
          {insights.patterns.length > 0 && (
            <InsightSection
              title="Patterns detectes"
              icon={<TrendingUp className="w-4 h-4 text-blue-400" />}
              items={insights.patterns}
              accentColor="blue"
            />
          )}

          {/* Strengths */}
          {insights.strengths.length > 0 && (
            <InsightSection
              title="Points forts"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              items={insights.strengths}
              accentColor="emerald"
            />
          )}

          {/* Improvements */}
          {insights.improvements.length > 0 && (
            <InsightSection
              title="Axes d'amelioration"
              icon={<TriangleAlert className="w-4 h-4 text-amber-400" />}
              items={insights.improvements}
              accentColor="amber"
            />
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-semibold text-white">
                  Recommandations
                </h4>
              </div>
              <div className="space-y-2">
                {insights.recommendations.map(
                  (rec: RecommendationItem, i: number) => {
                    const priorityStyle =
                      PRIORITY_STYLES[rec.priority] ?? PRIORITY_STYLES.medium;
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 bg-zinc-800/50 rounded-xl p-3"
                      >
                        <ArrowRight className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium text-white">
                              {rec.title}
                            </span>
                            <span
                              className={cn(
                                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                                priorityStyle.color,
                                priorityStyle.bg,
                              )}
                            >
                              {priorityStyle.label}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Data summary */}
          {meta && (
            <div className="p-4 bg-zinc-950/50">
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                <span>Check-ins : {meta.dataPoints.checkins}</span>
                <span>Journal : {meta.dataPoints.journal}</span>
                <span>XP : {meta.dataPoints.xpTransactions} tx</span>
                <span>Formations : {meta.dataPoints.formations}</span>
                <span>Sessions : {meta.dataPoints.sessions}</span>
                <span>Regularite : {meta.dataPoints.regularity}%</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Insight Section ────────────────────────────────────────

function InsightSection({
  title,
  icon,
  items,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  items: InsightItem[];
  accentColor: "blue" | "emerald" | "amber";
}) {
  const dotColors = {
    blue: "bg-blue-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
  };

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-zinc-800/50 rounded-xl p-3"
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                dotColors[accentColor],
              )}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
