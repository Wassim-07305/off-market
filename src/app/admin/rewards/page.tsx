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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#AF0000]/20 to-[#DC2626]/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-[#AF0000]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Gestion des récompenses
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cree et gere le catalogue de récompenses, traite les echanges en
              attente
            </p>
          </div>
        </div>
      </motion.div>

      <AdminRewards />
    </motion.div>
  );
}
