"use client";

import { useState } from "react";
import { useExerciseSubmissions, useSubmitExercise } from "@/hooks/use-quizzes";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import type { ExerciseSubmission } from "@/types/quiz";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Paperclip,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  X,
  Star,
  MessageSquare,
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
    label: "Soumis",
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

interface AssignmentSubmissionProps {
  lessonId: string;
  instructions?: string;
  onComplete?: () => void;
}

export function AssignmentSubmission({
  lessonId,
  instructions,
  onComplete,
}: AssignmentSubmissionProps) {
  const { user } = useAuth();
  const supabase = useSupabase();
  const { data: submissions, isLoading } = useExerciseSubmissions(
    lessonId,
    user?.id,
  );
  const submitExercise = useSubmitExercise();

  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<
    { name: string; url: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const latestSubmission = submissions?.[0];
  const canSubmit =
    !latestSubmission || latestSubmission.status === "revision_requested";
  const isReviewed = latestSubmission?.status === "reviewed";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} depasse la limite de 10 Mo`);
          continue;
        }

        const ext = file.name.split(".").pop();
        const path = `exercises/${user.id}/${lessonId}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("attachments")
          .upload(path, file);
        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("attachments")
          .getPublicUrl(path);

        setAttachments((prev) => [
          ...prev,
          { name: file.name, url: urlData.publicUrl },
        ]);
      }
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Veuillez saisir votre reponse");
      return;
    }

    try {
      await submitExercise.mutateAsync({
        lesson_id: lessonId,
        content,
        attachments,
      });
      toast.success("Exercice soumis avec succes !");
      setContent("");
      setAttachments([]);
      onComplete?.();
    } catch {
      toast.error("Erreur lors de la soumission");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      {instructions && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Instructions
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {instructions}
          </p>
        </div>
      )}

      {/* Previous submission with feedback */}
      {latestSubmission && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h4 className="text-sm font-semibold text-foreground">
              Derniere soumission
            </h4>
            {(() => {
              const cfg = STATUS_CONFIG[latestSubmission.status];
              const Icon = cfg.icon;
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    cfg.color,
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              );
            })()}
          </div>

          <div className="p-4 space-y-3">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {latestSubmission.content}
            </p>

            {latestSubmission.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(
                  latestSubmission.attachments as {
                    name: string;
                    url: string;
                  }[]
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

            {/* Coach feedback */}
            {latestSubmission.coach_feedback && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Retour du coach
                  </span>
                  {latestSubmission.grade !== null && (
                    <span className="inline-flex items-center gap-1 ml-auto text-xs font-medium text-amber-600">
                      <Star className="w-3 h-3" />
                      {latestSubmission.grade}/100
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {latestSubmission.coach_feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submission form */}
      {canSubmit && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            {latestSubmission?.status === "revision_requested" ? (
              <>
                <RotateCcw className="w-4 h-4 text-amber-500" />
                Soumettre une revision
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-primary" />
                Votre reponse
              </>
            )}
          </h4>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Redigez votre reponse ici..."
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachments.map((att, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-lg text-xs text-foreground"
                >
                  <Paperclip className="w-3 h-3" />
                  {att.name}
                  <button
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="ml-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="h-9 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              {uploading ? "Upload..." : "Joindre un fichier"}
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <div className="flex-1" />
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitExercise.isPending}
              className="h-9 px-5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {submitExercise.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Soumettre
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {isReviewed &&
        latestSubmission.grade !== null &&
        latestSubmission.grade >= 50 && (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Exercice valide !
              </p>
              <p className="text-xs text-emerald-600/80">
                Note : {latestSubmission.grade}/100
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
