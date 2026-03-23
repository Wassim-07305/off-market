"use client";

import { useState } from "react";
import {
  Zap,
  Pause,
  Play,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useContactEnrollments,
  usePauseEnrollment,
  useResumeEnrollment,
  useCancelEnrollment,
} from "@/hooks/use-relance";
import type { EnrollmentStatus } from "@/types/relance";

// ─── Status config ───────────────────────────────────────

const statusConfig: Record<
  EnrollmentStatus,
  { label: string; icon: typeof Zap; color: string; bgColor: string }
> = {
  active: {
    label: "Active",
    icon: Zap,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  paused: {
    label: "En pause",
    icon: Pause,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  completed: {
    label: "Terminee",
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  cancelled: {
    label: "Annulee",
    icon: X,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
  },
};

// ─── Days until helper ───────────────────────────────────

function daysUntil(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  return `Dans ${diff} jours`;
}

// ─── Enrollment Detail Popover ───────────────────────────

interface EnrollmentDetailProps {
  contactId: string;
  onClose: () => void;
}

function EnrollmentDetail({ contactId, onClose }: EnrollmentDetailProps) {
  const { data: enrollments, isLoading } = useContactEnrollments(contactId);
  const pauseEnrollment = usePauseEnrollment();
  const resumeEnrollment = useResumeEnrollment();
  const cancelEnrollment = useCancelEnrollment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!enrollments?.length) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">Aucune sequence active</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
      {enrollments.map((enrollment) => {
        const config = statusConfig[enrollment.status];
        const StatusIcon = config.icon;
        const totalSteps = enrollment.sequence?.steps?.length ?? 0;

        return (
          <div
            key={enrollment.id}
            className="rounded-lg border border-border p-2.5 bg-surface"
          >
            {/* Sequence name + status */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <p className="text-xs font-medium text-foreground truncate">
                {enrollment.sequence?.name ?? "Sequence"}
              </p>
              <Badge
                className={cn(
                  "text-[10px] px-1.5 py-0",
                  config.color,
                  config.bgColor,
                )}
              >
                <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                {config.label}
              </Badge>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{
                    width: `${totalSteps > 0 ? (enrollment.current_step / totalSteps) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {enrollment.current_step}/{totalSteps}
              </span>
            </div>

            {/* Next step timing */}
            {enrollment.status === "active" && enrollment.next_step_at && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                <Clock className="h-3 w-3" />
                Prochaine relance : {daysUntil(enrollment.next_step_at)}
              </div>
            )}

            {/* Actions */}
            {(enrollment.status === "active" ||
              enrollment.status === "paused") && (
              <div className="flex items-center gap-1.5">
                {enrollment.status === "active" ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => pauseEnrollment.mutate(enrollment.id)}
                    loading={pauseEnrollment.isPending}
                    icon={<Pause className="h-3 w-3" />}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => resumeEnrollment.mutate(enrollment.id)}
                    loading={resumeEnrollment.isPending}
                    icon={<Play className="h-3 w-3" />}
                  >
                    Reprendre
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-destructive hover:text-destructive"
                  onClick={() => cancelEnrollment.mutate(enrollment.id)}
                  loading={cancelEnrollment.isPending}
                  icon={<X className="h-3 w-3" />}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Enrollment Badge ────────────────────────────────────

interface RelanceEnrollmentBadgeProps {
  contactId: string;
  className?: string;
  compact?: boolean;
}

export function RelanceEnrollmentBadge({
  contactId,
  className,
  compact = false,
}: RelanceEnrollmentBadgeProps) {
  const { data: enrollments } = useContactEnrollments(contactId);
  const [showDetail, setShowDetail] = useState(false);

  const activeEnrollments = enrollments?.filter(
    (e) => e.status === "active" || e.status === "paused",
  );

  if (!activeEnrollments?.length) return null;

  const firstActive = activeEnrollments[0];
  const config = statusConfig[firstActive.status];
  const StatusIcon = config.icon;
  const totalSteps = firstActive.sequence?.steps?.length ?? 0;
  const nextStepLabel = firstActive.next_step_at
    ? daysUntil(firstActive.next_step_at)
    : null;

  if (compact) {
    return (
      <div className={cn("relative inline-flex", className)}>
        <Tooltip
          content={
            <div className="text-xs">
              <p className="font-medium">
                {firstActive.sequence?.name ?? "Sequence de relance"}
              </p>
              <p>
                Étape {firstActive.current_step}/{totalSteps}
              </p>
              {nextStepLabel && <p>Relance {nextStepLabel.toLowerCase()}</p>}
            </div>
          }
        >
          <button
            type="button"
            onClick={() => setShowDetail(!showDetail)}
            className={cn(
              "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              "transition-all cursor-pointer",
              config.color,
              config.bgColor,
              "hover:ring-2 hover:ring-primary/20",
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {firstActive.current_step}/{totalSteps}
          </button>
        </Tooltip>

        {showDetail && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDetail(false)}
            />
            {/* Popover */}
            <div className="absolute top-full right-0 mt-1 z-50 w-64 rounded-xl border border-border bg-surface p-3 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">
                  Sequences de relance
                </p>
                <button
                  type="button"
                  onClick={() => setShowDetail(false)}
                  className="p-0.5 rounded hover:bg-secondary text-muted-foreground cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <EnrollmentDetail
                contactId={contactId}
                onClose={() => setShowDetail(false)}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  // Full badge variant
  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setShowDetail(!showDetail)}
        className={cn(
          "flex items-center gap-2 rounded-xl border px-3 py-2 w-full text-left",
          "transition-all cursor-pointer",
          "hover:shadow-sm",
          firstActive.status === "active"
            ? "border-emerald-200 bg-emerald-50/50"
            : "border-amber-200 bg-amber-50/50",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
            config.bgColor,
          )}
        >
          <StatusIcon className={cn("h-4 w-4", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {firstActive.sequence?.name ?? "Sequence de relance"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">
              Étape {firstActive.current_step}/{totalSteps}
            </span>
            {nextStepLabel && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {nextStepLabel}
              </span>
            )}
          </div>
        </div>
        {activeEnrollments.length > 1 && (
          <Badge variant="secondary" className="text-[10px]">
            +{activeEnrollments.length - 1}
          </Badge>
        )}
      </button>

      {showDetail && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetail(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-surface p-3 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground">
                Sequences de relance
              </p>
              <button
                type="button"
                onClick={() => setShowDetail(false)}
                className="p-0.5 rounded hover:bg-secondary text-muted-foreground cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <EnrollmentDetail
              contactId={contactId}
              onClose={() => setShowDetail(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Enroll Contact Button ───────────────────────────────

interface EnrollContactButtonProps {
  contactId: string;
  className?: string;
}

export function EnrollContactButton({
  contactId,
  className,
}: EnrollContactButtonProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Tooltip content="Inscrire a une sequence de relance">
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5", className)}
          onClick={() => setShowModal(true)}
          icon={<Zap className="h-3.5 w-3.5" />}
        >
          Relance
        </Button>
      </Tooltip>

      {showModal && (
        <EnrollContactModal
          contactId={contactId}
          open={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ─── Enrollment Modal ────────────────────────────────────

import { Modal } from "@/components/ui/modal";
import { useRelanceSequences, useEnrollContact } from "@/hooks/use-relance";

interface EnrollContactModalProps {
  contactId: string;
  open: boolean;
  onClose: () => void;
}

function EnrollContactModal({
  contactId,
  open,
  onClose,
}: EnrollContactModalProps) {
  const { data: sequences, isLoading } = useRelanceSequences();
  const enrollContact = useEnrollContact();
  const { data: existingEnrollments } = useContactEnrollments(contactId);

  const activeSequences = sequences?.filter((s) => s.is_active) ?? [];
  const enrolledSequenceIds = new Set(
    existingEnrollments
      ?.filter((e) => e.status === "active" || e.status === "paused")
      .map((e) => e.sequence_id) ?? [],
  );

  const handleEnroll = (sequenceId: string) => {
    enrollContact.mutate(
      { contact_id: contactId, sequence_id: sequenceId },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Inscrire a une sequence"
      description="Choisissez une sequence de relance pour ce contact"
      size="md"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : activeSequences.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucune sequence active disponible.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Creez une sequence de relance d'abord.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activeSequences.map((seq) => {
            const isEnrolled = enrolledSequenceIds.has(seq.id);

            return (
              <button
                key={seq.id}
                type="button"
                disabled={isEnrolled || enrollContact.isPending}
                onClick={() => handleEnroll(seq.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left",
                  "transition-all",
                  isEnrolled
                    ? "border-border/50 bg-muted/30 opacity-60 cursor-not-allowed"
                    : "border-border bg-surface hover:border-primary/30 hover:shadow-sm cursor-pointer",
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {seq.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">
                      {seq.step_count} étape
                      {(seq.step_count ?? 0) !== 1 ? "s" : ""}
                    </span>
                    {seq.description && (
                      <span className="text-[11px] text-muted-foreground truncate">
                        — {seq.description}
                      </span>
                    )}
                  </div>
                </div>
                {isEnrolled && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Deja inscrit
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
