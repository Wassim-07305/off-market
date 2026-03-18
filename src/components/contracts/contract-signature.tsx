"use client";

import { useState } from "react";
import { CheckCircle, PenLine, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContractSignatureProps {
  contractContent: string;
  onSign: (signatureData: {
    signer_name: string;
    method: "typed";
  }) => Promise<void>;
  isSigning?: boolean;
}

/**
 * Composant de signature de contrat avec:
 * - Affichage du contenu du contrat
 * - Checkbox d'acceptation des conditions
 * - Champ de signature textuelle (nom complet)
 * - Bouton de signature
 */
export function ContractSignature({
  contractContent,
  onSign,
  isSigning = false,
}: ContractSignatureProps) {
  const [accepted, setAccepted] = useState(false);
  const [signerName, setSignerName] = useState("");

  const canSign = accepted && signerName.trim().length >= 3 && !isSigning;

  const handleSign = async () => {
    if (!canSign) return;
    await onSign({
      signer_name: signerName.trim(),
      method: "typed",
    });
  };

  return (
    <div className="space-y-6">
      {/* Contenu du contrat */}
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 max-h-[60vh] overflow-y-auto">
        <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed font-mono">
          {contractContent}
        </div>
      </div>

      {/* Zone de signature */}
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <PenLine className="w-4 h-4 text-primary" />
          Signature electronique
        </h3>

        {/* Checkbox acceptation */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="mt-0.5">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                accepted
                  ? "bg-primary border-primary"
                  : "border-border group-hover:border-primary/50",
              )}
            >
              {accepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <span className="text-sm text-foreground/70 leading-relaxed">
            J&apos;ai lu et j&apos;accepte les conditions du contrat
            d&apos;accompagnement Off-Market ci-dessus.
          </span>
        </label>

        {/* Champ nom complet */}
        <div>
          <label
            htmlFor="signer-name"
            className="block text-xs font-medium text-muted-foreground mb-1.5"
          >
            Tapez votre nom complet pour signer
          </label>
          <input
            id="signer-name"
            type="text"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder="Prenom Nom"
            disabled={!accepted || isSigning}
            className={cn(
              "w-full h-12 px-4 rounded-xl border text-base transition-all",
              "bg-background border-border text-foreground placeholder:text-muted-foreground/50",
              "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              signerName.trim().length >= 3 &&
                accepted &&
                "font-semibold italic text-lg",
            )}
          />
          {signerName.trim().length > 0 && signerName.trim().length < 3 && (
            <p className="text-xs text-amber-500 mt-1">
              Minimum 3 caracteres requis
            </p>
          )}
        </div>

        {/* Bouton signer */}
        <button
          onClick={handleSign}
          disabled={!canSign}
          className={cn(
            "w-full h-12 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
            canSign
              ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
              : "bg-muted text-muted-foreground cursor-not-allowed",
          )}
        >
          {isSigning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signature en cours...
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" />
              Signer le contrat
            </>
          )}
        </button>

        <p className="text-[11px] text-muted-foreground/60 text-center">
          En signant, vous acceptez les termes du contrat. Votre signature
          electronique a la meme valeur juridique qu&apos;une signature
          manuscrite.
        </p>
      </div>
    </div>
  );
}
