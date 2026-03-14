"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { RewardsCatalog } from "@/components/gamification/rewards-catalog";
import { RedemptionHistory } from "@/components/gamification/redemption-history";
import { Gift, History } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "catalog" | "history";

export default function ClientRewardsPage() {
  const [tab, setTab] = useState<Tab>("catalog");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Recompenses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Echange tes XP contre des recompenses exclusives
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit"
      >
        <button
          onClick={() => setTab("catalog")}
          className={cn(
            "h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            tab === "catalog"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Gift className="w-4 h-4" />
          Catalogue
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "h-9 px-4 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            tab === "history"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <History className="w-4 h-4" />
          Mes echanges
        </button>
      </motion.div>

      {/* Content */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        {tab === "catalog" ? <RewardsCatalog /> : <RedemptionHistory />}
      </motion.div>
    </motion.div>
  );
}
