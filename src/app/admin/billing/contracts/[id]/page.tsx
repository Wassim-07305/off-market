"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useContract, useContracts } from "@/hooks/use-contracts";
import {
  ArrowLeft,
  FileText,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  User,
  Calendar,
  PenLine,
} from "lucide-react";

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

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  draft: { label: "Brouillon", className: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Envoye", className: "bg-blue-500/10 text-blue-600", icon: Send },
  signed: { label: "Signe", className: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle },
  cancelled: { label: "Annule", className: "bg-red-500/10 text-red-600", icon: XCircle },
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: contract, isLoading } = useContract(id);
  const { sendContract, updateContract } = useContracts();
  const [showPreview, setShowPreview] = useState(false);

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
        .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; }
        @media print { body { padding: 20px; } }
      </style>
    </head><body>
      <h1>${contract.title}</h1>
      <div class="meta">
        Client : ${contract.client?.full_name ?? "-"} &bull;
        Cree le ${formatDate(contract.created_at)}
        ${contract.status === "signed" ? ` &bull; Signe le ${formatDate(contract.signed_at)}` : ""}
      </div>
      <div class="content">${contract.content}</div>
      ${contract.status === "signed" ? `
        <div class="signature-section">
          <strong>Signature electronique</strong>
          ${contract.signature_image ? `<br><img src="${contract.signature_image}" alt="Signature">` : ""}
          <div class="signature-meta">
            Signe le ${formatDate(contract.signed_at)}
            ${contract.signature_data?.ip_address ? ` &bull; IP: ${contract.signature_data.ip_address}` : ""}
          </div>
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

  const statusConf = STATUS_CONFIG[contract.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = statusConf.icon;

  // Build timeline events
  const timeline = [
    { date: contract.created_at, label: "Contrat cree", icon: FileText },
    ...(contract.sent_at ? [{ date: contract.sent_at, label: "Envoye au client", icon: Send }] : []),
    ...(contract.signed_at ? [{ date: contract.signed_at, label: "Signe par le client", icon: PenLine }] : []),
    ...(contract.status === "cancelled"
      ? [{ date: contract.updated_at, label: "Contrat annule", icon: XCircle }]
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
      <motion.div variants={fadeInUp} transition={defaultTransition} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{contract.title}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {contract.client?.full_name ?? "Client inconnu"}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 ${statusConf.className}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConf.label}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <motion.div variants={fadeInUp} transition={defaultTransition} className="lg:col-span-2 space-y-6">
          {/* Contract content */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-foreground">Contenu du contrat</h2>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimer / PDF
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">
              {contract.content}
            </div>
          </div>

          {/* Signature section */}
          {contract.status === "signed" && (
            <div className="bg-surface border border-border rounded-xl p-6">
              <h2 className="text-sm font-medium text-foreground mb-4">Signature electronique</h2>
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
                <div className="space-y-1 text-sm">
                  <p className="text-foreground">
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
            </div>
          )}
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={fadeInUp} transition={defaultTransition} className="space-y-6">
          {/* Info card */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Informations</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground">{contract.client?.full_name ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{contract.client?.email ?? ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground">Cree le {formatDate(contract.created_at)}</p>
              </div>
              {contract.expires_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Expire le {formatDate(contract.expires_at)}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border space-y-2">
              {contract.status === "draft" && (
                <button
                  onClick={() => sendContract.mutate(contract.id)}
                  disabled={sendContract.isPending}
                  className="w-full h-9 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer au client
                </button>
              )}
              {contract.status === "sent" && (
                <button
                  onClick={() => updateContract.mutate({ id: contract.id, status: "cancelled" })}
                  disabled={updateContract.isPending}
                  className="w-full h-9 bg-red-500/10 text-red-600 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Annuler le contrat
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h3 className="text-sm font-medium text-foreground mb-4">Historique</h3>
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
                      <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
