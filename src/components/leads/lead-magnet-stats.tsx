"use client";

import { useLeadMagnetStats } from "@/hooks/use-lead-magnet";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  TrendingUp,
  Globe,
  Loader2,
  UserCheck,
  UserPlus,
  Handshake,
  AlertCircle,
} from "lucide-react";

const STAGE_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Users }
> = {
  prospect: {
    label: "Prospect",
    color: "text-zinc-500",
    icon: UserPlus,
  },
  qualifie: {
    label: "Qualifie",
    color: "text-blue-500",
    icon: UserCheck,
  },
  proposition: {
    label: "Proposition",
    color: "text-amber-500",
    icon: Target,
  },
  closing: {
    label: "Closing",
    color: "text-red-500",
    icon: Handshake,
  },
  client: {
    label: "Client",
    color: "text-emerald-500",
    icon: Users,
  },
  perdu: {
    label: "Perdu",
    color: "text-zinc-400",
    icon: AlertCircle,
  },
};

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-500"
      : score >= 40
        ? "bg-amber-500"
        : "bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
        {score}
      </span>
    </div>
  );
}

export function LeadMagnetStats() {
  const { data: stats, isLoading, error } = useLeadMagnetStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        Impossible de charger les statistiques
      </div>
    );
  }

  const funnelStages = [
    "prospect",
    "qualifie",
    "proposition",
    "closing",
    "client",
  ];
  const maxFunnel = Math.max(
    ...funnelStages.map((s) => stats.byStage[s] ?? 0),
    1,
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <UserPlus className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Leads ce mois
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.totalThisMonth}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalAllTime} au total
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Score moyen
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.avgScore}
            <span className="text-sm font-normal text-muted-foreground">
              /100
            </span>
          </p>
          <ScoreBar score={stats.avgScore} />
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Taux qualifie
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.totalAllTime > 0
              ? Math.round(
                  (((stats.byStage["qualifie"] ?? 0) +
                    (stats.byStage["proposition"] ?? 0) +
                    (stats.byStage["closing"] ?? 0) +
                    (stats.byStage["client"] ?? 0)) /
                    stats.totalAllTime) *
                    100,
                )
              : 0}
            %
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contacts avances dans le pipeline
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Globe className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">
              Sources
            </span>
          </div>
          <div className="space-y-1">
            {stats.topSources.slice(0, 3).map((s) => (
              <div
                key={s.source}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-foreground capitalize">
                  {s.source.replace("_", " ")}
                </span>
                <span className="text-muted-foreground font-medium">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Entonnoir de conversion
        </h3>
        <div className="space-y-3">
          {funnelStages.map((stage) => {
            const config = STAGE_CONFIG[stage];
            const count = stats.byStage[stage] ?? 0;
            const pct = maxFunnel > 0 ? (count / maxFunnel) * 100 : 0;
            const Icon = config?.icon ?? Users;

            return (
              <div key={stage} className="flex items-center gap-3">
                <div className="w-24 flex items-center gap-1.5">
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5",
                      config?.color ?? "text-muted-foreground",
                    )}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {config?.label ?? stage}
                  </span>
                </div>
                <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-lg transition-all flex items-center justify-end pr-2",
                      stage === "client"
                        ? "bg-emerald-500/20"
                        : stage === "closing"
                          ? "bg-red-500/20"
                          : "bg-zinc-500/10",
                    )}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {count}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Leads */}
      {stats.recentLeads.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Derniers leads captures
          </h3>
          <div className="space-y-2">
            {stats.recentLeads.map((lead) => {
              const stageConfig = STAGE_CONFIG[lead.stage];
              return (
                <div
                  key={lead.id}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600">
                      {lead.full_name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {lead.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        stageConfig
                          ? `${stageConfig.color} bg-muted`
                          : "text-muted-foreground",
                      )}
                    >
                      {stageConfig?.label ?? lead.stage}
                    </span>
                    <div className="w-16">
                      <ScoreBar score={lead.qualification_score} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
