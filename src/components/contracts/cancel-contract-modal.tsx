"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

interface CancelContractModalProps {
  contractTitle: string;
  onCancel: (reason: string) => void;
  onClose: () => void;
  isPending: boolean;
}

const CANCEL_REASONS = [
  "Le client ne souhaite plus poursuivre",
  "Conditions modifiees — nouveau contrat a creer",
  "Erreur dans le contrat",
  "Delai depasse",
  "Autre (preciser ci-dessous)",
];

export function CancelContractModal({
  contractTitle,
  onCancel,
  onClose,
  isPending,
}: CancelContractModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const isOther = selectedReason === CANCEL_REASONS[CANCEL_REASONS.length - 1];
  const finalReason = isOther ? customReason : selectedReason;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Annuler le contrat
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {contractTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Cette action est irreversible. Veuillez indiquer le motif
            d&apos;annulation :
          </p>

          <div className="space-y-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                  selectedReason === reason
                    ? "border-red-500 bg-red-500/5 text-foreground"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          {isOther && (
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Precisez le motif..."
              rows={3}
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Retour
          </button>
          <button
            onClick={() => onCancel(finalReason)}
            disabled={!finalReason.trim() || isPending}
            className="h-10 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Annulation..." : "Confirmer l'annulation"}
          </button>
        </div>
      </div>
    </div>
  );
}
