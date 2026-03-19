"use client";

import { useState } from "react";
import { useRiskAnalysis } from "@/hooks/use-risk-analysis";
import type {
  RiskResult,
  RiskAnalysisResponse,
} from "@/hooks/use-risk-analysis";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import {
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  User,
  Zap,
} from "lucide-react";

const SEVERITY_CONFIG = {
  critical: {
    label: "Critique",
    color: "text-red-600 bg-red-500/10",
    dot: "bg-red-500",
  },
  high: {
    label: "Eleve",
    color: "text-orange-600 bg-orange-500/10",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Moyen",
    color: "text-amber-600 bg-amber-500/10",
    dot: "bg-amber-500",
  },
  low: {
    label: "Faible",
    color: "text-emerald-600 bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
};

export function RiskAnalysisPanel() {
  const analysis = useRiskAnalysis();
  const [data, setData] = useState<RiskAnalysisResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const prefix = useRoutePrefix();

  function handleRun() {
    analysis.mutate(undefined, {
      onSuccess: (result) => setData(result),
    });
  }

  return (
    <div
      className="bg-surface rounded-xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h3 className="text-[13px] font-semibold text-foreground">
            Analyse de risque
          </h3>
        </div>
        <button
          onClick={handleRun}
          disabled={analysis.isPending}
          className="h-8 px-3 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
        >
          {analysis.isPending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Analyser
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        {!data && !analysis.isPending && (
          <div className="text-center py-8">
            <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Lance l&apos;analyse pour evaluer le risque de decrochage de tes
              eleves
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              Basee sur l&apos;activité, les check-ins, le CA et la progression
            </p>
          </div>
        )}

        {analysis.isPending && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Analyse de {data?.summary.total ?? "tous les"} eleves...
            </p>
          </div>
        )}

        {data && !analysis.isPending && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <SummaryCard
                label="Critique"
                count={data.summary.critical}
                color="text-red-600 bg-red-500/10 border-red-500/20"
              />
              <SummaryCard
                label="Eleve"
                count={data.summary.high}
                color="text-orange-600 bg-orange-500/10 border-orange-500/20"
              />
              <SummaryCard
                label="Moyen"
                count={data.summary.medium}
                color="text-amber-600 bg-amber-500/10 border-amber-500/20"
              />
              <SummaryCard
                label="OK"
                count={data.summary.low}
                color="text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
              />
            </div>

            {/* Average score */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>Score sante moyen</span>
              <span className="font-mono font-medium text-foreground">
                {data.summary.avg_score}/100
              </span>
            </div>

            {/* At-risk students list */}
            {data.results.filter((r) => r.severity !== "low").length > 0 ? (
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                  Eleves a surveiller (
                  {data.results.filter((r) => r.severity !== "low").length})
                </p>
                {data.results
                  .filter((r) => r.severity !== "low")
                  .map((result) => (
                    <RiskStudentRow
                      key={result.profile_id}
                      result={result}
                      isExpanded={expandedId === result.profile_id}
                      onToggle={() =>
                        setExpandedId(
                          expandedId === result.profile_id
                            ? null
                            : result.profile_id,
                        )
                      }
                      prefix={prefix}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-emerald-600 font-medium">
                  Tous les eleves sont en bonne sante
                </p>
              </div>
            )}
          </div>
        )}

        {analysis.isError && (
          <div className="text-center py-4">
            <AlertTriangle className="w-6 h-6 text-error mx-auto mb-2" />
            <p className="text-sm text-error">
              {analysis.error?.message ?? "Erreur lors de l'analyse"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className={cn("rounded-xl border p-3 text-center", color)}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-[10px]">{label}</p>
    </div>
  );
}

function RiskStudentRow({
  result,
  isExpanded,
  onToggle,
  prefix,
}: {
  result: RiskResult;
  isExpanded: boolean;
  onToggle: () => void;
  prefix: string;
}) {
  const config = SEVERITY_CONFIG[result.severity];
  const delta = result.new_score - result.previous_score;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left"
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}

        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {result.full_name}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {delta !== 0 && (
            <span
              className={cn(
                "text-[11px] font-mono flex items-center gap-0.5",
                delta < 0 ? "text-red-500" : "text-emerald-500",
              )}
            >
              {delta < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <TrendingUp className="w-3 h-3" />
              )}
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
          <span className="text-sm font-mono font-medium text-foreground w-8 text-right">
            {result.new_score}
          </span>
          <span className={cn("w-2 h-2 rounded-full shrink-0", config.dot)} />
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0 space-y-2 border-t border-border">
          {/* Risk factors */}
          {result.risk_factors.length > 0 && (
            <div className="space-y-1 mt-2">
              {result.risk_factors.map((factor, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-[12px] text-muted-foreground"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                  {factor}
                </div>
              ))}
            </div>
          )}

          {/* Recommendation */}
          <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-[12px] text-foreground">
              <span className="font-medium">Recommandation : </span>
              {result.recommendation}
            </p>
          </div>

          {/* Link to profile */}
          <Link
            href={`${prefix}/students/${result.profile_id}`}
            className="text-[11px] text-primary hover:underline"
          >
            Voir le profil élève →
          </Link>
        </div>
      )}
    </div>
  );
}
