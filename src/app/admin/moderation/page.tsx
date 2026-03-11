"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useFeedReports } from "@/hooks/use-reports-moderation";
import {
  REPORT_REASONS,
  REPORT_STATUS_CONFIG,
} from "@/types/feed";
import type { ReportStatus, FeedReport } from "@/types/feed";
import {
  Shield,
  Check,
  X,
  Trash2,
  Eye,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const STATUS_TABS: { value: ReportStatus | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En attente" },
  { value: "reviewed", label: "Examines" },
  { value: "actioned", label: "Actions" },
  { value: "dismissed", label: "Rejetes" },
];

export default function ModerationPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("pending");
  const { reports, isLoading, reviewReport, deleteReportedContent } = useFeedReports(
    statusFilter === "all" ? undefined : statusFilter
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              Moderation
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestion des signalements de la communaute
            </p>
          </div>
        </div>
      </motion.div>

      {/* Status tabs */}
      <motion.div variants={staggerItem} className="flex gap-1.5 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              statusFilter === tab.value
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.value === "pending" && reports.length > 0 && statusFilter !== "pending" && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                {reports.length}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-surface rounded-2xl animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Check className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun signalement {statusFilter !== "all" ? "dans cette categorie" : ""}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <motion.div key={report.id} variants={staggerItem}>
              <ReportCard
                report={report}
                onReview={(status, action) =>
                  reviewReport.mutate(
                    { id: report.id, status, action_taken: action },
                    {
                      onSuccess: () =>
                        toast.success(
                          status === "dismissed"
                            ? "Signalement rejete"
                            : "Signalement traite"
                        ),
                    }
                  )
                }
                onDeleteContent={() =>
                  deleteReportedContent.mutate(
                    {
                      reportId: report.id,
                      postId: report.post_id,
                      commentId: report.comment_id,
                    },
                    { onSuccess: () => toast.success("Contenu supprime") }
                  )
                }
              />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function ReportCard({
  report,
  onReview,
  onDeleteContent,
}: {
  report: FeedReport;
  onReview: (status: ReportStatus, action?: "warning" | "content_removed" | "user_suspended") => void;
  onDeleteContent: () => void;
}) {
  const statusConfig = REPORT_STATUS_CONFIG[report.status];
  const reasonLabel = REPORT_REASONS.find((r) => r.value === report.reason)?.label ?? report.reason;
  const isPending = report.status === "pending";

  const contentPreview = report.post?.content ?? report.comment?.content ?? "Contenu non disponible";
  const contentType = report.post_id ? "Publication" : "Commentaire";

  return (
    <div
      className="bg-surface rounded-2xl p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                {reasonLabel}
              </p>
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {contentType} signale par {report.reporter?.full_name ?? "Inconnu"} ·{" "}
              {new Date(report.created_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Content preview */}
      <div className="bg-muted/50 rounded-xl p-3 mb-3">
        <p className="text-xs text-muted-foreground mb-1">{contentType} signale :</p>
        <p className="text-sm text-foreground line-clamp-3">{contentPreview}</p>
      </div>

      {report.details && (
        <p className="text-xs text-muted-foreground mb-3">
          <span className="font-medium">Details :</span> {report.details}
        </p>
      )}

      {report.reviewed_by && report.reviewer && (
        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Examine par {report.reviewer.full_name}
          {report.reviewed_at &&
            ` le ${new Date(report.reviewed_at).toLocaleDateString("fr-FR")}`}
        </p>
      )}

      {/* Actions */}
      {isPending && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/30">
          <button
            onClick={() => onReview("dismissed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Rejeter
          </button>
          <button
            onClick={() => onReview("actioned", "warning")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            Avertissement
          </button>
          <button
            onClick={onDeleteContent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-error hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer le contenu
          </button>
        </div>
      )}
    </div>
  );
}
