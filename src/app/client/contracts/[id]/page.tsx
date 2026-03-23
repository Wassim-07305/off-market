"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useContract, useContracts } from "@/hooks/use-contracts";
import { SignaturePad } from "@/components/contracts/signature-pad";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  PenLine,
  Calendar,
  XCircle,
  Download,
  Type,
  Pencil,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SignatureMethod = "draw" | "type";

export default function ClientContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: contract, isLoading } = useContract(id);
  const { signContract } = useContracts();
  const [showSignatureSection, setShowSignatureSection] = useState(false);
  const signatureSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showSignatureSection) {
      setTimeout(() => {
        signatureSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [showSignatureSection]);
  const [signatureMethod, setSignatureMethod] =
    useState<SignatureMethod>("draw");
  const [accepted, setAccepted] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerAddress, setSignerAddress] = useState("");
  const [signerCity, setSignerCity] = useState("");

  const handleSignWithCanvas = async (signatureImage: string) => {
    if (!accepted || !signerAddress.trim() || !signerCity.trim()) {
      toast.error(
        "Veuillez remplir tous les champs et accepter les conditions",
      );
      return;
    }
    try {
      await signContract.mutateAsync({
        id,
        signatureData: {
          ip_address: "client-side",
          user_agent: navigator.userAgent,
          signer_address: signerAddress.trim(),
          signer_city: signerCity.trim(),
        } as any,
        signatureImage,
      });
      toast.success("Contrat signe avec succès !");
      setShowSignatureSection(false);
    } catch {
      toast.error("Erreur lors de la signature");
    }
  };

  const handleSignWithText = async () => {
    if (
      !accepted ||
      signerName.trim().length < 3 ||
      !signerAddress.trim() ||
      !signerCity.trim()
    ) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    try {
      await signContract.mutateAsync({
        id,
        signatureData: {
          ip_address: "client-side",
          user_agent: navigator.userAgent,
          signer_name: signerName.trim(),
          signer_address: signerAddress.trim(),
          signer_city: signerCity.trim(),
        } as any,
      });
      toast.success("Contrat signe avec succès !");
      setShowSignatureSection(false);
    } catch {
      toast.error("Erreur lors de la signature");
    }
  };

  const handleDownloadPDF = () => {
    // Download the styled PDF with client info + signature filled in
    window.open(`/api/contracts/${id}/signed-pdf`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-16">
        <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Contrat introuvable</p>
      </div>
    );
  }

  const isSigned = contract.status === "signed";
  const isSent = contract.status === "sent";
  const canSignText =
    accepted && signerName.trim().length >= 3 && !signContract.isPending;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {contract.title}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(contract.created_at)}
            </span>
            {isSigned && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Signe le {formatDate(contract.signed_at)}
              </span>
            )}
            {contract.status === "cancelled" && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Annule
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          title="Telecharger PDF"
        >
          <Download className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Status banner for pending signature */}
      {isSent && !showSignatureSection && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <PenLine className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Ce contrat attend votre signature
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Veuillez lire le contrat ci-dessous puis signez-le
              electroniquement
            </p>
          </div>
          <button
            onClick={() => setShowSignatureSection(true)}
            className="h-9 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Signer
          </button>
        </motion.div>
      )}

      {/* Contract PDF viewer */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <iframe
          src="/contrat-off-market.pdf#toolbar=0&navpanes=0"
          className="w-full border-0"
          style={{ height: "80vh", minHeight: "600px" }}
          title="Contrat d'accompagnement"
        />
      </div>

      {/* Signed state */}
      {isSigned && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Contrat signe
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Signe le {formatDate(contract.signed_at)}
              </p>
              {contract.signature_image && (
                <div className="mt-3 bg-surface border border-border rounded-lg p-3 inline-block">
                  <Image
                    src={contract.signature_image}
                    alt="Ma signature"
                    width={200}
                    height={64}
                    className="h-16 w-auto"
                    unoptimized
                  />
                </div>
              )}
              {contract.signature_data?.signer_name && (
                <p className="mt-3 text-lg font-semibold italic text-foreground/70">
                  {contract.signature_data.signer_name}
                </p>
              )}
            </div>
            <button
              onClick={handleDownloadPDF}
              className="h-9 px-4 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Telecharger PDF
            </button>
          </div>
        </motion.div>
      )}

      {/* Signature section */}
      {showSignatureSection && isSent && (
        <div
          ref={signatureSectionRef}
          className="bg-surface border border-border rounded-2xl p-6 space-y-5"
        >
          {/* Full-screen loading overlay when signing */}
          {signContract.isPending && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-surface rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  Signature en cours...
                </p>
                <p className="text-xs text-muted-foreground">
                  Veuillez patienter
                </p>
              </div>
            </div>
          )}

          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <PenLine className="w-4 h-4 text-primary" />
            Signature electronique
          </h3>

          {/* Client info fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Adresse
              </label>
              <input
                value={signerAddress}
                onChange={(e) => setSignerAddress(e.target.value)}
                placeholder="123 rue de la Paix"
                className="w-full h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Code postal et Ville
              </label>
              <input
                value={signerCity}
                onChange={(e) => setSignerCity(e.target.value)}
                placeholder="75001 Paris"
                className="w-full h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

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

          {/* Signature method toggle */}
          {accepted && (
            <div className="space-y-4">
              <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
                <button
                  onClick={() => setSignatureMethod("type")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    signatureMethod === "type"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Type className="w-3.5 h-3.5" />
                  Taper mon nom
                </button>
                <button
                  onClick={() => setSignatureMethod("draw")}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    signatureMethod === "draw"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Dessiner
                </button>
              </div>

              {signatureMethod === "type" ? (
                <div className="space-y-4">
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
                      disabled={signContract.isPending}
                      className={cn(
                        "w-full h-12 px-4 rounded-xl border text-base transition-all",
                        "bg-background border-border text-foreground placeholder:text-muted-foreground/50",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        signerName.trim().length >= 3 &&
                          "font-semibold italic text-lg",
                      )}
                    />
                    {signerName.trim().length > 0 &&
                      signerName.trim().length < 3 && (
                        <p className="text-xs text-amber-500 mt-1">
                          Minimum 3 caracteres requis
                        </p>
                      )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowSignatureSection(false);
                        setAccepted(false);
                        setSignerName("");
                      }}
                      className="h-10 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSignWithText}
                      disabled={!canSignText}
                      className={cn(
                        "h-10 px-6 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                        canSignText
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-muted text-muted-foreground cursor-not-allowed",
                      )}
                    >
                      {signContract.isPending ? (
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
                  </div>
                </div>
              ) : (
                <SignaturePad
                  onSign={handleSignWithCanvas}
                  onCancel={() => {
                    setShowSignatureSection(false);
                    setAccepted(false);
                  }}
                  disabled={signContract.isPending}
                />
              )}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/60 text-center">
            En signant, vous acceptez les termes du contrat. Votre signature
            electronique a la meme valeur juridique qu&apos;une signature
            manuscrite.
          </p>
        </div>
      )}

      {/* Expiry notice */}
      {contract.expires_at && isSent && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Clock className="w-3 h-3" />
            Ce contrat expire le {formatDate(contract.expires_at)}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
