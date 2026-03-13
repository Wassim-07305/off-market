"use client";

import { useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MessageSquareText,
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Target,
} from "lucide-react";

interface PreCallQuestionsProps {
  callId: string;
  onCompleted: () => void;
  existingAnswers?: { objective: string; tried_solutions: string } | null;
}

export function PreCallQuestions({
  callId,
  onCompleted,
  existingAnswers,
}: PreCallQuestionsProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [objective, setObjective] = useState(existingAnswers?.objective ?? "");
  const [triedSolutions, setTriedSolutions] = useState(
    existingAnswers?.tried_solutions ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(!!existingAnswers);

  const canSubmit =
    objective.trim().length >= 10 && triedSolutions.trim().length >= 10;

  const handleSubmit = async () => {
    if (!canSubmit || !user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("pre_call_answers").upsert(
        {
          call_id: callId,
          user_id: user.id,
          objective: objective.trim(),
          tried_solutions: triedSolutions.trim(),
        },
        { onConflict: "call_id,user_id" },
      );

      if (error) throw error;

      setIsCompleted(true);
      toast.success("Reponses enregistrees !");
      onCompleted();
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Questions pre-appel completees
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Votre coach pourra preparer l&apos;appel en avance
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6 space-y-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquareText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Preparez votre appel
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Repondez a ces 2 questions pour que votre coach puisse preparer la
            seance. Vous ne pourrez pas rejoindre l&apos;appel tant que les
            reponses ne sont pas envoyees.
          </p>
        </div>
      </div>

      {/* Question 1: Objective */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Target className="w-4 h-4 text-amber-500" />
          Quel est l&apos;objectif de cet appel ?
        </label>
        <p className="text-[11px] text-muted-foreground -mt-1">
          Quel probleme voulez-vous resoudre ou quel sujet souhaitez-vous
          aborder ?
        </p>
        <textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Ex: Je n'arrive pas à trouver de clients sur LinkedIn malgré 50 DMs par jour..."
          rows={3}
          className={cn(
            "w-full px-4 py-3 bg-muted/50 border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-colors",
            objective.trim().length >= 10
              ? "border-emerald-500/30"
              : "border-border",
          )}
        />
        <div className="flex justify-end">
          <span
            className={cn(
              "text-[10px]",
              objective.trim().length >= 10
                ? "text-emerald-500"
                : "text-muted-foreground",
            )}
          >
            {objective.trim().length}/10 caracteres min.
          </span>
        </div>
      </div>

      {/* Question 2: Tried Solutions */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Lightbulb className="w-4 h-4 text-blue-500" />
          Qu&apos;avez-vous deja essaye ?
        </label>
        <p className="text-[11px] text-muted-foreground -mt-1">
          Quelles solutions ou actions avez-vous tentees pour resoudre ce
          probleme ?
        </p>
        <textarea
          value={triedSolutions}
          onChange={(e) => setTriedSolutions(e.target.value)}
          placeholder="Ex: J'ai essayé de changer mon accroche, de cibler un autre avatar, d'augmenter le volume..."
          rows={3}
          className={cn(
            "w-full px-4 py-3 bg-muted/50 border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-colors",
            triedSolutions.trim().length >= 10
              ? "border-emerald-500/30"
              : "border-border",
          )}
        />
        <div className="flex justify-end">
          <span
            className={cn(
              "text-[10px]",
              triedSolutions.trim().length >= 10
                ? "text-emerald-500"
                : "text-muted-foreground",
            )}
          >
            {triedSolutions.trim().length}/10 caracteres min.
          </span>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || isSubmitting}
        className={cn(
          "w-full h-11 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
          canSubmit
            ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed",
        )}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {isSubmitting ? "Envoi en cours..." : "Envoyer mes reponses"}
      </button>
    </div>
  );
}
