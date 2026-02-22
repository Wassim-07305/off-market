"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useXp } from "@/hooks/use-xp";
import { useBadges } from "@/hooks/use-badges";
import { RARITY_CONFIG, CATEGORY_CONFIG } from "@/types/gamification";
import type { BadgeCategory, BadgeRarity, Badge } from "@/types/gamification";
import { Trophy, Star, TrendingUp, Medal, Lock } from "lucide-react";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function ClientProgressPage() {
  const { summary, transactions, isLoading: xpLoading } = useXp();
  const { allBadges, earnedBadgeIds, isLoading: badgesLoading } = useBadges();

  const isLoading = xpLoading || badgesLoading;

  // Group badges by category
  const badgesByCategory = allBadges.reduce<Record<string, Badge[]>>((acc, badge) => {
    const cat = badge.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(badge);
    return acc;
  }, {});

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Ma Progression</h1>
        <p className="text-sm text-muted-foreground mt-1">
          XP, niveau et badges gagnes
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* XP & Level Card */}
          <motion.div
            variants={fadeInUp}
            transition={defaultTransition}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: (summary.level.color ?? "#71717A") + "1A" }}
              >
                {summary.level.icon ?? "🌱"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Niveau {summary.level.level} — {summary.level.name}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {summary.totalXp} XP total • Rang #{summary.rank || "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-semibold text-foreground font-serif">
                  {summary.totalXp}
                </p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </div>

            {/* Progress bar */}
            {summary.nextLevel ? (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Niveau {summary.level.level}</span>
                  <span>{summary.progressToNext}%</span>
                  <span>Niveau {summary.nextLevel.level}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: summary.level.color ?? "#71717A" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${summary.progressToNext}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  Encore {summary.nextLevel.min_xp - summary.totalXp} XP pour {summary.nextLevel.name} {summary.nextLevel.icon}
                </p>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm font-medium text-foreground">
                  Niveau maximum atteint ! 🎉
                </p>
              </div>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeInUp}
            transition={defaultTransition}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-semibold text-foreground font-serif">
                {summary.badges.length}
              </p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <Star className="w-5 h-5 text-blue-500 mx-auto mb-1" />
              <p className="text-2xl font-semibold text-foreground font-serif">
                {summary.level.level}
              </p>
              <p className="text-xs text-muted-foreground">Niveau</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <p className="text-2xl font-semibold text-foreground font-serif">
                #{summary.rank || "—"}
              </p>
              <p className="text-xs text-muted-foreground">Classement</p>
            </div>
          </motion.div>

          {/* Badges by category */}
          <motion.div variants={fadeInUp} transition={defaultTransition}>
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Medal className="w-4 h-4" />
              Badges ({earnedBadgeIds.size}/{allBadges.length})
            </h2>
            <div className="space-y-4">
              {Object.entries(badgesByCategory).map(([category, badges]) => {
                const catConfig = CATEGORY_CONFIG[category as BadgeCategory];
                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      {catConfig.emoji} {catConfig.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {badges.map((badge) => {
                        const earned = earnedBadgeIds.has(badge.id);
                        const rarityConfig = RARITY_CONFIG[badge.rarity as BadgeRarity];
                        return (
                          <div
                            key={badge.id}
                            className={`relative bg-surface border border-border rounded-xl p-3 text-center transition-all ${
                              earned
                                ? "ring-1 ring-primary/20"
                                : "opacity-40 grayscale"
                            }`}
                          >
                            <span className="text-2xl block mb-1">{badge.icon ?? "🏅"}</span>
                            <p className="text-xs font-medium text-foreground truncate">
                              {badge.name}
                            </p>
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${rarityConfig.color} ${rarityConfig.bg}`}
                            >
                              {rarityConfig.label}
                            </span>
                            {badge.xp_reward > 0 && (
                              <p className="text-[10px] text-muted-foreground mt-1">
                                +{badge.xp_reward} XP
                              </p>
                            )}
                            {!earned && (
                              <div className="absolute top-2 right-2">
                                <Lock className="w-3 h-3 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent XP transactions */}
          {transactions.length > 0 && (
            <motion.div variants={fadeInUp} transition={defaultTransition}>
              <h2 className="text-sm font-semibold text-foreground mb-3">
                Historique XP recent
              </h2>
              <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                {transactions.slice(0, 10).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {timeAgo(tx.created_at)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-500">
                      +{tx.xp_amount} XP
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
