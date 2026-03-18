"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import { ClipboardCheck, BookOpen, Target } from "lucide-react";
import dynamic from "next/dynamic";

const CheckinContent = dynamic(() => import("@/app/client/checkin/page"), {
  ssr: false,
});
const JournalContent = dynamic(() => import("@/app/client/journal/page"), {
  ssr: false,
});
const GoalsContent = dynamic(() => import("@/app/client/goals/page"), {
  ssr: false,
});

type Tab = "checkin" | "journal" | "objectifs";

export default function ClientSuiviPage() {
  const [tab, setTab] = useState<Tab>("checkin");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Suivi
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check-ins, journal et objectifs au meme endroit
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("checkin")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "checkin"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <ClipboardCheck className="w-4 h-4" />
            Check-in
          </button>
          <button
            onClick={() => setTab("journal")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "journal"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <BookOpen className="w-4 h-4" />
            Journal
          </button>
          <button
            onClick={() => setTab("objectifs")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "objectifs"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Target className="w-4 h-4" />
            Objectifs
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        {tab === "checkin" && <CheckinContent />}
        {tab === "journal" && <JournalContent />}
        {tab === "objectifs" && <GoalsContent />}
      </div>
    </motion.div>
  );
}
