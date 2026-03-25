"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DOMPurify from "dompurify";
import {
  FileSignature,
  CheckCircle2,
  ArrowRight,
  Loader2,
  X,
  MapPin,
  User,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useContract, useContracts } from "@/hooks/use-contracts";
import { SignaturePad } from "@/components/contracts/signature-pad";

// ─── Schema de validation ─────────────────────────────────
const signatureSchema = z.object({
  signer_name: z.string().min(2, "Nom requis"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(3, "Ville requise"),
  lu_et_approuve: z.literal(true, {
    message: "Vous devez accepter",
  }),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

type Phase = "loading" | "reading" | "signing" | "signed";

// ─── Sous-composant : Contenu du contrat ──────────────────
// Le HTML est sanitise via DOMPurify avant rendu — pas de risque XSS
function ContractContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return (
    <div
      className="prose prose-invert prose-sm max-w-none rounded-xl border border-white/10 bg-white/[0.03] p-6 max-h-[50vh] overflow-y-auto"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

// ─── Sous-composant : Formulaire de signature ─────────────
function SigningForm({
  defaultName,
  onSubmit,
  isPending,
}: {
  defaultName: string;
  onSubmit: (data: SignatureFormData, signatureImage: string) => void;
  isPending: boolean;
}) {
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signer_name: defaultName,
      address: "",
      city: "",
      lu_et_approuve: undefined as unknown as true,
    },
    mode: "onChange",
  });

  const luEtApprouve = watch("lu_et_approuve");

  const handleFormSubmit = (data: SignatureFormData) => {
    if (!signatureImage) return;
    onSubmit(data, signatureImage);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Nom complet */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
          <User className="w-4 h-4 text-primary" />
          Nom complet
        </label>
        <input
          {...register("signer_name")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary"
          placeholder="Votre nom complet"
        />
        {errors.signer_name && (
          <p className="mt-1.5 text-xs text-red-400">
            {errors.signer_name.message}
          </p>
        )}
      </div>

      {/* Adresse */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          Adresse
        </label>
        <input
          {...register("address")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary"
          placeholder="Votre adresse postale"
        />
        {errors.address && (
          <p className="mt-1.5 text-xs text-red-400">
            {errors.address.message}
          </p>
        )}
      </div>

      {/* Ville */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
          <Building2 className="w-4 h-4 text-primary" />
          Ville
        </label>
        <input
          {...register("city")}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-primary"
          placeholder="Votre ville"
        />
        {errors.city && (
          <p className="mt-1.5 text-xs text-red-400">{errors.city.message}</p>
        )}
      </div>

      {/* Signature pad */}
      <div>
        <label className="text-sm font-medium text-white/70 mb-2 block">
          Votre signature
        </label>
        <SignaturePad
          onSign={(dataUrl) => setSignatureImage(dataUrl)}
          onCancel={() => setSignatureImage(null)}
          disabled={isPending}
        />
        {signatureImage && (
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Signature enregistree
          </p>
        )}
      </div>

      {/* Lu et approuve */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={luEtApprouve === true}
          onChange={(e) =>
            setValue("lu_et_approuve", e.target.checked as unknown as true, {
              shouldValidate: true,
            })
          }
          className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-primary accent-primary"
        />
        <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
          J&apos;ai lu et j&apos;approuve les termes du contrat ci-dessus
        </span>
      </label>
      {errors.lu_et_approuve && (
        <p className="text-xs text-red-400">{errors.lu_et_approuve.message}</p>
      )}

      {/* Bouton signer */}
      <button
        type="submit"
        disabled={!isValid || !signatureImage || isPending}
        className={cn(
          "w-full flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 text-base font-semibold text-white transition-all duration-200",
          isValid && signatureImage && !isPending
            ? "bg-gradient-to-r from-primary to-red-500 shadow-lg shadow-red-500/25 hover:scale-[1.02] hover:shadow-xl"
            : "bg-white/10 cursor-not-allowed opacity-50",
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Signature en cours...
          </>
        ) : (
          <>
            <FileSignature className="h-5 w-5" />
            Signer le contrat
          </>
        )}
      </button>
    </form>
  );
}

// ─── Composant principal ──────────────────────────────────
interface ContractSignStepProps {
  onComplete: () => void;
}

export function ContractSignStep({ onComplete }: ContractSignStepProps) {
  const { profile } = useAuth();
  const { signContract } = useContracts();

  const [phase, setPhase] = useState<Phase>("loading");
  const [contractId, setContractId] = useState<string | null>(null);
  const [signedFormData, setSignedFormData] =
    useState<SignatureFormData | null>(null);
  const [signedImage, setSignedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger le contrat au mount
  const contractQuery = useContract(contractId ?? "");

  const generateContract = useCallback(async () => {
    try {
      const res = await fetch("/api/contracts/auto-generate", {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.contract_id) {
        setError(json.error ?? "Impossible de generer le contrat");
        return;
      }
      setContractId(json.contract_id);
    } catch {
      setError("Erreur de connexion au serveur");
    }
  }, []);

  useEffect(() => {
    generateContract();
  }, [generateContract]);

  // Transition loading -> reading quand le contrat est charge
  useEffect(() => {
    if (contractQuery.data && phase === "loading") {
      setPhase("reading");
    }
  }, [contractQuery.data, phase]);

  // Confettis quand on passe en phase signed
  useEffect(() => {
    if (phase !== "signed") return;
    let cancelled = false;
    import("canvas-confetti").then((mod) => {
      if (cancelled) return;
      const confetti = mod.default;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#DC2626", "#F59E0B", "#10B981", "#FFFFFF"],
      });
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  const handleSign = (data: SignatureFormData, signatureImage: string) => {
    if (!contractId) return;

    signContract.mutate(
      {
        id: contractId,
        signatureData: {
          ip_address: "client-side",
          user_agent: navigator.userAgent,
          signer_name: data.signer_name,
        },
        signatureImage,
      },
      {
        onSuccess: () => {
          setSignedFormData(data);
          setSignedImage(signatureImage);
          setPhase("signed");
        },
      },
    );
  };

  const contract = contractQuery.data;

  // ─── Phase : loading ──────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        {error ? (
          <>
            <p className="text-red-400 text-sm text-center">{error}</p>
            <button
              onClick={() => {
                setError(null);
                generateContract();
              }}
              className="text-sm text-primary underline hover:text-primary/80"
            >
              Reessayer
            </button>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            <p className="text-sm text-white/40">
              Preparation de votre contrat...
            </p>
          </>
        )}
      </div>
    );
  }

  if (!contract) return null;

  // ─── Phase : reading ──────────────────────────
  if (phase === "reading") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-primary/20 border border-amber-500/30 px-4 py-1.5 mb-4">
            <FileSignature className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">
              Contrat d&apos;accompagnement
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {contract.title}
          </h2>
          <p className="text-sm text-white/50">
            Lis attentivement le contrat ci-dessous avant de le signer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ContractContent html={contract.content} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <button
            onClick={() => setPhase("signing")}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-500 px-6 py-4 text-base font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/40"
          >
            <FileSignature className="h-5 w-5" />
            Signer ce contrat
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ─── Phase : signing ──────────────────────────
  if (phase === "signing") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Signer le contrat
          </h2>
          <button
            onClick={() => setPhase("reading")}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Retour au contrat"
          >
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <SigningForm
          defaultName={profile?.full_name ?? ""}
          onSubmit={handleSign}
          isPending={signContract.isPending}
        />
      </motion.div>
    );
  }

  // ─── Phase : signed ───────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Succes header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Contrat signe !
        </h2>
        <p className="text-sm text-white/50">
          Votre contrat a ete signe avec succes. Bienvenue dans
          l&apos;aventure !
        </p>
      </motion.div>

      {/* Contenu du contrat signe */}
      <ContractContent html={contract.content} />

      {/* Infos de signature */}
      <AnimatePresence>
        {signedFormData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3"
          >
            <h3 className="text-sm font-semibold text-emerald-400">
              Informations de signature
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-white/40">Nom :</span>{" "}
                <span className="text-white">
                  {signedFormData.signer_name}
                </span>
              </div>
              <div>
                <span className="text-white/40">Date :</span>{" "}
                <span className="text-white">
                  {new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }).format(new Date())}
                </span>
              </div>
              <div>
                <span className="text-white/40">Adresse :</span>{" "}
                <span className="text-white">{signedFormData.address}</span>
              </div>
              <div>
                <span className="text-white/40">Ville :</span>{" "}
                <span className="text-white">{signedFormData.city}</span>
              </div>
            </div>
            {signedImage && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs text-white/40 block mb-2">
                  Signature :
                </span>
                <img
                  src={signedImage}
                  alt="Signature"
                  className="h-16 object-contain rounded bg-white/5 p-2"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton continuer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <button
          onClick={onComplete}
          className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40"
        >
          Continuer
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  );
}
