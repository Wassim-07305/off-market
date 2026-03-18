"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useHallOfFame, type HallOfFameEntry } from "@/hooks/use-hall-of-fame";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn, getInitials, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import {
  Crown,
  Star,
  Trophy,
  Zap,
  Quote,
  TrendingUp,
  Calendar,
  Filter,
  Sparkles,
} from "lucide-react";

export default function HallOfFamePage() {
  const { entries, isLoading, error } = useHallOfFame();
  const prefix = useRoutePrefix();
  const [nicheFilter, setNicheFilter] = useState<string>("all");

  // Extract unique niches for filter
  const niches = useMemo(() => {
    const set = new Set(
      entries.filter((e) => e.niche).map((e) => e.niche as string),
    );
    return ["all", ...Array.from(set)];
  }, [entries]);

  const filtered = useMemo(() => {
    if (nicheFilter === "all") return entries;
    return entries.filter((e) => e.niche === nicheFilter);
  }, [entries, nicheFilter]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3 mb-1">
          <Crown className="w-7 h-7 text-amber-500" />
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Hall of Fame
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Les freelances qui ont atteint 10K EUR/mois et plus. Bienvenue dans le
          cercle VIP.
        </p>
      </motion.div>

      {/* Stats summary */}
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-3">
        <div
          className="bg-surface rounded-xl p-4 text-center border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Crown className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-foreground tabular-nums">
            {entries.length}
          </p>
          <p className="text-[10px] text-muted-foreground">Alumni VIP</p>
        </div>
        <div
          className="bg-surface rounded-xl p-4 text-center border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-foreground tabular-nums">
            {entries.length > 0
              ? formatCurrency(
                  Math.max(...entries.map((e) => e.monthly_revenue)),
                )
              : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Record mensuel</p>
        </div>
        <div
          className="bg-surface rounded-xl p-4 text-center border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-foreground tabular-nums">
            {entries.length > 0
              ? formatCurrency(
                  Math.round(
                    entries.reduce((s, e) => s + e.monthly_revenue, 0) /
                      entries.length,
                  ),
                )
              : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Revenu moyen</p>
        </div>
      </motion.div>

      {/* Niche filter */}
      {niches.length > 2 && (
        <motion.div
          variants={staggerItem}
          className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"
        >
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
        </motion.div>
      )}

      {/* Entries */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-muted/50 animate-shimmer rounded-2xl"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center border border-border"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Crown className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">
            Le Hall of Fame attend ses premiers membres
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Les freelances qui atteignent 10 000 EUR/mois grace a la methode Off
            Market sont celebres ici. A qui le tour ?
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry, i) => (
            <HallOfFameCard
              key={entry.id}
              entry={entry}
              prefix={prefix}
              index={i}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Hall of Fame Card ───────────────
function HallOfFameCard({
  entry,
  prefix,
  index,
}: {
  entry: HallOfFameEntry;
  prefix: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div
        className="bg-surface border border-amber-500/20 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-colors"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Gold gradient bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Profile info */}
            <Link
              href={`${prefix}/profile/${entry.profile_id}`}
              className="flex items-center gap-4 shrink-0 group"
            >
              <div className="relative">
                {entry.profile?.avatar_url ? (
                  <Image
                    src={entry.profile.avatar_url}
                    alt={entry.profile.full_name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-2xl object-cover group-hover:ring-2 ring-amber-500/30 transition-all"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center text-xl text-amber-600 font-bold group-hover:ring-2 ring-amber-500/30 transition-all">
                    {getInitials(entry.profile?.full_name ?? "?")}
                  </div>
                )}
                <Crown className="absolute -top-2 -right-2 w-5 h-5 text-amber-500 drop-shadow-sm" />
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

            {/* Revenue + date */}
            <div className="flex-1 flex flex-col sm:items-end justify-center">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-bold text-amber-600 tabular-nums">
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
