"use client";

import { useState } from "react";
import { useExerciseSubmissions, useReviewExercise } from "@/hooks/use-quizzes";
import type { ExerciseSubmission, SubmissionStatus } from "@/types/quiz";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Loader2,
  Paperclip,
  Star,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: typeof Clock }
> = {
  draft: {
    label: "Brouillon",
    color: "text-muted-foreground bg-muted/50",
    icon: FileText,
  },
  submitted: {
    label: "En attente",
    color: "text-amber-600 bg-amber-500/10",
    icon: Clock,
  },
  reviewed: {
    label: "Corrige",
    color: "text-emerald-600 bg-emerald-500/10",
    icon: CheckCircle,
  },
  revision_requested: {
    label: "Revision demandee",
    color: "text-red-600 bg-red-500/10",
    icon: AlertCircle,
  },
};

interface ExerciseReviewProps {
  lessonId: string;
  lessonTitle?: string;
}

function ReviewCard({
  submission,
  lessonId,
}: {
  submission: ExerciseSubmission;
  lessonId: string;
}) {
  const reviewExercise = useReviewExercise();
  const [expanded, setExpanded] = useState(submission.status === "submitted");
  const [feedback, setFeedback] = useState(submission.coach_feedback ?? "");
  const [grade, setGrade] = useState<string>(
    submission.grade !== null ? String(submission.grade) : "",
  );
  const [action, setAction] = useState<SubmissionStatus | "">(
    submission.status === "submitted" ? "" : submission.status,
  );

  const handleReview = async (status: SubmissionStatus) => {
    if (status === "reviewed" && !grade) {
      toast.error("Veuillez attribuer une note");
      return;
    }

    try {
      await reviewExercise.mutateAsync({
        id: submission.id,
        lesson_id: lessonId,
        status,
        coach_feedback: feedback || undefined,
        grade: grade ? Number(grade) : undefined,
      });
      toast.success(
        status === "reviewed" ? "Exercice corrige !" : "Revision demandee",
      );
    } catch {
      toast.error("Erreur lors de la correction");
    }
  };

  const statusCfg = STATUS_CONFIG[submission.status];
  const StatusIcon = statusCfg.icon;
  const submittedDate = new Date(submission.submitted_at).toLocaleDateString(
    "fr-FR",
    {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {submission.student_id.slice(0, 8)}...
          </p>
          <p className="text-[10px] text-muted-foreground">{submittedDate}</p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
            statusCfg.color,
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {statusCfg.label}
        </span>
        {submission.grade !== null && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            <Star className="w-3 h-3" />
            {submission.grade}/100
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {/* Student's response */}
          <div>
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Reponse de l&apos;eleve
            </h5>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {submission.content}
              </p>
            </div>
          </div>

          {/* Attachments */}
          {submission.attachments &&
            (submission.attachments as { name: string; url: string }[]).length >
              0 && (
              <div className="flex flex-wrap gap-2">
                {(
                  submission.attachments as { name: string; url: string }[]
                ).map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    {att.name}
                  </a>
                ))}
              </div>
            )}

          {/* Review form (only for submitted or revision_requested) */}
          {(submission.status === "submitted" ||
            submission.status === "revision_requested") && (
            <div className="pt-3 border-t border-border/50 space-y-3">
              <h5 className="text-xs font-semibold text-foreground">
                Correction
              </h5>

              {/* Grade */}
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground w-12">
                  Note
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="—"
                    className="w-16 h-8 px-2 bg-muted/50 rounded-lg text-sm text-center text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>

              {/* Feedback */}
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Feedback pour l'eleve..."
                className="w-full px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview("revision_requested")}
                  disabled={reviewExercise.isPending}
                  className="h-8 px-3 rounded-lg border border-amber-500/30 text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3 h-3" />
                  Demander revision
                </button>
                <button
                  onClick={() => handleReview("reviewed")}
                  disabled={reviewExercise.isPending || !grade}
                  className="h-8 px-4 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {reviewExercise.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3 h-3" />
                  )}
                  Valider la correction
                </button>
              </div>
            </div>
          )}

          {/* Already reviewed */}
          {submission.status === "reviewed" && submission.coach_feedback && (
            <div className="pt-3 border-t border-border/50">
              <h5 className="text-xs font-semibold text-foreground mb-2">
                Votre feedback
              </h5>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {submission.coach_feedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExerciseReview({ lessonId, lessonTitle }: ExerciseReviewProps) {
  const { data: submissions, isLoading } = useExerciseSubmissions(lessonId);
  const [filter, setFilter] = useState<"all" | "submitted" | "reviewed">("all");

  const filtered =
    submissions?.filter((s) => {
      if (filter === "all") return true;
      if (filter === "submitted")
        return s.status === "submitted" || s.status === "revision_requested";
      return s.status === "reviewed";
    }) ?? [];

  const pendingCount =
    submissions?.filter((s) => s.status === "submitted").length ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Soumissions {lessonTitle && `— ${lessonTitle}`}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {submissions?.length ?? 0} soumission
            {(submissions?.length ?? 0) > 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="text-amber-600 font-medium">
                {" "}
                · {pendingCount} en attente
              </span>
            )}
          </p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-border">
          {(
            [
              { key: "all", label: "Tous" },
              { key: "submitted", label: "En attente" },
              { key: "reviewed", label: "Corriges" },
            ] as const
          ).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-7 px-2.5 text-[10px] font-medium transition-colors",
                filter === f.key
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune soumission</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((submission) => (
            <ReviewCard
              key={submission.id}
              submission={submission}
              lessonId={lessonId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
