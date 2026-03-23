"use client";

import { useState } from "react";
import { Bot, ShieldCheck, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AiConsentScope } from "@/types/database";

interface AiConsentModalProps {
  onAccept: (scopes: AiConsentScope[]) => void;
  onDismiss?: () => void;
  isAccepting: boolean;
}

const SCOPE_OPTIONS: {
  value: AiConsentScope;
  label: string;
  description: string;
}[] = [
  {
    value: "chat_analysis",
    label: "Analyse des conversations",
    description: "Analyse tes echanges pour ameliorer le suivi coaching",
  },
  {
    value: "risk_scoring",
    label: "Detection des risques",
    description: "Identifie les eleves à risque de decrochage",
  },
  {
    value: "report_generation",
    label: "Generation de rapports",
    description: "Rapports hebdomadaires et mensuels automatiques",
  },
  {
    value: "content_suggestions",
    label: "Suggestions de contenu",
    description: "Recommandations de contenu et plans d'action",
  },
];

/**
 * Modal de consentement IA avec selection granulaire des scopes.
 * Affichee avant la première utilisation de l'assistant IA.
 */
export function AiConsentModal({
  onAccept,
  onDismiss,
  isAccepting,
}: AiConsentModalProps) {
  const [selectedScopes, setSelectedScopes] = useState<AiConsentScope[]>(
    SCOPE_OPTIONS.map((o) => o.value),
  );

  const toggleScope = (scope: AiConsentScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleAccept = () => {
    onAccept(selectedScopes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 space-y-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-display font-semibold text-foreground">
              Utilisation de l'Intelligence Artificielle
            </h3>
            <p className="text-xs text-muted-foreground">
              Consentement requis avant utilisation
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground leading-relaxed">
          Off Market utilise l'intelligence artificielle pour ameliorer ton
          accompagnement. Choisis les fonctionnalites IA que tu souhaites
          activer :
        </p>

        {/* Scope checkboxes */}
        <div className="space-y-2">
          {SCOPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                selectedScopes.includes(option.value)
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-border bg-transparent hover:bg-muted/30",
              )}
            >
              <input
                type="checkbox"
                checked={selectedScopes.includes(option.value)}
                onChange={() => toggleScope(option.value)}
                className="mt-0.5 accent-[#DC2626] w-4 h-4 shrink-0"
              />
              <div>
                <span className="text-sm font-medium text-foreground">
                  {option.label}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tes donnees sont traitees de maniere securisee et ne sont{" "}
            <strong className="text-foreground">
              jamais partagees avec des tiers
            </strong>
            . Tu peux retirer ton consentement a tout moment dans les Reglages.{" "}
            <a
              href="/legal/privacy"
              className="inline-flex items-center gap-0.5 text-primary hover:underline"
            >
              Politique de confidentialite
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="h-10 px-5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Pas maintenant
            </button>
          )}
          <button
            onClick={handleAccept}
            disabled={isAccepting || selectedScopes.length === 0}
            className={cn(
              "h-10 px-6 rounded-xl bg-[#DC2626] text-white text-sm font-medium",
              "hover:bg-[#B91C1C] transition-all active:scale-[0.98]",
              (isAccepting || selectedScopes.length === 0) &&
                "opacity-50 cursor-not-allowed",
            )}
          >
            {isAccepting ? "Enregistrement..." : "J'accepte"}
          </button>
        </div>
      </div>
    </div>
  );
}
