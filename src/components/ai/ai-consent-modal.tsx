"use client";

import { Bot, ShieldCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiConsentModalProps {
  onAccept: () => void;
  isAccepting: boolean;
}

/**
 * Modal de consentement IA (F46.2).
 * Affichee avant la premiere utilisation de l'assistant IA.
 */
export function AiConsentModal({ onAccept, isAccepting }: AiConsentModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 space-y-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-display font-semibold text-foreground">
              Assistant IA
            </h3>
            <p className="text-xs text-muted-foreground">
              Consentement requis avant utilisation
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Off Market utilise l'intelligence artificielle (Claude) pour
            ameliorer ton accompagnement coaching :
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Analyse de la progression de tes eleves
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Suggestions de contenu et plans d'action
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              Reponses automatiques aux questions frequentes
            </li>
          </ul>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tes donnees sont traitees de maniere securisee et ne sont{" "}
            <strong className="text-foreground">
              jamais partagees avec des tiers
            </strong>
            . Tu peux retirer ton consentement a tout moment dans les Reglages.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            onClick={onAccept}
            disabled={isAccepting}
            className={cn(
              "h-10 px-6 rounded-xl bg-primary text-white text-sm font-medium",
              "hover:bg-primary-hover transition-all active:scale-[0.98]",
              isAccepting && "opacity-50 cursor-not-allowed",
            )}
          >
            {isAccepting
              ? "Enregistrement..."
              : "J'accepte l'utilisation de l'IA"}
          </button>
        </div>
      </div>
    </div>
  );
}
