"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerItem } from "@/lib/animations";
import { useXp } from "@/hooks/use-xp";
import { useStreak } from "@/hooks/use-streaks";
import { useBadges } from "@/hooks/use-badges";
import { useRewards, useRedeemReward, useMyRedemptions, useXpBalance } from "@/hooks/use-rewards";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useQuery } from "@tanstack/react-query";
import { cn, formatDate } from "@/lib/utils";
import {
  Trophy,
  Flame,
  Star,
  Zap,
  Gift,
  Lock,
  CheckCircle,
  TrendingUp,
  Clock,
  Crown,
} from "lucide-react";

export default function GamificationPage() {
  const { profile } = useAuth();
  const { summary: xpSummary, isLoading: xpLoading, error: xpError } = useXp();
  const totalXp = xpSummary.totalXp;
  const currentLevel = xpSummary.level;
  const nextLevel = xpSummary.nextLevel;
  const progressPercent = xpSummary.progressToNext;
  const { streak, isLoading: streakLoading, error: streakError } = useStreak();
  const { allBadges, earnedBadges, earnedBadgeIds, isLoading: badgesLoading, error: badgesError } = useBadges();
  const { rewards, isLoading: rewardsLoading } = useRewards();
  const redeemReward = useRedeemReward();
  const { redemptions, isLoading: redemptionsLoading } = useMyRedemptions();
  const { balance: xpBalance } = useXpBalance();

  const supabase = useSupabase();
  const [activeTab, setActiveTab] = useState<"badges" | "rewards" | "history" | "leaderboard">("badges");

  // Leaderboard top 10 — fetch leaderboard + profiles separately (VIEW has no FK)
  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard-top"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { data: rows, error } = await sb
        .from("leaderboard")
        .select("*")
        .order("rank", { ascending: true })
        .limit(10);
      if (error || !rows?.length) return [];

      // Enrich with profile data
      const ids = rows.map((r: { profile_id: string }) => r.profile_id);
      const { data: profiles } = await sb
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", ids);

      const profileMap = new Map((profiles ?? []).map((p: { id: string }) => [p.id, p]));

      return rows.map((r: { profile_id: string; total_xp: number; rank: number }) => ({
        ...r,
        profile: profileMap.get(r.profile_id) ?? { full_name: "?", avatar_url: null },
      }));
    },
  });

  const isLoading = xpLoading || streakLoading || badgesLoading;
  const hasError = xpError || streakError || badgesError;

  if (hasError) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Impossible de charger les donnees de gamification. Veuillez reessayer.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div variants={staggerItem} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Ma progression
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ton niveau, tes badges et tes recompenses
        </p>
      </motion.div>

      {/* XP + Level + Streak Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {/* Level & XP */}
        <div className="bg-surface border border-border rounded-xl p-5 col-span-1 sm:col-span-2">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-foreground">
                  Niveau {currentLevel?.level ?? 1}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {currentLevel?.name ?? "Debutant"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {totalXp} XP au total
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{currentLevel?.min_xp ?? 0} XP</span>
              <span>{nextLevel?.min_xp ?? "Max"} XP</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-red-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {nextLevel && (
              <p className="text-[11px] text-muted-foreground text-center">
                Encore {(nextLevel.min_xp - totalXp)} XP pour le niveau suivant
              </p>
            )}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-surface border border-border rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 flex items-center justify-center mb-2">
            <Flame className={cn("w-6 h-6", (streak?.current_streak ?? 0) > 0 ? "text-orange-500" : "text-muted-foreground")} />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {streak?.current_streak ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">jours de suite</p>
          {(streak?.longest_streak ?? 0) > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5" />
              Record : {streak?.longest_streak} jours
            </p>
          )}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{totalXp}</p>
          <p className="text-[10px] text-muted-foreground">XP Total</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Zap className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{xpBalance}</p>
          <p className="text-[10px] text-muted-foreground">XP Disponible</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{earnedBadges.length}</p>
          <p className="text-[10px] text-muted-foreground">Badges gagnes</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Gift className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{redemptions?.length ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">Recompenses</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 w-fit mb-4">
          {([
            { key: "badges" as const, label: "Badges", icon: Trophy },
            { key: "rewards" as const, label: "Recompenses", icon: Gift },
            { key: "leaderboard" as const, label: "Classement", icon: Crown },
            { key: "history" as const, label: "Historique", icon: Clock },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                activeTab === tab.key
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Tab */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allBadges.map((badge) => {
              const earned = earnedBadgeIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "bg-surface border rounded-xl p-4 text-center transition-all",
                    earned
                      ? "border-primary/30 bg-primary/[0.02]"
                      : "border-border opacity-50 grayscale",
                  )}
                >
                  <div className="text-3xl mb-2">{badge.icon ?? "🏆"}</div>
                  <p className="text-sm font-medium text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {badge.description}
                  </p>
                  {earned ? (
                    <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-[10px] font-medium">Debloque</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px]">Verrouille</span>
                    </div>
                  )}
                </div>
              );
            })}
            {allBadges.length === 0 && (
              <div className="col-span-full py-8 text-center">
                <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun badge disponible</p>
              </div>
            )}
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rewardsLoading ? (
              <div className="col-span-full py-8 text-center">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : rewards.length === 0 ? (
              <div className="col-span-full py-8 text-center">
                <Gift className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune recompense disponible</p>
              </div>
            ) : (
              rewards.map((reward) => {
                const canAfford = xpBalance >= reward.cost_xp;
                const outOfStock = (reward.stock ?? Infinity) <= 0;
                return (
                  <div
                    key={reward.id}
                    className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center shrink-0">
                      <Gift className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{reward.title}</p>
                      {reward.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {reward.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-0.5">
                          <Zap className="w-3 h-3" />
                          {reward.cost_xp} XP
                        </span>
                        {reward.stock != null && (
                          <span className="text-[10px] text-muted-foreground">
                            Stock: {reward.stock}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => redeemReward.mutate(reward.id)}
                      disabled={!canAfford || outOfStock || redeemReward.isPending}
                      className={cn(
                        "h-8 px-3 rounded-lg text-xs font-medium transition-colors shrink-0",
                        canAfford && !outOfStock
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed",
                      )}
                    >
                      {outOfStock ? "Epuise" : !canAfford ? "XP insuffisant" : "Echanger"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === "leaderboard" && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            {!leaderboard?.length ? (
              <div className="py-8 text-center">
                <Crown className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Classement indisponible</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {leaderboard.map((entry: { profile_id: string; total_xp: number; rank: number; profile?: { full_name?: string; avatar_url?: string | null } }, idx: number) => {
                  const isMe = entry.profile_id === profile?.id;
                  const medalColors = ["text-amber-500", "text-gray-400", "text-amber-700"];
                  return (
                    <div
                      key={entry.profile_id}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 transition-colors",
                        isMe && "bg-primary/5",
                      )}
                    >
                      <span className={cn(
                        "w-6 text-center text-sm font-bold",
                        idx < 3 ? medalColors[idx] : "text-muted-foreground",
                      )}>
                        {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : entry.rank}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground shrink-0 overflow-hidden">
                        {entry.profile?.avatar_url ? (
                          <img src={entry.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          entry.profile?.full_name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", isMe ? "text-primary" : "text-foreground")}>
                          {entry.profile?.full_name ?? "?"}
                          {isMe && <span className="text-xs text-primary ml-1">(toi)</span>}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-foreground flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {entry.total_xp}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-2">
            {redemptionsLoading ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : !redemptions?.length ? (
              <div className="py-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun echange pour le moment</p>
              </div>
            ) : (
              redemptions.map((r) => (
                <div
                  key={r.id}
                  className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3"
                >
                  <Gift className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {r.reward?.title ?? "Recompense"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDate(r.redeemed_at, "relative")}
                    </p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium",
                    r.status === "fulfilled" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" :
                    r.status === "pending" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20" :
                    "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20"
                  )}>
                    {r.status === "fulfilled" ? "Rempli" : r.status === "pending" ? "En attente" : "Annule"}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
