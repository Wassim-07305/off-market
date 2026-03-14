"use client";

import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { AdminRewards } from "@/components/gamification/admin-rewards";
import { Gift } from "lucide-react";

export default function AdminRewardsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
          <Gift className="w-7 h-7" />
          Gestion des recompenses
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cree et gere le catalogue de recompenses, traite les echanges en
          attente
        </p>
      </motion.div>

      <AdminRewards />
    </motion.div>
  );
}
