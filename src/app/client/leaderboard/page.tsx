"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import {
  useLeaderboard,
  type LeaderboardPeriod,
} from "@/hooks/use-leaderboard";
import { useXp } from "@/hooks/use-xp";
import { useAuth } from "@/hooks/use-auth";
import { Crown, Medal, Award, TrendingUp, UserX } from "lucide-react";
import { cn } from "@/lib/utils";

const PODIUM_CONFIG = [
  {
    position: 1,
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/30",
  },
  {
    position: 2,
    icon: Medal,
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    ring: "ring-zinc-400/30",
  },
  {
    position: 3,
    icon: Award,
    color: "text-amber-700",
    bg: "bg-amber-700/10",
    ring: "ring-amber-700/30",
  },
];

const PERIOD_TABS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "7d", label: "Cette semaine" },
  { value: "30d", label: "Ce mois" },
  { value: "all", label: "Tout" },
];

export default function ClientLeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const { entries, isLoading } = useLeaderboard(period);
  const { summary } = useXp();
  const { user } = useAuth();

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const isAnonymousEntry = (name: string) => name === "Utilisateur anonyme";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Classement</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ton rang parmi les autres freelances
        </p>
      </motion.div>

      {/* Period filter tabs */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit"
      >
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={cn(
              "h-9 px-4 rounded-lg text-sm font-medium transition-all",
              period === tab.value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* My position card */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-primary/20 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Ta position</p>
              <p className="text-xs text-muted-foreground">
                {summary.totalXp} XP • Niveau {summary.level.level}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-foreground font-serif">
              #{summary.rank || "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              sur {entries.length} freelances
            </p>
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <Crown className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Le classement est vide pour le moment
          </p>
        </motion.div>
      ) : (
        <>
          {/* Podium (top 3) */}
          {top3.length > 0 && (
            <motion.div
              variants={fadeInUp}
              transition={defaultTransition}
              className="grid grid-cols-3 gap-3"
            >
              {/* Reorder: 2nd, 1st, 3rd for visual podium */}
              {[top3[1], top3[0], top3[2]].map((entry, visualIndex) => {
                if (!entry) return <div key={visualIndex} />;
                const podium = PODIUM_CONFIG.find(
                  (p) => p.position === entry.rank,
                );
                const Icon = podium?.icon ?? Medal;
                const isMe = entry.profile_id === user?.id;
                const isAnonymous = isAnonymousEntry(entry.full_name);

                return (
                  <div
                    key={entry.profile_id}
                    className={`bg-surface border border-border rounded-xl p-4 text-center ${
                      entry.rank === 1 ? "ring-2 " + (podium?.ring ?? "") : ""
                    } ${isMe ? "border-primary/30" : ""}`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${podium?.color ?? "text-muted-foreground"}`}
                    />
                    <div className="w-10 h-10 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center text-sm font-medium text-foreground">
                      {isAnonymous ? (
                        <UserX className="w-4 h-4 text-muted-foreground" />
                      ) : entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        (entry.full_name?.charAt(0)?.toUpperCase() ?? "?")
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-xs font-medium truncate",
                        isMe
                          ? "text-primary"
                          : isAnonymous
                            ? "text-muted-foreground italic"
                            : "text-foreground",
                      )}
                    >
                      {isMe ? "Toi" : entry.full_name}
                    </p>
                    <p className="text-lg font-semibold text-foreground font-serif mt-1">
                      {entry.total_xp}
                    </p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                    {entry.badge_count > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {entry.badge_count} badges
                      </p>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <motion.div
              variants={fadeInUp}
              transition={defaultTransition}
              className="bg-surface border border-border rounded-xl divide-y divide-border"
            >
              {rest.map((entry) => {
                const isMe = entry.profile_id === user?.id;
                const isAnonymous = isAnonymousEntry(entry.full_name);

                return (
                  <div
                    key={entry.profile_id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      isMe ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-muted-foreground w-8 text-center">
                      #{entry.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground shrink-0">
                      {isAnonymous ? (
                        <UserX className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : entry.avatar_url ? (
                        <img
                          src={entry.avatar_url}
                          alt={entry.full_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        (entry.full_name?.charAt(0)?.toUpperCase() ?? "?")
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isMe
                            ? "text-primary"
                            : isAnonymous
                              ? "text-muted-foreground italic"
                              : "text-foreground",
                        )}
                      >
                        {isMe ? "Toi" : entry.full_name}
                      </p>
                      {entry.badge_count > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {entry.badge_count} badges
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-foreground font-serif">
                      {entry.total_xp} XP
                    </span>
                  </div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
