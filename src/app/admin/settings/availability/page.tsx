"use client";

import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { AvailabilityManager } from "@/components/calls/availability-manager";
import { Clock } from "lucide-react";

export default function AvailabilitySettingsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Disponibilites
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configurez vos creneaux de disponibilite pour les reservations de vos
          clients
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <AvailabilityManager />
      </motion.div>
    </motion.div>
  );
}
