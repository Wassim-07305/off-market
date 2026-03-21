"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageTransition } from "@/components/ui/page-transition";
import { HeroMetric } from "@/components/dashboard/hero-metric";
import { useContracts } from "@/hooks/use-contracts";
import { useInvoices } from "@/hooks/use-invoices";
import { cn, formatDate } from "@/lib/utils";
import {
  FileText,
  Receipt,
  CheckCircle,
  Clock,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function extractAmount(title: string): number {
  const match = title?.match(/([\d\s,.]+)\s*EUR/);
  if (!match) return 0;
  return Number(match[1].replace(/\s/g, "").replace(",", ".")) || 0;
}

export default function CaDetailPage() {
  const { contracts, isLoading: contractsLoading } = useContracts({});
  const { invoices, isLoading: invoicesLoading } = useInvoices({});

  const isLoading = contractsLoading || invoicesLoading;

  const thisMonthStart = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Paid invoices = CA reel
  const paidInvoices = useMemo(
    () => (invoices ?? []).filter((i) => i.status === "paid"),
    [invoices],
  );

  const totalCA = paidInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
  const caThisMonth = paidInvoices
    .filter((i) => new Date(i.paid_at ?? i.created_at) >= thisMonthStart)
    .reduce((s, i) => s + Number(i.total ?? 0), 0);

  // Signed contracts = engagements (pas encore CA)
  const signedContracts = useMemo(
    () => (contracts ?? []).filter((c) => c.status === "signed"),
    [contracts],
  );

  const totalEngagements = signedContracts.reduce(
    (s, c) => s + extractAmount(c.title),
    0,
  );

  // Pending = contracts signed but no paid invoice linked
  const paidContractIds = new Set(
    paidInvoices
      .filter((i) => i.contract_id)
      .map((i) => i.contract_id),
  );
  const pendingContracts = signedContracts.filter(
    (c) => !paidContractIds.has(c.id),
  );
  const pendingAmount = pendingContracts.reduce(
    (s, c) => s + extractAmount(c.title),
    0,
  );

  return (
    <PageTransition>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin/billing"
              className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
                Chiffre d&apos;Affaires
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                CA = factures payees (argent recu)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hero — CA reel */}
        <motion.div variants={staggerItem}>
          <HeroMetric
            label="CA total (factures payees)"
            value={formatEUR(totalCA)}
            change={
              caThisMonth > 0
                ? { value: `${formatEUR(caThisMonth)} ce mois`, positive: true }
                : undefined
            }
          />
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="size-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider">CA du mois</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatEUR(caThisMonth)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Receipt className="size-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Factures payees</span>
            </div>
            <p className="text-xl font-bold text-foreground">{paidInvoices.length}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="size-4" />
              <span className="text-[10px] font-medium uppercase tracking-wider">Engagements signes</span>
            </div>
            <p className="text-xl font-bold text-foreground">{formatEUR(totalEngagements)}</p>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="size-4 text-amber-500" />
              <span className="text-[10px] font-medium uppercase tracking-wider">En attente de paiement</span>
            </div>
            <p className="text-xl font-bold text-amber-600">{formatEUR(pendingAmount)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {pendingContracts.length} contrat{pendingContracts.length !== 1 ? "s" : ""} signe{pendingContracts.length !== 1 ? "s" : ""} sans facture payee
            </p>
          </div>
        </motion.div>

        {/* Paid invoices = CA */}
        <motion.div variants={staggerItem}>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                CA — Factures payees ({paidInvoices.length})
              </h3>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : paidInvoices.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Receipt className="size-10 mx-auto opacity-20 mb-3" />
                <p className="text-sm">Aucune facture payee</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {paidInvoices
                  .sort((a, b) => new Date(b.paid_at ?? b.created_at).getTime() - new Date(a.paid_at ?? a.created_at).getTime())
                  .map((inv) => (
                    <div key={inv.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle className="size-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          Facture {inv.invoice_number}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {inv.client?.full_name ?? "—"} · Paye {formatDate(inv.paid_at ?? inv.created_at, "relative")}
                        </p>
                      </div>
                      <span className="text-sm font-bold font-mono text-emerald-600 tabular-nums shrink-0">
                        +{formatEUR(Number(inv.total ?? 0))}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Signed contracts pending payment */}
        {pendingContracts.length > 0 && (
          <motion.div variants={staggerItem}>
            <div className="bg-surface border border-amber-200 dark:border-amber-900/40 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                  En attente — Contrats signes sans facture payee ({pendingContracts.length})
                </h3>
              </div>
              <div className="divide-y divide-border">
                {pendingContracts.map((c) => {
                  const amt = extractAmount(c.title);
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="size-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                        <Clock className="size-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.client?.full_name ?? "—"} · Signe {formatDate(c.signed_at ?? c.created_at, "relative")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold font-mono text-amber-600 tabular-nums">
                          {formatEUR(amt)}
                        </span>
                        <p className="text-[10px] text-muted-foreground">A facturer</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}
