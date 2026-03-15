"use client";

import { useRef } from "react";
import { cn, formatDate } from "@/lib/utils";
import { useState } from "react";
import {
  Map,
  Printer,
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  Target,
  Download,
  Loader2 as DownloadLoader,
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, defaultTransition } from "@/lib/animations";
import type { ClientRoadmap, RoadmapMilestone, MilestoneStatus } from "@/types/roadmap";
import { MilestoneCard } from "./milestone-card";

interface RoadmapViewerProps {
  roadmap: ClientRoadmap & { milestones: RoadmapMilestone[] };
  isStaff?: boolean;
  onStatusChange?: (id: string, status: MilestoneStatus) => void;
  onComplete?: (id: string, notes?: string) => void;
  onNotesUpdate?: (id: string, notes: string) => void;
  isPending?: boolean;
}

export function RoadmapViewer({
  roadmap,
  isStaff = false,
  onStatusChange,
  onComplete,
  onNotesUpdate,
  isPending = false,
}: RoadmapViewerProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const milestones = roadmap.milestones ?? [];
  const completed = milestones.filter((m) => m.status === "completed").length;
  const inProgress = milestones.filter(
    (m) => m.status === "in_progress",
  ).length;
  const total = milestones.length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await fetch(`/api/roadmap/${roadmap.id}/pdf`);
      if (!res.ok) throw new Error("Erreur de telechargement");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roadmap-${roadmap.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — user will see the button reset
    } finally {
      setDownloadingPdf(false);
    }
  };

  const sourceLabel = {
    kickoff_call: "Appel kickoff",
    manual: "Creation manuelle",
    ai_suggestion: "Suggestion IA",
  };

  return (
    <div ref={printRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {roadmap.title}
            </h2>
            {roadmap.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {roadmap.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(roadmap.created_at, "long")}
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {sourceLabel[roadmap.generated_from]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {downloadingPdf ? (
              <DownloadLoader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            Telecharger PDF
          </button>
          <button
            onClick={handlePrint}
            className="h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimer
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-border rounded-xl p-4 space-y-3 print:border-zinc-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">
                {completed}/{total}
              </span>
              <span className="text-xs text-muted-foreground">termines</span>
            </div>
            {inProgress > 0 && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">
                  {inProgress}
                </span>
                <span className="text-xs text-muted-foreground">en cours</span>
              </div>
            )}
          </div>
          <span className="text-lg font-bold text-primary">
            {progressPercent}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Milestones timeline */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative space-y-3"
      >
        {/* Vertical line */}
        <div className="absolute left-[1.5rem] top-0 bottom-0 w-px bg-border print:bg-zinc-300" />

        {milestones.map((milestone, index) => (
          <motion.div
            key={milestone.id}
            variants={staggerItem}
            transition={defaultTransition}
            className="relative pl-12"
          >
            {/* Timeline dot */}
            <div
              className={cn(
                "absolute left-[1.125rem] top-4 w-3 h-3 rounded-full border-2 bg-white z-10",
                milestone.status === "completed"
                  ? "border-emerald-500 bg-emerald-500"
                  : milestone.status === "in_progress"
                    ? "border-blue-500 bg-blue-100"
                    : milestone.status === "skipped"
                      ? "border-orange-500 bg-orange-100"
                      : "border-zinc-300",
              )}
            />

            {/* Step number */}
            <div className="absolute left-0 top-3.5 w-5 h-5 rounded-full bg-muted flex items-center justify-center print:bg-zinc-100">
              <span className="text-[10px] font-bold text-muted-foreground">
                {index + 1}
              </span>
            </div>

            <MilestoneCard
              milestone={milestone}
              isStaff={isStaff}
              onStatusChange={onStatusChange}
              onComplete={onComplete}
              onNotesUpdate={onNotesUpdate}
              isPending={isPending}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {milestones.length === 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <Target className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Aucun jalon dans cette roadmap
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Generez une roadmap IA ou ajoutez des jalons manuellement
          </p>
        </div>
      )}

    </div>
  );
}
