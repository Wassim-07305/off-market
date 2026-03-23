"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  staggerItem,
  defaultTransition,
} from "@/lib/animations";
import { useContracts } from "@/hooks/use-contracts";
import { useInvoices } from "@/hooks/use-invoices";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  FileText,
  FileSignature,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  PenLine,
  Download,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

type Tab = "contrats" | "factures";

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

const CONTRACT_STATUS: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: {
    label: "Brouillon",
    className: "bg-muted text-muted-foreground",
    icon: FileText,
  },
  sent: {
    label: "A signer",
    className: "bg-amber-500/10 text-amber-600",
    icon: PenLine,
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

export default function ClientDocumentsPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("contrats");

  const { contracts, isLoading: contractsLoading, error: contractsError } = useContracts({
    clientId: user?.id,
  });
  const { invoices, isLoading: invoicesLoading, error: invoicesError } = useInvoices({
    clientId: user?.id,
  });

  // Handle Stripe redirect feedback
  useEffect(() => {
    const payment = searchParams.get("payment");
    const invoiceNumber = searchParams.get("invoice");
    if (payment === "success") {
      toast.success(
        `Paiement de la facture ${invoiceNumber ?? ""} effectue avec succès !`,
      );
      setTab("factures");
      window.history.replaceState({}, "", "/client/documents");
    } else if (payment === "cancelled") {
      toast.info("Paiement annule");
      setTab("factures");
      window.history.replaceState({}, "", "/client/documents");
    }
  }, [searchParams]);

  const pendingContracts = contracts.filter((c) => c.status === "sent").length;
  const pendingInvoices = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue",
  );

  const handleDownloadPDF = async (
    invoiceId: string,
    _invoiceNumber: string,
  ) => {
    // Open invoice in a new tab — user can print to PDF via Ctrl+P
    window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="visible"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Documents
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vos contrats et factures au meme endroit
        </p>
      </motion.div>

      {(contractsError || invoicesError) && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Impossible de charger vos documents. Veuillez reessayer.
        </p>
      )}

      {/* Tabs */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("contrats")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "contrats"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileSignature className="w-4 h-4" />
            Contrats
            {pendingContracts > 0 && (
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full">
                {pendingContracts}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("factures")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === "factures"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Receipt className="w-4 h-4" />
            Factures
            {pendingInvoices.length > 0 && (
              <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full">
                {pendingInvoices.length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Content */}
      {tab === "contrats" ? (
        <ContractsTab contracts={contracts} isLoading={contractsLoading} />
      ) : (
        <InvoicesTab
          invoices={invoices}
          isLoading={invoicesLoading}
          pendingInvoices={pendingInvoices}
          onDownloadPDF={handleDownloadPDF}
        />
      )}
    </motion.div>
  );
}

/* ─── Contracts Tab ─── */

function ContractsTab({
  contracts,
  isLoading,
}: {
  contracts: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    signed_at: string | null;
  }[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl p-12 text-center"
      >
        <FileSignature className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Aucun contrat</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {contracts.map((contract) => {
        const conf = CONTRACT_STATUS[contract.status] ?? CONTRACT_STATUS.draft;
        const Icon = conf.icon;
        return (
          <motion.div key={contract.id} variants={staggerItem}>
            <Link
              href={`/client/contracts/${contract.id}`}
              className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {contract.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(contract.created_at)}
                  {contract.signed_at &&
                    ` · Signe le ${formatDate(contract.signed_at)}`}
                </p>
              </div>
              <span
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${conf.className}`}
              >
                <Icon className="w-3 h-3" />
                {conf.label}
              </span>
              {contract.status === "sent" && (
                <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Signer →
                </span>
              )}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Invoices Tab ─── */

function InvoicesTab({
  invoices,
  isLoading,
  pendingInvoices,
  onDownloadPDF,
}: {
  invoices: {
    id: string;
    invoice_number: string;
    status: string;
    total: number | string;
    created_at: string;
    due_date: string | null;
  }[];
  isLoading: boolean;
  pendingInvoices: typeof invoices;
  onDownloadPDF: (invoiceId: string, invoiceNumber: string) => void;
}) {
  const paid = invoices.filter((i) => i.status === "paid");

  return (
    <div className="space-y-6">
      {/* Summary */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Receipt className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl font-semibold text-foreground">
            {invoices.length}
          </p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-foreground">
            {formatEUR(
              pendingInvoices.reduce((s, i) => s + Number(i.total), 0),
            )}
          </p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-foreground">
            {formatEUR(paid.reduce((s, i) => s + Number(i.total), 0))}
          </p>
          <p className="text-xs text-muted-foreground">Paye</p>
        </div>
      </motion.div>

      {/* Pending invoices with pay button */}
      {pendingInvoices.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            A payer ({pendingInvoices.length})
          </h2>
          <div className="space-y-2">
            {pendingInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  {invoice.status === "overdue" ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground font-mono">
                      {invoice.invoice_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Echeance: {formatDate(invoice.due_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right mr-1">
                    <p className="text-sm font-semibold text-foreground">
                      {formatEUR(Number(invoice.total))}
                    </p>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        invoice.status === "overdue"
                          ? "bg-red-500/10 text-red-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      {invoice.status === "overdue"
                        ? "En retard"
                        : "En attente"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* History */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Historique</h2>
        </div>
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Aucune facture</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground font-mono">
                    {invoice.invoice_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(invoice.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatEUR(Number(invoice.total))}
                    </p>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <button
                    onClick={() =>
                      onDownloadPDF(invoice.id, invoice.invoice_number)
                    }
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Telecharger PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
    sent: { label: "En attente", className: "bg-amber-500/10 text-amber-600" },
    paid: { label: "Payee", className: "bg-emerald-500/10 text-emerald-600" },
    overdue: { label: "En retard", className: "bg-red-500/10 text-red-600" },
    cancelled: {
      label: "Annulee",
      className: "bg-muted text-muted-foreground",
    },
  };
  const c = config[status] ?? config.draft;
  return (
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}
    >
      {c.label}
    </span>
  );
}
