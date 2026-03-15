"use client";

import { useState, useMemo } from "react";
import { cn, getInitials, formatCurrency } from "@/lib/utils";
import type { HallOfFameEntry } from "@/hooks/use-hall-of-fame";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Crown,
  Trophy,
  Zap,
  Quote,
  Calendar,
  TrendingUp,
  Filter,
  SlidersHorizontal,
} from "lucide-react";

interface HallOfFameWallProps {
  entries: HallOfFameEntry[];
  prefix: string;
  isLoading?: boolean;
}

type SortBy = "revenue" | "date" | "xp";
type RevenueFilter = "all" | "10k" | "20k" | "50k";

const REVENUE_FILTERS: { value: RevenueFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "10k", label: "10K+" },
  { value: "20k", label: "20K+" },
  { value: "50k", label: "50K+" },
];

const REVENUE_THRESHOLDS: Record<RevenueFilter, number> = {
  all: 0,
  "10k": 10000,
  "20k": 20000,
  "50k": 50000,
};

export function HallOfFameWall({
  entries,
  prefix,
  isLoading,
}: HallOfFameWallProps) {
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("revenue");

  // Extract unique niches
  const niches = useMemo(() => {
    const set = new Set(
      entries.filter((e) => e.niche).map((e) => e.niche as string),
    );
    return ["all", ...Array.from(set)];
  }, [entries]);

  // Filter and sort
  const filtered = useMemo(() => {
    let result = entries;

    if (nicheFilter !== "all") {
      result = result.filter((e) => e.niche === nicheFilter);
    }

    if (revenueFilter !== "all") {
      result = result.filter(
        (e) => e.monthly_revenue >= REVENUE_THRESHOLDS[revenueFilter],
      );
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "revenue":
          return b.monthly_revenue - a.monthly_revenue;
        case "date":
          return (
            new Date(b.achievement_date).getTime() -
            new Date(a.achievement_date).getTime()
          );
        case "xp":
          return b.total_xp - a.total_xp;
        default:
          return 0;
      }
    });
  }, [entries, nicheFilter, revenueFilter, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-muted/50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Niche filter */}
        {niches.length > 2 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1">
            {niches.map((niche) => (
              <button
                key={niche}
                onClick={() => setNicheFilter(niche)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                  nicheFilter === niche
                    ? "bg-amber-500/10 text-amber-600 shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {niche === "all" ? "Toutes les niches" : niche}
              </button>
            ))}
          </div>
        )}

        {/* Revenue filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          {REVENUE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRevenueFilter(f.value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all",
                revenueFilter === f.value
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
          {(
            [
              { value: "revenue", label: "CA" },
              { value: "date", label: "Date" },
              { value: "xp", label: "XP" },
            ] as const
          ).map((s) => (
            <button
              key={s.value}
              onClick={() => setSortBy(s.value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all",
                sortBy === s.value
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          className="bg-surface rounded-2xl p-12 text-center border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Crown className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            Aucun resultat
          </h3>
          <p className="text-sm text-muted-foreground">
            Modifie les filtres pour afficher des resultats.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry, i) => (
            <PremiumHallOfFameCard
              key={entry.id}
              entry={entry}
              prefix={prefix}
              index={i}
              rank={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PremiumHallOfFameCard({
  entry,
  prefix,
  index,
  rank,
}: {
  entry: HallOfFameEntry;
  prefix: string;
  index: number;
  rank: number;
}) {
  const isTop3 = rank <= 3;
  const rankGradient =
    rank === 1
      ? "from-amber-400 via-amber-500 to-amber-600"
      : rank === 2
        ? "from-zinc-300 via-zinc-400 to-zinc-500"
        : rank === 3
          ? "from-amber-600 via-amber-700 to-amber-800"
          : "from-border to-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <div
        className={cn(
          "bg-surface border rounded-2xl overflow-hidden transition-all hover:shadow-lg",
          isTop3 ? "border-amber-500/20" : "border-border",
        )}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Gradient bar */}
        <div className={cn("h-1 bg-gradient-to-r", rankGradient)} />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Rank badge + profile */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Rank */}
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg",
                  isTop3
                    ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {rank <= 3 ? (
                  <Crown
                    className={cn(
                      "w-5 h-5",
                      rank === 1
                        ? "text-amber-500"
                        : rank === 2
                          ? "text-zinc-400"
                          : "text-amber-700",
                    )}
                  />
                ) : (
                  `#${rank}`
                )}
              </div>

              {/* Avatar + name */}
              <Link
                href={`${prefix}/profile/${entry.profile_id}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative">
                  {entry.profile?.avatar_url ? (
                    <img
                      src={entry.profile.avatar_url}
                      alt={entry.profile.full_name}
                      className={cn(
                        "w-14 h-14 rounded-2xl object-cover transition-all",
                        "group-hover:ring-2 ring-amber-500/30",
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5",
                        "flex items-center justify-center text-lg text-amber-600 font-bold",
                        "group-hover:ring-2 ring-amber-500/30 transition-all",
                      )}
                    >
                      {getInitials(entry.profile?.full_name ?? "?")}
                    </div>
                  )}
                  {isTop3 && (
                    <Crown className="absolute -top-2 -right-2 w-4 h-4 text-amber-500 drop-shadow-sm" />
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground group-hover:text-amber-600 transition-colors">
                    {entry.profile?.full_name ?? "Freelance"}
                  </p>
                  {entry.niche && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {entry.niche}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {entry.total_xp.toLocaleString("fr-FR")} XP
                    </span>
                    {entry.badge_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Trophy className="w-3 h-3 text-purple-500" />
                        {entry.badge_count} badges
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>

            {/* Revenue + date */}
            <div className="flex-1 flex flex-col sm:items-end justify-center">
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-3xl font-display font-bold tabular-nums",
                    isTop3 ? "text-amber-600" : "text-foreground",
                  )}
                >
                  {formatCurrency(entry.monthly_revenue)}
                </span>
                <span className="text-xs text-muted-foreground">/mois</span>
              </div>
              <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3" />
                Atteint en{" "}
                {new Date(entry.achievement_date).toLocaleDateString("fr-FR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Testimony */}
          {entry.testimony && (
            <div className="mt-5 pt-4 border-t border-border/50">
              <div className="flex gap-3">
                <Quote className="w-5 h-5 text-amber-500/40 shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 italic leading-relaxed">
                  {entry.testimony}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
