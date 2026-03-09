"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useContract, useContracts } from "@/hooks/use-contracts";
import { SignaturePad } from "@/components/contracts/signature-pad";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  Clock,
  PenLine,
  Printer,
  Calendar,
  XCircle,
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

export default function ClientContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: contract, isLoading } = useContract(id);
  const { signContract } = useContracts();
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  const handleSign = async (signatureImage: string) => {
    try {
      await signContract.mutateAsync({
        id,
        signatureData: {
          ip_address: "client-side",
          user_agent: navigator.userAgent,
        },
        signatureImage,
      });
      toast.success("Contrat signe avec succes !");
      setShowSignaturePad(false);
    } catch {
      toast.error("Erreur lors de la signature");
    }
  };

  const handlePrint = () => {
    if (!contract) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${contract.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #1a1a1a; line-height: 1.7; }
        h1 { font-size: 24px; margin-bottom: 8px; }
        .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
        .content { white-space: pre-wrap; font-size: 14px; }
        .signature-section { margin-top: 48px; border-top: 1px solid #e5e5e5; padding-top: 24px; }
        .signature-section img { max-height: 80px; }
        .signature-meta { font-size: 12px; color: #999; margin-top: 8px; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>
      <h1>${contract.title}</h1>
      <div class="meta">Cree le ${formatDate(contract.created_at)}</div>
      <div class="content">${contract.content}</div>
      ${contract.status === "signed" ? `
        <div class="signature-section">
          <strong>Signature electronique</strong>
          ${contract.signature_image ? `<br><img src="${contract.signature_image}" alt="Signature">` : ""}
          <div class="signature-meta">Signe le ${formatDate(contract.signed_at)}</div>
        </div>
      ` : ""}
    </body></html>`);
    w.document.close();
    w.onload = () => w.print();
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

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{contract.title}</h1>
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
          onClick={handlePrint}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          title="Imprimer / PDF"
        >
          <Printer className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Status banner for pending signature */}
      {isSent && !showSignaturePad && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <PenLine className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Ce contrat attend votre signature</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Veuillez lire le contrat ci-dessous puis signez-le electroniquement
            </p>
          </div>
          <button
            onClick={() => setShowSignaturePad(true)}
            className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex-shrink-0"
          >
            Signer
          </button>
        </motion.div>
      )}

      {/* Contract content */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl p-6 md:p-8"
      >
        <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
          {contract.content}
        </div>
      </motion.div>

      {/* Signature section */}
      {isSigned && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Contrat signe</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Signe le {formatDate(contract.signed_at)}
              </p>
              {contract.signature_image && (
                <div className="mt-3 bg-white border border-border rounded-lg p-3 inline-block">
                  <img
                    src={contract.signature_image}
                    alt="Ma signature"
                    className="h-16 w-auto"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Signature pad */}
      {showSignaturePad && isSent && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <PenLine className="w-4 h-4" />
            Signature electronique
          </h3>
          <SignaturePad
            onSign={handleSign}
            onCancel={() => setShowSignaturePad(false)}
            disabled={signContract.isPending}
          />
        </motion.div>
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
