"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useHallOfFame } from "@/hooks/use-hall-of-fame";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { formatCurrency } from "@/lib/utils";
import { HallOfFameWall } from "@/components/gamification/hall-of-fame-wall";
import {
  Crown,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function HallOfFamePage() {
  const { entries, isLoading, error } = useHallOfFame();
  const prefix = useRoutePrefix();

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

      {/* Wall with filters, sorting, and cards */}
      <motion.div variants={staggerItem}>
        <HallOfFameWall
          entries={entries}
          prefix={prefix}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}

