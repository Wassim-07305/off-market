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
        <h1 className="text-3xl font-semibold text-foreground flex items-center gap-3">
          <Award className="w-7 h-7" />
          Gestion des badges
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cree et gere les badges, definis les conditions de deblocage et
          consulte qui les a obtenus
        </p>
      </motion.div>

      <AdminBadges />
    </motion.div>
  );
}
