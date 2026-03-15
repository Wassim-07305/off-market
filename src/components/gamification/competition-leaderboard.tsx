"use client";

import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useCompetitionLeaderboard } from "@/hooks/use-competitions";
import {
  Crown,
  Medal,
  Award,
  ArrowUp,
  ArrowDown,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import type { CompetitionParticipant } from "@/types/gamification";

const PODIUM_CONFIG = [
  { position: 1, icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", ring: "ring-amber-500/30" },
  { position: 2, icon: Medal, color: "text-zinc-400", bg: "bg-zinc-400/10", ring: "ring-zinc-400/30" },
  { position: 3, icon: Award, color: "text-amber-700", bg: "bg-amber-700/10", ring: "ring-amber-700/30" },
];

interface CompetitionLeaderboardProps {
  competitionId: string;
  isTeamCompetition?: boolean;
}

function AnimatedScore({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="font-semibold text-foreground font-serif tabular-nums"
    >
      {value.toLocaleString("fr-FR")}
    </motion.span>
  );
}

function ParticipantDisplay({
  participant,
  isTeam,
}: {
  participant: CompetitionParticipant;
  isTeam: boolean;
}) {
  if (isTeam && participant.team) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg shrink-0">
          {participant.team.avatar_emoji ?? "🔥"}
        </span>
        <span className="text-sm font-medium text-foreground truncate">
          {participant.team.name}
        </span>
      </div>
    );
  }

  const profile = participant.profile;
  return (
    <div className="flex items-center gap-2 min-w-0">
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-[#DC2626]/10 flex items-center justify-center text-[10px] font-semibold text-[#DC2626] shrink-0">
          {profile?.full_name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      )}
      <span className="text-sm font-medium text-foreground truncate">
        {profile?.full_name ?? "Participant"}
      </span>
    </div>
  );
}

export function CompetitionLeaderboard({
  competitionId,
  isTeamCompetition = false,
}: CompetitionLeaderboardProps) {
  const { data: participants = [], isLoading } =
    useCompetitionLeaderboard(competitionId);
  const { user } = useAuth();

  const top3 = participants.slice(0, 3);
  const rest = participants.slice(3);

  const isMe = (p: CompetitionParticipant) => p.user_id === user?.id;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Aucun participant pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[top3[1], top3[0], top3[2]].map((entry, visualIndex) => {
            if (!entry) return <div key={visualIndex} />;
            const podium = PODIUM_CONFIG.find((p) => p.position === entry.rank);
            const Icon = podium?.icon ?? Medal;
            const mine = isMe(entry);

            return (
              <motion.div
                key={entry.id}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ ...defaultTransition, delay: visualIndex * 0.1 }}
                className={cn(
                  "bg-surface border border-border rounded-xl p-4 text-center",
                  entry.rank === 1 && `ring-2 ${podium?.ring ?? ""}`,
                  mine && "border-[#DC2626]/30 bg-[#DC2626]/5",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    podium?.color ?? "text-muted-foreground",
                  )}
                />

                {isTeamCompetition && entry.team ? (
                  <div className="mb-1">
                    <span className="text-2xl block">
                      {entry.team.avatar_emoji ?? "🔥"}
                    </span>
                    <p className="text-xs font-medium text-foreground truncate mt-1">
                      {entry.team.name}
                    </p>
                  </div>
                ) : (
                  <div className="mb-1">
                    <div className="w-10 h-10 rounded-full bg-muted mx-auto flex items-center justify-center text-sm font-medium text-foreground">
                      {entry.profile?.avatar_url ? (
                        <img
                          src={entry.profile.avatar_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        entry.profile?.full_name?.charAt(0)?.toUpperCase() ??
                        "?"
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs font-medium truncate mt-1",
                        mine ? "text-[#DC2626]" : "text-foreground",
                      )}
                    >
                      {mine ? "Toi" : (entry.profile?.full_name ?? "Participant")}
                    </p>
                  </div>
                )}

                <p className="text-lg font-semibold text-foreground font-serif mt-1">
                  <AnimatedScore value={entry.score} />
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Remaining participants */}
      {rest.length > 0 && (
        <div className="bg-surface border border-border rounded-xl divide-y divide-border">
          {rest.map((entry: CompetitionParticipant) => {
            const mine = isMe(entry);

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  mine && "bg-[#DC2626]/5",
                )}
              >
                <span className="text-sm font-bold text-muted-foreground w-8 text-center tabular-nums">
                  #{entry.rank}
                </span>

                <div className="flex-1 min-w-0">
                  <ParticipantDisplay
                    participant={entry}
                    isTeam={isTeamCompetition}
                  />
                </div>

                {/* Rank change */}
                {entry.rank !== null && (
                  <div className="shrink-0">
                    {/* Placeholder for future rank change tracking */}
                  </div>
                )}

                <span className="text-sm shrink-0">
                  <AnimatedScore value={entry.score} />
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
