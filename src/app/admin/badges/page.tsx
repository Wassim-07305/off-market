"use client";

import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { AdminBadges } from "@/components/gamification/admin-badges";
import { Award } from "lucide-react";

export default function AdminBadgesPage() {
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Gestion des badges
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Cree et gere les badges, definis les conditions de deblocage et
              consulte qui les a obtenus
            </p>
          </div>
        </div>
      </motion.div>

      <AdminBadges />
    </motion.div>
  );
}
