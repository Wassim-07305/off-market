"use client";

import { useState } from "react";
import {
  usePreCallResponses,
  useSubmitPreCallResponse,
} from "@/hooks/use-pre-call-questions";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  MessageSquareText,
  Send,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Target,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

interface PreCallQuestionsProps {
  callId: string;
  callTitle?: string;
  /** Called after the user submits answers or clicks "continue" when already answered */
  onCompleted: () => void;
  /** Legacy prop — ignored, the hook handles fetching */
  existingAnswers?: { objective: string; tried_solutions: string } | null;
}

/**
 * Gate component: forces the student/client to answer 2 mandatory pre-call
 * questions before they can join a coaching call.
 * Staff/coaches/admins bypass this gate automatically.
 */
export function PreCallQuestions({
  callId,
  callTitle,
  onCompleted,
}: PreCallQuestionsProps) {
  const { isStaff } = useAuth();
  const { myResponse, hasAnswered, isLoading } = usePreCallResponses(callId);
  const submitMutation = useSubmitPreCallResponse();

  const [objective, setObjective] = useState("");
  const [triedSolutions, setTriedSolutions] = useState("");

  // Staff/coaches/admins skip the questionnaire entirely
  if (isStaff) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-zinc-400 animate-spin" />
      </div>
    );
  }

  // Already answered -> show confirmation and "continue" button
  if (hasAnswered && myResponse) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">
            Preparation confirmee
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Vos reponses ont ete enregistrees pour cet appel
          </p>
        </div>

        <div className="bg-zinc-900/80 rounded-2xl border border-white/5 p-5 space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-1">
              <Target className="w-3 h-3" />
              Objectif de l&apos;appel
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {myResponse.objective}
            </p>
          </div>
          <div className="border-t border-white/5 pt-4">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-1">
              <Lightbulb className="w-3 h-3" />
              Solutions deja essayees
            </span>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {myResponse.tried_solutions}
            </p>
          </div>
        </div>

        <button
          onClick={onCompleted}
          className="w-full h-12 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Continuer vers l&apos;appel
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Not yet answered -> show the mandatory form
  const canSubmit =
    objective.trim().length >= 10 &&
    triedSolutions.trim().length >= 10 &&
    !submitMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    await submitMutation.mutateAsync({
      callId,
      objective: objective.trim(),
      triedSolutions: triedSolutions.trim(),
    });

    onCompleted();
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MessageSquareText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Preparez votre appel
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Repondez a ces 2 questions pour que votre coach puisse preparer la
            seance. Vous ne pourrez pas rejoindre l&apos;appel tant que les
            reponses ne sont pas envoyees.
          </p>
          {callTitle && (
            <p className="text-xs text-zinc-500 mt-1">{callTitle}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Question 1: Objective */}
        <div className="bg-zinc-900/80 rounded-2xl border border-white/5 p-5 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            <Target className="w-4 h-4 text-amber-500" />
            Quel est l&apos;objectif de cet appel / quel probleme veux-tu
            resoudre ?<span className="text-red-400">*</span>
          </label>
          <p className="text-[11px] text-zinc-500">
            Quel probleme voulez-vous resoudre ou quel sujet souhaitez-vous
            aborder ?
          </p>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ex: Je n'arrive pas a trouver de clients sur LinkedIn malgre 50 DMs par jour..."
            required
            rows={3}
            className={cn(
              "w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-colors",
              objective.trim().length >= 10
                ? "border-emerald-500/30"
                : "border-white/5",
            )}
          />
          <div className="flex justify-end">
            <span
              className={cn(
                "text-[10px]",
                objective.trim().length >= 10
                  ? "text-emerald-500"
                  : "text-zinc-600",
              )}
            >
              {objective.trim().length}/10 caracteres min.
            </span>
          </div>
        </div>

        {/* Question 2: Tried Solutions */}
        <div className="bg-zinc-900/80 rounded-2xl border border-white/5 p-5 space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            Quelle solution as-tu deja essayee ?
            <span className="text-red-400">*</span>
          </label>
          <p className="text-[11px] text-zinc-500">
            Quelles solutions ou actions avez-vous tentees pour resoudre ce
            probleme ?
          </p>
          <textarea
            value={triedSolutions}
            onChange={(e) => setTriedSolutions(e.target.value)}
            placeholder="Ex: J'ai essaye de changer mon accroche, de cibler un autre avatar, d'augmenter le volume..."
            required
            rows={3}
            className={cn(
              "w-full px-4 py-3 bg-zinc-800/50 border rounded-xl text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-colors",
              triedSolutions.trim().length >= 10
                ? "border-emerald-500/30"
                : "border-white/5",
            )}
          />
          <div className="flex justify-end">
            <span
              className={cn(
                "text-[10px]",
                triedSolutions.trim().length >= 10
                  ? "text-emerald-500"
                  : "text-zinc-600",
              )}
            >
              {triedSolutions.trim().length}/10 caracteres min.
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "w-full h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
            canSubmit
              ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
          )}
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Envoyer mes reponses
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------
 * PreCallResponsesView — read-only view for coaches/admins
 * Displayed in the session notes panel or video room sidebar
 * ----------------------------------------------------------------- */

interface PreCallResponsesViewProps {
  callId: string;
  className?: string;
}

/**
 * Read-only card showing the client's pre-call answers.
 * Intended for coaches/admins viewing the call.
 */
export function PreCallResponsesView({
  callId,
  className,
}: PreCallResponsesViewProps) {
  const { responses, isLoading } = usePreCallResponses(callId);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 py-3", className)}>
        <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
        <span className="text-xs text-zinc-500">Chargement...</span>
      </div>
    );
  }

  const clientResponses = responses.filter(
    (r) => r.objective && r.tried_solutions,
  );

  if (clientResponses.length === 0) {
    return (
      <div className={cn("bg-zinc-800/30 rounded-xl p-4", className)}>
        <p className="text-xs text-zinc-500 italic flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" />
          Aucune reponse pre-appel soumise
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {clientResponses.map((response) => (
        <div
          key={response.id}
          className="bg-zinc-800/50 rounded-xl border border-white/5 p-4 space-y-3"
        >
          <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            Reponses pre-appel du client
          </h4>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-0.5">
              <Target className="w-3 h-3" />
              Objectif
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {response.objective}
            </p>
          </div>

          <div className="border-t border-white/5 pt-3">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1 mb-0.5">
              <Lightbulb className="w-3 h-3" />
              Solutions deja essayees
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {response.tried_solutions}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
