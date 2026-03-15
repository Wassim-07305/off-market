"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  Kanban,
  Clock,
  Users,
} from "lucide-react";
import { PipelineKanban } from "@/components/crm/pipeline-kanban";
import { PipelineTimeline } from "@/components/crm/pipeline-timeline";
import { CsmDashboard } from "@/components/crm/csm-dashboard";

type CrmView = "pipeline" | "timeline" | "coach";

export default function CRMPage() {
  const [view, setView] = useState<CrmView>("pipeline");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            CRM
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === "pipeline"
              ? "Pipeline commercial"
              : view === "coach"
                ? "Vue par coach / CSM"
                : "Activite recente"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-xs)" }}
          >
            {(
              [
                { key: "pipeline" as const, label: "Pipeline", icon: Kanban },
                { key: "timeline" as const, label: "Timeline", icon: Clock },
                { key: "coach" as const, label: "Par Coach", icon: Users },
              ] as const
            ).map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                    view === v.key
                      ? "bg-foreground text-background"
                      : "bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Pipeline / Timeline / Coach view */}
      {view === "timeline" ? (
        <motion.div variants={staggerItem}>
          <PipelineTimeline />
        </motion.div>
      ) : view === "coach" ? (
        <motion.div variants={staggerItem}>
          <CsmDashboard
            onFilterByCoach={() => {
              setView("pipeline");
            }}
          />
        </motion.div>
      ) : (
        <motion.div variants={staggerItem}>
          <PipelineKanban />
        </motion.div>
      )}
    </motion.div>
  );
}
