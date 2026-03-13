"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useContract, useContracts } from "@/hooks/use-contracts";
import { CancelContractModal } from "@/components/contracts/cancel-contract-modal";
import {
  ArrowLeft,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  PenLine,
  Download,
  Link2,
  Mail,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Shield,
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

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: {
    label: "Brouillon",
    className: "bg-muted text-muted-foreground",
    icon: FileText,
  },
  sent: {
    label: "Envoye",
    className: "bg-blue-500/10 text-blue-600",
    icon: Send,
  },
  signed: {
    label: "Signe",
    className: "bg-emerald-500/10 text-emerald-600",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Annule",
    className: "bg-red-500/10 text-red-600",
    icon: XCircle,
  },
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: contract, isLoading } = useContract(id);
  const { sendContract, cancelContract, updateContract } = useContracts();
  const [sendingEmail, setSendingEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const signUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/contracts/${id}/sign`
      : "";

  const handleDownloadPDF = () => {
    window.open(`/api/contracts/${id}/pdf`, "_blank");
  };

  const handleCopySignLink = async () => {
    try {
      await navigator.clipboard.writeText(signUrl);
      setCopied(true);
      toast.success("Lien de signature copie !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/contracts/${id}/send-email`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur lors de l'envoi");
        return;
      }
      toast.success("Email envoye au client !");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSendingEmail(false);
    }
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

  const statusConf = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusConf.icon;

  // Expiry check
  const isExpiringSoon =
    contract.expires_at &&
    contract.status === "sent" &&
    new Date(contract.expires_at).getTime() - Date.now() < 7 * 86400000 &&
    new Date(contract.expires_at).getTime() > Date.now();
  const isExpired =
    contract.expires_at &&
    contract.status === "sent" &&
    new Date(contract.expires_at).getTime() <= Date.now();

  // Build timeline events
  const timeline = [
    { date: contract.created_at, label: "Contrat cree", icon: FileText },
    ...(contract.sent_at
      ? [{ date: contract.sent_at, label: "Envoye au client", icon: Send }]
      : []),
    ...(contract.signed_at
      ? [
          {
            date: contract.signed_at,
            label: "Signe par le client",
            icon: PenLine,
          },
        ]
      : []),
    ...(contract.status === "cancelled"
      ? [
          {
            date: contract.updated_at,
            label: `Contrat annule${contract.cancellation_reason ? ` — ${contract.cancellation_reason}` : ""}`,
            icon: XCircle,
          },
        ]
      : []),
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
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
          <p className="text-sm text-muted-foreground mt-0.5">
            {contract.client?.full_name ?? "Client inconnu"}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${statusConf.className}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConf.label}
        </span>
      </motion.div>

      {/* Expiry warning */}
      {isExpired && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Ce contrat a expire
            </p>
            <p className="text-xs text-muted-foreground">
              Le delai de signature est depasse depuis le{" "}
              {formatDate(contract.expires_at)}
            </p>
          </div>
        </motion.div>
      )}
      {isExpiringSoon && !isExpired && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Ce contrat expire bientot
            </p>
            <p className="text-xs text-muted-foreground">
              Date d&apos;expiration : {formatDate(contract.expires_at)}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="lg:col-span-2 space-y-6"
        >
          {/* Signing link banner for sent contracts */}
          {contract.status === "sent" && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Link2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-medium text-foreground">
                  Lien de signature
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground truncate font-mono">
                  {signUrl}
                </div>
                <button
                  onClick={handleCopySignLink}
                  className="h-9 px-3 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copie" : "Copier"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Partagez ce lien avec le client pour qu&apos;il puisse signer en
                ligne sans avoir besoin de compte.
              </p>
            </div>
          )}

          {/* Contract content */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">
                Contenu du contrat
              </h2>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Telecharger PDF
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
              {contract.content}
            </div>
          </div>

          {/* Signature section */}
          {contract.status === "signed" && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Signature electronique
              </h2>
              <div className="flex items-start gap-6">
                {contract.signature_image && (
                  <div className="bg-white border border-border rounded-lg p-3">
                    <img
                      src={contract.signature_image}
                      alt="Signature"
                      className="h-16 w-auto"
                    />
                  </div>
                )}
                <div className="space-y-1.5 text-sm">
                  {contract.signature_data?.signer_name && (
                    <p className="text-foreground font-medium">
                      {contract.signature_data.signer_name}
                    </p>
                  )}
                  <p className="text-muted-foreground text-xs">
                    Signe le {formatDate(contract.signed_at)}
                  </p>
                  {contract.signature_data?.ip_address && (
                    <p className="text-muted-foreground text-xs">
                      IP : {contract.signature_data.ip_address}
                    </p>
                  )}
                  {contract.signature_data?.user_agent && (
                    <p className="text-muted-foreground text-xs truncate max-w-md">
                      {contract.signature_data.user_agent}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Signature certifiee conforme au reglement eIDAS - Piste
                  d&apos;audit complete
                </p>
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {contract.status === "cancelled" && contract.cancellation_reason && (
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h2 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Motif d&apos;annulation
              </h2>
              <p className="text-sm text-muted-foreground">
                {contract.cancellation_reason}
              </p>
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="space-y-6"
        >
          {/* Info card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Informations
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">
                    {contract.client?.full_name ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contract.client?.email ?? ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Cree le {formatDate(contract.created_at)}
                </p>
              </div>
              {contract.expires_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p
                    className={
                      isExpired
                        ? "text-red-500"
                        : isExpiringSoon
                          ? "text-amber-600"
                          : "text-muted-foreground"
                    }
                  >
                    {isExpired ? "Expire" : "Expire"} le{" "}
                    {formatDate(contract.expires_at)}
                  </p>
                </div>
              )}
              {contract.version && contract.version > 1 && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Version {contract.version}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border space-y-2">
              {/* Download PDF */}
              <button
                onClick={handleDownloadPDF}
                className="w-full h-9 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Telecharger PDF
              </button>

              {/* Draft: Send */}
              {contract.status === "draft" && (
                <>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="w-full h-9 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    Envoyer pour signature
                  </button>
                  <button
                    onClick={() => sendContract.mutate(contract.id)}
                    disabled={sendContract.isPending}
                    className="w-full h-9 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Marquer comme envoye
                  </button>
                </>
              )}

              {/* Sent: Copy link + Cancel */}
              {contract.status === "sent" && (
                <>
                  <button
                    onClick={handleCopySignLink}
                    className="w-full h-9 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Link2 className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Lien copie !" : "Copier le lien de signature"}
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="w-full h-9 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingEmail ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Mail className="w-3.5 h-3.5" />
                    )}
                    Renvoyer l&apos;email
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full h-9 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Annuler le contrat
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">
              Historique
            </h3>
            <div className="space-y-0">
              {timeline.map((event, i) => {
                const Icon = event.icon;
                return (
                  <div key={i} className="flex gap-3 relative">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[11px] top-7 w-px h-[calc(100%-4px)] bg-border" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm text-foreground">{event.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <CancelContractModal
          contractTitle={contract.title}
          onCancel={(reason) => {
            cancelContract.mutate(
              { id: contract.id, reason },
              {
                onSuccess: () => {
                  setShowCancelModal(false);
                  toast.success("Contrat annule");
                },
              },
            );
          }}
          onClose={() => setShowCancelModal(false)}
          isPending={cancelContract.isPending}
        />
      )}
    </motion.div>
  );
}
