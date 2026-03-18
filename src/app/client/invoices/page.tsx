"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useInvoices } from "@/hooks/use-invoices";
import { useAuth } from "@/hooks/use-auth";
import {
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ClientInvoicesPage() {
  const { user } = useAuth();
  const { invoices, isLoading } = useInvoices({ clientId: user?.id });
  const searchParams = useSearchParams();

  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter(
    (i) => i.status === "sent" || i.status === "overdue",
  );

  // Handle Stripe redirect feedback
  useEffect(() => {
    const payment = searchParams.get("payment");
    const invoiceNumber = searchParams.get("invoice");
    if (payment === "success") {
      toast.success(
        `Paiement de la facture ${invoiceNumber ?? ""} effectue avec succes !`,
      );
      window.history.replaceState({}, "", "/client/invoices");
    } else if (payment === "cancelled") {
      toast.info("Paiement annule");
      window.history.replaceState({}, "", "/client/invoices");
    }
  }, [searchParams]);

  const handleDownloadPDF = async (
    invoiceId: string,
    invoiceNumber: string,
  ) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) throw new Error("Erreur");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de telecharger la facture");
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Mes factures</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consultez vos factures et effectuez vos paiements en ligne
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <Receipt className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
          <p className="text-2xl font-semibold text-foreground">
            {invoices.length}
          </p>
          <p className="text-xs text-muted-foreground">Total factures</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <Clock className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-foreground">
            {formatEUR(pending.reduce((s, i) => s + Number(i.total), 0))}
          </p>
          <p className="text-xs text-muted-foreground">En attente</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-5 text-center">
          <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-semibold text-foreground">
            {formatEUR(paid.reduce((s, i) => s + Number(i.total), 0))}
          </p>
          <p className="text-xs text-muted-foreground">Deja paye</p>
        </div>
      </motion.div>

      {/* Pending invoices with Stripe pay button */}
      {pending.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            A payer ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((invoice) => (
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

      {/* All invoices */}
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
                      handleDownloadPDF(invoice.id, invoice.invoice_number)
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
    </motion.div>
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
