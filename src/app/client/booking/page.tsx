"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { BookingCalendar } from "@/components/calls/booking-calendar";
import { CalendarCheck } from "lucide-react";

export default function BookingPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
          <CalendarCheck className="w-6 h-6 text-primary" />
          Reserver un appel
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez un creneau disponible pour planifier un appel avec votre coach
        </p>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <BookingCalendar />
      </motion.div>
    </motion.div>
  );
}
