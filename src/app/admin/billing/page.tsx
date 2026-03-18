"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useBillingStats } from "@/hooks/use-invoices";
import { useContracts } from "@/hooks/use-contracts";
import { useInvoices } from "@/hooks/use-invoices";
import { useSupabase } from "@/hooks/use-supabase";
import {
  usePaymentReminders,
  REMINDER_LABELS,
} from "@/hooks/use-payment-reminders";
import {
  CreditCard,
  FileText,
  Receipt,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Send,
  Bell,
  MailCheck,
  Table,
  DollarSign,
  Users,
  Settings,
  Save,
  Loader2,
} from "lucide-react";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { CommissionTable } from "@/components/billing/commission-table";
import { useCommissions } from "@/hooks/use-commissions";
import {
  useCommissionRules,
  type CommissionRule,
} from "@/hooks/use-commission-rules";
import { cn } from "@/lib/utils";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function BillingOverviewPage() {
  const { data: stats, isLoading: statsLoading } = useBillingStats();
  const { contracts, isLoading: contractsLoading } = useContracts({ limit: 5 });
  const { invoices, isLoading: invoicesLoading } = useInvoices({ limit: 5 });
  const { pendingReminders, upcomingReminders, markAsSent } =
    usePaymentReminders();

  const isLoading = statsLoading || contractsLoading || invoicesLoading;

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
        className="flex items-start justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Facturation
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
            Vue d&apos;ensemble des contrats, factures et paiements
          </p>
        </div>
        <ExportDropdown
          disabled={isLoading}
          options={[
            {
              label: "Rapport PDF",
              icon: FileText,
              onClick: () => {
                exportToPDF({
                  title: "Rapport Facturation",
                  subtitle: "Vue d'ensemble",
                  sections: [
                    {
                      title: "Revenus",
                      rows: [
                        {
                          label: "Revenu total",
                          value: formatEUR(stats?.totalRevenue ?? 0),
                        },
                        {
                          label: "En attente",
                          value: formatEUR(stats?.pendingAmount ?? 0),
                        },
                        {
                          label: "En retard",
                          value: formatEUR(stats?.overdueAmount ?? 0),
                        },
                      ],
                    },
                    {
                      title: "Contrats",
                      rows: [
                        {
                          label: "Signes",
                          value: String(stats?.contractsSigned ?? 0),
                        },
                        {
                          label: "En attente",
                          value: String(stats?.contractsPending ?? 0),
                        },
                      ],
                    },
                    {
                      title: "Factures",
                      rows: [
                        {
                          label: "Payees",
                          value: String(stats?.invoicesPaid ?? 0),
                        },
                        {
                          label: "En retard",
                          value: String(stats?.invoicesOverdue ?? 0),
                        },
                      ],
                    },
                  ],
                });
              },
            },
            {
              label: "Factures CSV",
              icon: Table,
              onClick: () => {
                exportToCSV(
                  invoices.map((inv) => ({
                    numero: inv.invoice_number,
                    client: inv.client?.full_name ?? "",
                    total: inv.total,
                    statut: inv.status,
                    echeance: inv.due_date
                      ? new Date(inv.due_date).toLocaleDateString("fr-FR")
                      : "",
                    paye_le: inv.paid_at
                      ? new Date(inv.paid_at).toLocaleDateString("fr-FR")
                      : "",
                  })),
                  [
                    { key: "numero", label: "Numero" },
                    { key: "client", label: "Client" },
                    { key: "total", label: "Total (EUR)" },
                    { key: "statut", label: "Statut" },
                    { key: "echeance", label: "Echeance" },
                    { key: "paye_le", label: "Paye le" },
                  ],
                  "factures-export",
                );
              },
            },
          ]}
        />
      </motion.div>

      {/* Stats cards */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20">
              <CreditCard className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {statsLoading ? "..." : formatEUR(stats?.totalRevenue ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Revenus encaisses
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center ring-1 ring-amber-500/20">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {statsLoading ? "..." : formatEUR(stats?.pendingAmount ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">En attente</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {statsLoading ? "..." : formatEUR(stats?.overdueAmount ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">En retard</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {statsLoading ? "..." : (stats?.contractsSigned ?? 0)}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Contrats signes
          </p>
        </div>
      </motion.div>

      {/* Cash flow chart */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <CashFlowChart />
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
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Derniers contrats
            </h2>
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
                <div
                  key={i}
                  className="h-14 bg-muted animate-pulse rounded-lg"
                />
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
            <h2 className="text-sm font-bold text-foreground tracking-tight">
              Dernieres factures
            </h2>
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
                <div
                  key={i}
                  className="h-14 bg-muted animate-pulse rounded-lg"
                />
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

      {/* Commissions — A payer + table + regles */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <PendingCommissions />
      </motion.div>

      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <CommissionTable />
      </motion.div>

      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <CommissionRulesConfig />
      </motion.div>

      {/* Payment reminders section */}
      {(pendingReminders.length > 0 || upcomingReminders.length > 0) && (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Relances de paiement
            </h2>
            {pendingReminders.length > 0 && (
              <span className="text-xs font-medium bg-red-500/10 text-red-600 px-2 py-0.5 rounded-full">
                {pendingReminders.length} a envoyer
              </span>
            )}
          </div>

          {/* Pending (to send now) */}
          {pendingReminders.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-red-500 mb-2">
                A envoyer maintenant
              </p>
              <div className="space-y-2">
                {pendingReminders.slice(0, 5).map((r) => {
                  const config = REMINDER_LABELS[r.reminder_type];
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10"
                    >
                      <div>
                        <p
                          className={`text-xs font-medium ${config?.severity ?? "text-red-500"}`}
                        >
                          {config?.label ?? r.reminder_type}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Prevue le{" "}
                          {new Date(r.scheduled_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <button
                        onClick={() => markAsSent.mutate(r.id)}
                        disabled={markAsSent.isPending}
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-50"
                      >
                        <MailCheck className="w-3.5 h-3.5" />
                        Marquer envoyee
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingReminders.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Prochaines relances
              </p>
              <div className="space-y-1.5">
                {upcomingReminders.slice(0, 5).map((r) => {
                  const config = REMINDER_LABELS[r.reminder_type];
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-foreground">
                          {config?.label ?? r.reminder_type}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(r.scheduled_at).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}
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
    <span
      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.className}`}
    >
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
      return (
        <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
      );
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

/* ─── Pending Commissions (A payer ce soir) ─── */

function PendingCommissions() {
  const { commissions, summaries, markAsPaid } = useCommissions({
    status: "pending",
  });

  if (commissions.length === 0) return null;

  const totalPending = commissions.reduce(
    (s, c) => s + (c.commission_amount ?? c.amount ?? 0),
    0,
  );

  return (
    <div className="bg-surface border border-amber-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-500" />A payer (
          {commissions.length})
        </h2>
        <span className="text-sm font-bold text-amber-600">
          {formatEUR(totalPending)}
        </span>
      </div>

      <div className="space-y-2">
        {summaries
          .filter((s) => s.remaining > 0)
          .map((summary) => {
            const pending = commissions.filter(
              (c) => c.contractor_id === summary.contractor_id,
            );
            return (
              <div
                key={summary.contractor_id}
                className="flex items-center justify-between p-3 bg-amber-500/5 rounded-lg border border-amber-500/10"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {summary.contractor_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pending.length} commission{pending.length > 1 ? "s" : ""}{" "}
                    en attente
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-amber-600">
                    {formatEUR(summary.remaining)}
                  </span>
                  <button
                    onClick={() => {
                      pending.forEach((c) => markAsPaid.mutate(c.id));
                    }}
                    disabled={markAsPaid.isPending}
                    className="h-8 px-3 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Payer
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

/* ─── Commission Rules Config ─── */

function CommissionRulesConfig() {
  const { rules, isLoading, upsertRule } = useCommissionRules();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const [editSplitFirst, setEditSplitFirst] = useState("");
  const [editSplitSecond, setEditSplitSecond] = useState("");
  const [showAddSetter, setShowAddSetter] = useState(false);
  const [newSetterId, setNewSetterId] = useState("");
  const [newRate, setNewRate] = useState("5");
  const [newSplitFirst, setNewSplitFirst] = useState("70");
  const [newSplitSecond, setNewSplitSecond] = useState("30");
  const supabase = useSupabase();
  const [setters, setSetters] = useState<{ id: string; full_name: string }[]>(
    [],
  );

  // Fetch setters on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "setter")
      .order("full_name")
      .then(({ data }: { data: { id: string; full_name: string }[] | null }) =>
        setSetters(data ?? []),
      );
  }, [supabase]);

  const startEdit = (rule: CommissionRule) => {
    setEditingId(rule.id);
    setEditRate(String(rule.rate));
    setEditSplitFirst(String(rule.split_first));
    setEditSplitSecond(String(rule.split_second));
  };

  const saveEdit = (setterId: string) => {
    const first = Number(editSplitFirst) || 70;
    const second = Number(editSplitSecond) || 30;
    upsertRule.mutate(
      {
        setter_id: setterId,
        rate: Number(editRate) || 5,
        split_first: first,
        split_second: second,
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleAddSetter = () => {
    if (!newSetterId) return;
    const first = Number(newSplitFirst) || 70;
    const second = Number(newSplitSecond) || 30;
    upsertRule.mutate(
      {
        setter_id: newSetterId,
        rate: Number(newRate) || 5,
        split_first: first,
        split_second: second,
      },
      {
        onSuccess: () => {
          setShowAddSetter(false);
          setNewSetterId("");
          setNewRate("5");
          setNewSplitFirst("70");
          setNewSplitSecond("30");
        },
      },
    );
  };

  // Filter setters not yet in rules
  const existingSetterIds = new Set(rules.map((r) => r.setter_id));
  const availableSetters = setters.filter((s) => !existingSetterIds.has(s.id));

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Settings className="w-4 h-4 text-muted-foreground" />
          Regles de commission (setters)
        </h2>
        {availableSetters.length > 0 && (
          <button
            onClick={() => setShowAddSetter(!showAddSetter)}
            className="text-xs text-primary hover:underline"
          >
            + Ajouter un setter
          </button>
        )}
      </div>

      {/* Add setter form */}
      {showAddSetter && (
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border space-y-3">
          <select
            value={newSetterId}
            onChange={(e) => setNewSetterId(e.target.value)}
            className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm"
          >
            <option value="">Selectionner un setter</option>
            {availableSetters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground">
                Taux %
              </label>
              <input
                type="number"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">
                1er versement %
              </label>
              <input
                type="number"
                value={newSplitFirst}
                onChange={(e) => setNewSplitFirst(e.target.value)}
                className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground">
                2eme versement %
              </label>
              <input
                type="number"
                value={newSplitSecond}
                onChange={(e) => setNewSplitSecond(e.target.value)}
                className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddSetter}
              disabled={!newSetterId || upsertRule.isPending}
              className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              {upsertRule.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              Ajouter
            </button>
            <button
              onClick={() => setShowAddSetter(false)}
              className="h-8 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : rules.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Aucune regle configuree. Les commissions par defaut seront de 5% avec
          split 70/30.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors border border-border/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {rule.setter?.full_name ?? "Setter"}
                  </p>
                  {editingId === rule.id ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={editRate}
                        onChange={(e) => setEditRate(e.target.value)}
                        className="w-14 h-6 px-1.5 bg-muted border border-border rounded text-xs"
                        placeholder="Taux"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        %
                      </span>
                      <input
                        type="number"
                        value={editSplitFirst}
                        onChange={(e) => setEditSplitFirst(e.target.value)}
                        className="w-12 h-6 px-1.5 bg-muted border border-border rounded text-xs"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        /
                      </span>
                      <input
                        type="number"
                        value={editSplitSecond}
                        onChange={(e) => setEditSplitSecond(e.target.value)}
                        className="w-12 h-6 px-1.5 bg-muted border border-border rounded text-xs"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {rule.rate}% — Split {rule.split_first}/
                      {rule.split_second}
                    </p>
                  )}
                </div>
              </div>
              {editingId === rule.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => saveEdit(rule.setter_id)}
                    disabled={upsertRule.isPending}
                    className="h-7 px-2 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                  >
                    {upsertRule.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      "Sauver"
                    )}
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="h-7 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(rule)}
                  className="h-7 px-2 rounded-md text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  Modifier
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
