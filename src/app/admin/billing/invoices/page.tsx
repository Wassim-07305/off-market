"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useInvoices } from "@/hooks/use-invoices";
import { useContracts } from "@/hooks/use-contracts";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import type { InvoiceStatus, InvoiceLineItem } from "@/types/billing";
import { formatCurrency } from "@/lib/utils";
import { exportToCSV, exportTableToPDF } from "@/lib/export";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  Receipt,
  Plus,
  Search,
  Send,
  CheckCircle,
  Download,
  X,
  Trash2,
  FileText,
  Table,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

function formatDate(date: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_TABS: { label: string; value: InvoiceStatus | "all" }[] = [
  { label: "Toutes", value: "all" },
  { label: "Brouillons", value: "draft" },
  { label: "Envoyees", value: "sent" },
  { label: "Payees", value: "paid" },
  { label: "Partielles", value: "partial" },
  { label: "En retard", value: "overdue" },
  { label: "Remboursees", value: "refunded" },
  { label: "Annulees", value: "cancelled" },
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">(
    "all",
  );
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    invoices,
    isLoading,
    createInvoice,
    sendInvoice,
    markAsPaid,
    updateInvoice,
  } = useInvoices({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

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

  const filtered = search
    ? invoices.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
          i.client?.full_name?.toLowerCase().includes(search.toLowerCase()),
      )
    : invoices;

  // Stats
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const pendingTotal = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total), 0);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Factures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestion et suivi des factures
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportDropdown
            disabled={isLoading}
            options={[
              {
                label: "Rapport PDF",
                icon: FileText,
                onClick: () => {
                  exportTableToPDF({
                    title: "Rapport Factures",
                    subtitle: `${invoices.length} facture(s) — Total: ${formatCurrency(totalRevenue)}`,
                    columns: [
                      { key: "numero", label: "Numero" },
                      { key: "client", label: "Client" },
                      { key: "total", label: "Total (EUR)" },
                      { key: "statut", label: "Statut" },
                      { key: "echeance", label: "Echeance" },
                    ],
                    rows: invoices.map((inv) => ({
                      numero: inv.invoice_number,
                      client: inv.client?.full_name ?? "",
                      total: formatCurrency(Number(inv.total)),
                      statut: INVOICE_STATUS_LABELS[inv.status] ?? inv.status,
                      echeance: inv.due_date
                        ? new Date(inv.due_date).toLocaleDateString("fr-FR")
                        : "",
                    })),
                  });
                },
              },
              {
                label: "Export CSV",
                icon: Table,
                onClick: () => {
                  exportToCSV(
                    invoices.map((inv) => ({
                      numero: inv.invoice_number,
                      client: inv.client?.full_name ?? "",
                      montant_ht: inv.amount,
                      tva: inv.tax,
                      total_ttc: inv.total,
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
                      { key: "montant_ht", label: "Montant HT" },
                      { key: "tva", label: "TVA" },
                      { key: "total_ttc", label: "Total TTC" },
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">
            {invoices.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Total factures</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-emerald-600">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Encaisse</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-amber-600">
            {formatCurrency(pendingTotal)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">En attente</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-semibold text-foreground">
            {invoices.filter((i) => i.status === "overdue").length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">En retard</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une facture..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-border rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucune facture trouvee
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Numero
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Client
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Montant
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Statut
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Echeance
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground font-mono">
                        {invoice.invoice_number}
                      </p>
                      {invoice.contract && (
                        <p className="text-xs text-muted-foreground">
                          {invoice.contract.title}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">
                        {invoice.client?.full_name ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(Number(invoice.total))}
                      </p>
                      {Number(invoice.tax) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          dont TVA {formatCurrency(Number(invoice.tax))}
                        </p>
                      )}
                      {Number(invoice.discount) > 0 && (
                        <p className="text-xs text-emerald-600">
                          -{formatCurrency(Number(invoice.discount))}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(invoice.due_date)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {invoice.status === "draft" && (
                          <button
                            onClick={() => {
                              sendInvoice.mutate(invoice.id, {
                                onSuccess: () =>
                                  toast.success("Facture envoyee"),
                              });
                            }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-blue-500"
                            title="Envoyer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(invoice.status === "sent" ||
                          invoice.status === "overdue") && (
                          <button
                            onClick={() => {
                              markAsPaid.mutate(invoice.id, {
                                onSuccess: () =>
                                  toast.success("Facture marquee comme payee"),
                              });
                            }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-emerald-500"
                            title="Marquer payee"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {invoice.status === "paid" && (
                          <button
                            onClick={() => {
                              updateInvoice.mutate(
                                { id: invoice.id, status: "refunded" },
                                {
                                  onSuccess: () =>
                                    toast.success("Facture remboursee"),
                                },
                              );
                            }}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-amber-500"
                            title="Rembourser"
                          >
                            <Undo2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDownloadPDF(
                              invoice.id,
                              invoice.invoice_number,
                            )
                          }
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Telecharger PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateInvoiceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            createInvoice.mutate(
              { ...data, created_by: user?.id ?? "" },
              {
                onSuccess: () => {
                  setShowCreateModal(false);
                  toast.success("Facture creee");
                },
              },
            );
          }}
          isCreating={createInvoice.isPending}
        />
      )}
    </motion.div>
  );
}

const INVOICE_STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyee",
  paid: "Payee",
  partial: "Partielle",
  overdue: "En retard",
  refunded: "Remboursee",
  cancelled: "Annulee",
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    draft: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
    sent: { label: "Envoyee", className: "bg-blue-500/10 text-blue-600" },
    paid: { label: "Payee", className: "bg-emerald-500/10 text-emerald-600" },
    partial: {
      label: "Partielle",
      className: "bg-amber-500/10 text-amber-600",
    },
    overdue: { label: "En retard", className: "bg-red-500/10 text-red-600" },
    refunded: {
      label: "Remboursee",
      className: "bg-violet-500/10 text-violet-600",
    },
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

function CreateInvoiceModal({
  onClose,
  onCreate,
  isCreating,
}: {
  onClose: () => void;
  onCreate: (data: {
    client_id: string;
    amount: number;
    tax: number;
    tax_rate?: number;
    total: number;
    due_date?: string;
    notes?: string;
    contract_id?: string;
  }) => void;
  isCreating: boolean;
}) {
  const { students: clients } = useStudents();
  const { contracts } = useContracts({ status: "signed" });
  const [clientId, setClientId] = useState("");
  const [contractId, setContractId] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("0");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, unit_price: 0, total: 0 },
  ]);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0, total: 0 },
    ]);
  };

  const updateLineItem = (
    index: number,
    field: keyof InvoiceLineItem,
    value: string | number,
  ) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unit_price") {
          updated.total = Number(updated.quantity) * Number(updated.unit_price);
        }
        return updated;
      }),
    );
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const discountNum = parseFloat(discount) || 0;
  const amountAfterDiscount = subtotal - discountNum;
  const taxNum = amountAfterDiscount * (parseFloat(taxRate) / 100);
  const totalNum = amountAfterDiscount + taxNum;

  const handleCreate = () => {
    if (!clientId || subtotal <= 0) return;
    onCreate({
      client_id: clientId,
      amount: Math.round(amountAfterDiscount * 100) / 100,
      tax: Math.round(taxNum * 100) / 100,
      tax_rate: parseFloat(taxRate) || 0,
      total: Math.round(totalNum * 100) / 100,
      due_date: dueDate || undefined,
      notes: notes || undefined,
      contract_id: contractId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Nouvelle facture
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Client + Contract */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selectionner un client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
            {contracts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Contrat lie (optionnel)
                </label>
                <select
                  value={contractId}
                  onChange={(e) => setContractId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Aucun</option>
                  {contracts
                    .filter((c) => !clientId || c.client_id === clientId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Lignes de facturation
              </label>
              <button
                onClick={addLineItem}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Ajouter une ligne
              </button>
            </div>
            <div className="space-y-2">
              {lineItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(i, "description", e.target.value)
                    }
                    placeholder="Description..."
                    className="flex-1 h-9 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateLineItem(
                        i,
                        "quantity",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    min="1"
                    className="w-16 h-9 px-2 bg-surface border border-border rounded-lg text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Qte"
                  />
                  <input
                    type="number"
                    value={item.unit_price || ""}
                    onChange={(e) =>
                      updateLineItem(
                        i,
                        "unit_price",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    min="0"
                    step="0.01"
                    className="w-24 h-9 px-2 bg-surface border border-border rounded-lg text-sm text-foreground text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="P.U."
                  />
                  <span className="text-sm font-medium text-foreground w-20 text-right">
                    {formatCurrency(item.total)}
                  </span>
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(i)}
                      className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tax + Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                TVA (%)
              </label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="0">0%</option>
                <option value="5.5">5.5%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Remise (EUR)
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Total preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="text-foreground">
                {formatCurrency(subtotal)}
              </span>
            </div>
            {discountNum > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Remise</span>
                <span className="text-emerald-600">
                  -{formatCurrency(discountNum)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">HT</span>
              <span className="text-foreground">
                {formatCurrency(amountAfterDiscount)}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">TVA ({taxRate}%)</span>
              <span className="text-foreground">{formatCurrency(taxNum)}</span>
            </div>
            <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-foreground">Total TTC</span>
              <span className="text-foreground">
                {formatCurrency(totalNum)}
              </span>
            </div>
          </div>

          {/* Due date + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date d&apos;echeance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Notes (optionnel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Info supplementaire..."
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={!clientId || subtotal <= 0 || isCreating}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? "Creation..." : "Creer la facture"}
          </button>
        </div>
      </div>
    </div>
  );
}
