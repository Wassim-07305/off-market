"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useBillingStats } from "@/hooks/use-invoices";
import { useContracts } from "@/hooks/use-contracts";
import { useInvoices } from "@/hooks/use-invoices";
import {
  CreditCard,
  FileText,
  Receipt,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Send,
} from "lucide-react";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default function BillingOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useBillingStats();
  const { contracts, isLoading: contractsLoading } = useContracts({ limit: 5 });
  const { invoices, isLoading: invoicesLoading } = useInvoices({ limit: 5 });

  const isLoading = statsLoading || contractsLoading || invoicesLoading;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Facturation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d&apos;ensemble des contrats, factures et paiements
        </p>
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {statsLoading ? "..." : formatEUR(stats?.totalRevenue ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Revenus encaisses</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {statsLoading ? "..." : formatEUR(stats?.pendingAmount ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">En attente</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {statsLoading ? "..." : formatEUR(stats?.overdueAmount ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">En retard</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {statsLoading ? "..." : stats?.contractsSigned ?? 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Contrats signes</p>
        </div>
      </motion.div>

      {/* Two columns: Recent contracts + Recent invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent contracts */}
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Derniers contrats</h2>
            <Link
              href="/admin/billing/contracts"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {contractsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : contracts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucun contrat pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ContractStatusIcon status={contract.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {contract.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contract.client?.full_name ?? "Client"}
                      </p>
                    </div>
                  </div>
                  <ContractStatusBadge status={contract.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent invoices */}
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Dernieres factures</h2>
            <Link
              href="/admin/billing/invoices"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {invoicesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucune facture pour le moment
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <InvoiceStatusIcon status={invoice.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.client?.full_name ?? "Client"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatEUR(Number(invoice.total))}
                    </p>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function ContractStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "signed":
      return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
    case "sent":
      return <Send className="w-4 h-4 text-blue-500 shrink-0" />;
    case "cancelled":
      return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
}

function ContractStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
    sent: { label: "Envoye", className: "bg-blue-500/10 text-blue-600" },
    signed: { label: "Signe", className: "bg-emerald-500/10 text-emerald-600" },
    cancelled: { label: "Annule", className: "bg-red-500/10 text-red-600" },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

function InvoiceStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "paid":
      return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
    case "sent":
      return <Send className="w-4 h-4 text-blue-500 shrink-0" />;
    case "overdue":
      return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />;
    case "cancelled":
      return <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />;
    default:
      return <Receipt className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
    sent: { label: "Envoyee", className: "bg-blue-500/10 text-blue-600" },
    paid: { label: "Payee", className: "bg-emerald-500/10 text-emerald-600" },
    overdue: { label: "En retard", className: "bg-red-500/10 text-red-600" },
    cancelled: { label: "Annulee", className: "bg-muted text-muted-foreground" },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}
