"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ReplayLibrary } from "@/components/school/replay-library";
import { Video } from "lucide-react";

export default function ReplaysPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Video className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Replays
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Retrouvez tous les replays de lives et sessions enregistrees
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ReplayLibrary />
      </motion.div>
    </motion.div>
  );
}
