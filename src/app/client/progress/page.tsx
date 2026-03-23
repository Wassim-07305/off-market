"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  staggerItem,
  defaultTransition,
} from "@/lib/animations";
import { useXp } from "@/hooks/use-xp";
import { useBadges } from "@/hooks/use-badges";
import { RARITY_CONFIG, CATEGORY_CONFIG } from "@/types/gamification";
import type {
  BadgeCategory,
  BadgeRarity,
  Badge,
  XpTransaction,
} from "@/types/gamification";
import {
  Trophy,
  Star,
  TrendingUp,
  Medal,
  Lock,
  Zap,
  Calendar,
  BarChart3,
  ChevronRight,
  X,
  Clock,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

// ─── XP ACTION LABELS ─────────────────
const ACTION_LABELS: Record<string, string> = {
  complete_lesson: "Leçon terminée",
  complete_module: "Module terminé",
  complete_course: "Cours terminé",
  weekly_checkin: "Check-in hebdo",
  daily_journal: "Journal du jour",
  achieve_goal: "Objectif atteint",
  first_message: "Premier message",
  post_feed: "Publication feed",
  referral: "Parrainage",
  badge_earned: "Badge obtenu",
};

function getActionLabel(action: string) {
  return ACTION_LABELS[action] ?? action.replace(/_/g, " ");
}

// ─── LEVEL DATA (matches seed) ────────
const LEVELS = [
  { level: 1, name: "Debutant", min_xp: 0, icon: "🌱", color: "#71717A" },
  {
    level: 2,
    name: "Freelance Active",
    min_xp: 200,
    icon: "⚡",
    color: "#3B82F6",
  },
  {
    level: 3,
    name: "Closer en Herbe",
    min_xp: 500,
    icon: "🔥",
    color: "#F59E0B",
  },
  {
    level: 4,
    name: "Machine a Cash",
    min_xp: 1200,
    icon: "💰",
    color: "#22C55E",
  },
  {
    level: 5,
    name: "Legende des 10K",
    min_xp: 2500,
    icon: "👑",
    color: "#AF0000",
  },
];

export default function ClientProgressPage() {
  const { summary, transactions, isLoading: xpLoading } = useXp();
  const { allBadges, earnedBadgeIds, isLoading: badgesLoading } = useBadges();
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [xpFilter, setXpFilter] = useState<string>("all");
  const [showAllTx, setShowAllTx] = useState(false);

  const isLoading = xpLoading || badgesLoading;

  // Group badges by category
  const badgesByCategory = useMemo(
    () =>
      allBadges.reduce<Record<string, Badge[]>>((acc, badge) => {
        const cat = badge.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(badge);
        return acc;
      }, {}),
    [allBadges],
  );

  // XP chart data — cumulative XP by day
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];
    const sorted = [...transactions].reverse();
    const byDay: Record<string, number> = {};
    let cumulative = 0;
    for (const tx of sorted) {
      const day = tx.created_at.slice(0, 10);
      cumulative += tx.xp_amount;
      byDay[day] = cumulative;
    }
    return Object.entries(byDay).map(([day, xp]) => ({
      date: formatShortDate(day),
      xp,
    }));
  }, [transactions]);

  // XP breakdown by action type
  const xpByAction = useMemo(() => {
    const map: Record<string, number> = {};
    for (const tx of transactions) {
      map[tx.action] = (map[tx.action] ?? 0) + tx.xp_amount;
    }
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([action, xp]) => ({ action, xp }));
  }, [transactions]);

  // Unique action types for filter
  const actionTypes = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.action))),
    [transactions],
  );

  // Filtered transactions
  const filteredTx = useMemo(() => {
    const list =
      xpFilter === "all"
        ? transactions
        : transactions.filter((t) => t.action === xpFilter);
    return showAllTx ? list : list.slice(0, 15);
  }, [transactions, xpFilter, showAllTx]);

  // Category progress
  const categoryProgress = useMemo(() => {
    return Object.entries(badgesByCategory).map(([cat, badges]) => {
      const earned = badges.filter((b) => earnedBadgeIds.has(b.id)).length;
      return { category: cat as BadgeCategory, earned, total: badges.length };
    });
  }, [badgesByCategory, earnedBadgeIds]);

  // XP velocity (last 7 days vs previous 7 days)
  const xpVelocity = useMemo(() => {
    const now = Date.now();
    const week = 7 * 24 * 60 * 60 * 1000;
    const last7 = transactions
      .filter((t) => now - new Date(t.created_at).getTime() < week)
      .reduce((s, t) => s + t.xp_amount, 0);
    const prev7 = transactions
      .filter((t) => {
        const age = now - new Date(t.created_at).getTime();
        return age >= week && age < 2 * week;
      })
      .reduce((s, t) => s + t.xp_amount, 0);
    return {
      last7,
      prev7,
      trend: prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : 0,
    };
  }, [transactions]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">
          Ma Progression
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          XP, niveau, badges et historique complet
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
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
                style={{
                  backgroundColor: (summary.level.color ?? "#71717A") + "1A",
                }}
              >
                {summary.level.icon ?? "🌱"}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Niveau {summary.level.level} — {summary.level.name}
                </h2>
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
                    style={{
                      backgroundColor: summary.level.color ?? "#71717A",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${summary.progressToNext}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 text-center">
                  Encore {summary.nextLevel.min_xp - summary.totalXp} XP pour{" "}
                  {summary.nextLevel.name} {summary.nextLevel.icon}
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
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-semibold text-foreground font-serif">
                {earnedBadgeIds.size}
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
            <div className="bg-surface border border-border rounded-xl p-4 text-center">
              <Zap className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-semibold text-foreground font-serif">
                {xpVelocity.last7}
              </p>
              <p className="text-xs text-muted-foreground">
                XP / 7j
                {xpVelocity.trend !== 0 && (
                  <span
                    className={
                      xpVelocity.trend > 0 ? "text-emerald-500" : "text-red-500"
                    }
                  >
                    {" "}
                    {xpVelocity.trend > 0 ? "+" : ""}
                    {xpVelocity.trend}%
                  </span>
                )}
              </p>
            </div>
          </motion.div>

          {/* Level Timeline */}
          <motion.div
            variants={fadeInUp}
            transition={defaultTransition}
            className="bg-surface border border-border rounded-xl p-5"
          >
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Parcours de niveaux
            </h2>
            <div className="flex items-center gap-0">
              {LEVELS.map((lvl, i) => {
                const reached = summary.totalXp >= lvl.min_xp;
                const isCurrent = summary.level.level === lvl.level;
                return (
                  <div key={lvl.level} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
                          reached
                            ? "ring-2 ring-offset-2 ring-offset-surface"
                            : "opacity-30 grayscale"
                        } ${isCurrent ? "scale-110" : ""}`}
                        style={{
                          backgroundColor: reached
                            ? lvl.color + "1A"
                            : undefined,
                          ...(isCurrent
                            ? {
                                boxShadow: `0 0 0 2px var(--color-surface), 0 0 0 4px ${lvl.color}`,
                              }
                            : {}),
                        }}
                      >
                        {lvl.icon}
                      </div>
                      <p
                        className={`text-[11px] font-medium mt-1.5 text-center ${
                          reached ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {lvl.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {lvl.min_xp} XP
                      </p>
                    </div>
                    {i < LEVELS.length - 1 && (
                      <div className="flex-shrink-0 w-6 flex items-center -mt-6">
                        <ChevronRight
                          className={`w-4 h-4 ${
                            summary.totalXp >= LEVELS[i + 1].min_xp
                              ? "text-emerald-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* XP Chart */}
          {chartData.length > 1 && (
            <motion.div
              variants={fadeInUp}
              transition={defaultTransition}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Progression XP
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="xpGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={summary.level.color ?? "#71717A"}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={summary.level.color ?? "#71717A"}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{
                        fontSize: 11,
                        fill: "var(--color-muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "var(--color-muted-foreground)",
                      }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number | undefined) => [
                        `${value ?? 0} XP`,
                        "Total",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke={summary.level.color ?? "#71717A"}
                      strokeWidth={2}
                      fill="url(#xpGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* XP Breakdown by Action */}
          {xpByAction.length > 0 && (
            <motion.div
              variants={fadeInUp}
              transition={defaultTransition}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Repartition des XP
              </h2>
              <div className="space-y-2">
                {xpByAction.map(({ action, xp }) => {
                  const pct =
                    summary.totalXp > 0
                      ? Math.round((xp / summary.totalXp) * 100)
                      : 0;
                  return (
                    <div key={action} className="flex items-center gap-3">
                      <p className="text-xs text-foreground w-32 truncate">
                        {getActionLabel(action)}
                      </p>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground w-16 text-right">
                        {xp} XP
                      </p>
                      <p className="text-[10px] text-muted-foreground w-10 text-right">
                        {pct}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Badges by category with progress */}
          <motion.div variants={fadeInUp} transition={defaultTransition}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Medal className="w-4 h-4" />
                Badges ({earnedBadgeIds.size}/{allBadges.length})
              </h2>
            </div>

            {/* Category progress bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
              {categoryProgress.map(({ category, earned, total }) => {
                const conf = CATEGORY_CONFIG[category];
                const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
                return (
                  <div
                    key={category}
                    className="bg-surface border border-border rounded-lg p-2.5 text-center"
                  >
                    <span className="text-lg">{conf.emoji}</span>
                    <p className="text-[11px] font-medium text-foreground mt-0.5">
                      {conf.label}
                    </p>
                    <div className="w-full h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {earned}/{total}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Badge grid */}
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
                        const rarityConfig =
                          RARITY_CONFIG[badge.rarity as BadgeRarity];
                        return (
                          <button
                            key={badge.id}
                            onClick={() => setSelectedBadge(badge)}
                            className={`relative bg-surface border border-border rounded-xl p-3 text-center transition-all text-left ${
                              earned
                                ? "ring-1 ring-primary/20 hover:ring-primary/40"
                                : "opacity-40 grayscale hover:opacity-60"
                            }`}
                          >
                            <span className="text-2xl block mb-1">
                              {badge.icon ?? "🏅"}
                            </span>
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
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* XP History with filters */}
          {transactions.length > 0 && (
            <motion.div variants={fadeInUp} transition={defaultTransition}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Historique XP
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  <select
                    value={xpFilter}
                    onChange={(e) => setXpFilter(e.target.value)}
                    className="h-7 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="all">Toutes les actions</option>
                    {actionTypes.map((a) => (
                      <option key={a} value={a}>
                        {getActionLabel(a)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-xl divide-y divide-border">
                {filteredTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {getActionLabel(tx.action)}
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
              {!showAllTx && transactions.length > 15 && (
                <button
                  onClick={() => setShowAllTx(true)}
                  className="w-full mt-2 text-xs text-primary hover:underline text-center py-2"
                >
                  Voir tout l&apos;historique ({transactions.length} actions)
                </button>
              )}
            </motion.div>
          )}
        </>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedBadge(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-sm m-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedBadge.icon ?? "🏅"}</span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {selectedBadge.name}
                  </h3>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      RARITY_CONFIG[selectedBadge.rarity as BadgeRarity].color
                    } ${RARITY_CONFIG[selectedBadge.rarity as BadgeRarity].bg}`}
                  >
                    {RARITY_CONFIG[selectedBadge.rarity as BadgeRarity].label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBadge(null)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedBadge.description && (
              <p className="text-sm text-muted-foreground mb-4">
                {selectedBadge.description}
              </p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Catégorie</span>
                <span className="text-foreground">
                  {CATEGORY_CONFIG[selectedBadge.category].emoji}{" "}
                  {CATEGORY_CONFIG[selectedBadge.category].label}
                </span>
              </div>
              {selectedBadge.xp_reward > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Récompense</span>
                  <span className="text-emerald-500 font-medium">
                    +{selectedBadge.xp_reward} XP
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Statut</span>
                {earnedBadgeIds.has(selectedBadge.id) ? (
                  <span className="text-emerald-500 font-medium flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Obtenu
                  </span>
                ) : (
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" />
                    Verrouille
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
