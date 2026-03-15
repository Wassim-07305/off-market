"use client";

import {
  Trophy,
  Calendar,
  Zap,
  Phone,
  UserPlus,
  Euro,
  Users,
  Swords,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  COMPETITION_STATUS_CONFIG,
  COMPETITION_METRIC_CONFIG,
  type Competition,
  type CompetitionParticipant,
} from "@/types/gamification";
import { formatDate } from "@/lib/utils";

const METRIC_ICONS: Record<string, typeof Zap> = {
  xp: Zap,
  calls: Phone,
  clients: UserPlus,
  revenue: Euro,
};

interface CompetitionCardProps {
  competition: Competition;
  topParticipants?: CompetitionParticipant[];
  onClick?: () => void;
  className?: string;
}

export function CompetitionCard({
  competition,
  topParticipants = [],
  onClick,
  className,
}: CompetitionCardProps) {
  const statusConfig = COMPETITION_STATUS_CONFIG[competition.status];
  const metricConfig = COMPETITION_METRIC_CONFIG[competition.metric];
  const MetricIcon = METRIC_ICONS[competition.metric] ?? Zap;

  // Compute time progress for active competitions
  const now = new Date().getTime();
  const start = new Date(competition.start_date).getTime();
  const end = new Date(competition.end_date).getTime();
  const totalDuration = end - start;
  const elapsed = Math.max(0, now - start);
  const timeProgress =
    competition.status === "active"
      ? Math.min(100, (elapsed / totalDuration) * 100)
      : competition.status === "completed"
        ? 100
        : 0;

  const daysLeft =
    competition.status === "active"
      ? Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
      : null;

  const top3 = topParticipants.slice(0, 3);
  const MEDAL_COLORS = ["text-amber-500", "text-zinc-400", "text-amber-700"];

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:shadow-lg group",
        onClick && "cursor-pointer",
        competition.status === "active" && "border-emerald-500/20",
        className,
      )}
    >
      {/* Status stripe */}
      <div
        className={cn("h-1 w-full", {
          "bg-blue-500": competition.status === "upcoming",
          "bg-emerald-500": competition.status === "active",
          "bg-zinc-300": competition.status === "completed",
        })}
      />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge
                className={cn(
                  statusConfig.bg,
                  statusConfig.color,
                  "text-[10px]",
                )}
              >
                {statusConfig.label}
              </Badge>
              <Badge className="bg-muted text-muted-foreground text-[10px]">
                <MetricIcon className="w-3 h-3 mr-1" />
                {metricConfig.label}
              </Badge>
              <Badge className="bg-muted text-muted-foreground text-[10px]">
                {competition.type === "team_vs_team" ? (
                  <Users className="w-3 h-3 mr-1" />
                ) : (
                  <Swords className="w-3 h-3 mr-1" />
                )}
                {competition.type === "team_vs_team" ? "Equipes" : "Individuel"}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground text-base leading-tight group-hover:text-[#DC2626] transition-colors">
              {competition.title}
            </h3>
            {competition.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {competition.description}
              </p>
            )}
          </div>
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-[#DC2626]" />
          </div>
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {formatDate(competition.start_date)} -{" "}
            {formatDate(competition.end_date)}
          </span>
          {daysLeft !== null && (
            <span className="ml-auto flex items-center gap-1 text-emerald-600 font-medium">
              <Clock className="w-3 h-3" />
              {daysLeft}j restant{daysLeft !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Time progress bar */}
        {competition.status !== "upcoming" && (
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                competition.status === "active"
                  ? "bg-emerald-500"
                  : "bg-zinc-400",
              )}
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        )}

        {/* Prize */}
        {competition.prize_description && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200/50">
            <Trophy className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-medium">
              {competition.prize_description}
            </p>
          </div>
        )}

        {/* Top 3 preview */}
        {top3.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Top 3
            </p>
            <div className="space-y-1">
              {top3.map((p, i) => {
                const displayName = p.team?.name
                  ? `${p.team.avatar_emoji ?? ""} ${p.team.name}`
                  : (p.profile?.full_name ?? "Participant");

                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-muted/50"
                  >
                    <span
                      className={cn(
                        "text-xs font-bold w-5 text-center",
                        MEDAL_COLORS[i],
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="text-xs font-medium text-foreground flex-1 truncate">
                      {displayName}
                    </span>
                    <span className="text-xs font-semibold text-foreground tabular-nums">
                      {Number(p.score).toLocaleString("fr-FR")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Participant count */}
        {(competition.participant_count ?? 0) > 0 && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1 border-t border-border">
            <Users className="w-3.5 h-3.5" />
            {competition.participant_count} participant
            {(competition.participant_count ?? 0) !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
