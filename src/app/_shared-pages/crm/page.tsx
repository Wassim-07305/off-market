"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Kanban, Clock, Users, Magnet, Zap } from "lucide-react";
import { PipelineKanban } from "@/components/crm/pipeline-kanban";
import { PipelineTimeline } from "@/components/crm/pipeline-timeline";
import { CsmDashboard } from "@/components/crm/csm-dashboard";
import { LeadMagnetStats } from "@/components/leads/lead-magnet-stats";
import { RelanceSequencesView } from "@/components/crm/relance-sequences-view";

type CrmView = "pipeline" | "timeline" | "coach" | "leads" | "relances";

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
                : view === "leads"
                  ? "Leads entrants & qualification"
                  : view === "relances"
                    ? "Sequences de relance automatique"
                    : "Activite recente"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {(
              [
                { key: "pipeline" as const, label: "Pipeline", icon: Kanban },
                { key: "timeline" as const, label: "Timeline", icon: Clock },
                { key: "coach" as const, label: "Par Coach", icon: Users },
                { key: "leads" as const, label: "Leads", icon: Magnet },
                { key: "relances" as const, label: "Relances", icon: Zap },
              ] as const
            ).map((v) => {
              const Icon = v.icon;
              return (
                <button
                  key={v.key}
                  onClick={() => setView(v.key)}
                  className={cn(
                    "h-7 px-2.5 rounded-md flex items-center gap-1.5 text-[11px] font-medium transition-all",
                    view === v.key
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Pipeline / Timeline / Coach / Leads view */}
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
      ) : view === "leads" ? (
        <motion.div variants={staggerItem}>
          <LeadMagnetStats />
        </motion.div>
      ) : view === "relances" ? (
        <motion.div variants={staggerItem}>
          <RelanceSequencesView />
        </motion.div>
      ) : (
        <motion.div variants={staggerItem}>
          <PipelineKanban />
        </motion.div>
      )}
    </motion.div>
  );
}
