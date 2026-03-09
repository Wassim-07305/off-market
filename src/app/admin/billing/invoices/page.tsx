"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useInvoices } from "@/hooks/use-invoices";
import { useContracts } from "@/hooks/use-contracts";
import { useAuth } from "@/hooks/use-auth";
import { useStudents } from "@/hooks/use-students";
import type { InvoiceStatus } from "@/types/billing";
import {
  Receipt,
  Plus,
  Search,
  Send,
  CheckCircle,
  Download,
  X,
} from "lucide-react";
import { toast } from "sonner";

function formatEUR(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

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
  { label: "En retard", value: "overdue" },
  { label: "Annulees", value: "cancelled" },
];

export default function InvoicesPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { invoices, isLoading, createInvoice, sendInvoice, markAsPaid } = useInvoices({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
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
          i.client?.full_name?.toLowerCase().includes(search.toLowerCase())
      )
    : invoices;

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle facture
        </button>
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
            <p className="text-sm text-muted-foreground">Aucune facture trouvee</p>
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
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">
                        {invoice.client?.full_name ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatEUR(Number(invoice.total))}
                      </p>
                      {Number(invoice.tax) > 0 && (
                        <p className="text-xs text-muted-foreground">
                          dont TVA {formatEUR(Number(invoice.tax))}
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
                            onClick={() => sendInvoice.mutate(invoice.id)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-blue-500"
                            title="Envoyer"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                        {(invoice.status === "sent" || invoice.status === "overdue") && (
                          <button
                            onClick={() => markAsPaid.mutate(invoice.id)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-emerald-500"
                            title="Marquer payee"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
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
              { onSuccess: () => setShowCreateModal(false) }
            );
          }}
          isCreating={createInvoice.isPending}
        />
      )}
    </motion.div>
  );
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
  const [amount, setAmount] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const amountNum = parseFloat(amount) || 0;
  const taxNum = amountNum * (parseFloat(taxRate) / 100);
  const totalNum = amountNum + taxNum;

  const handleCreate = () => {
    if (!clientId || amountNum <= 0) return;
    onCreate({
      client_id: clientId,
      amount: amountNum,
      tax: Math.round(taxNum * 100) / 100,
      total: Math.round(totalNum * 100) / 100,
      due_date: dueDate || undefined,
      notes: notes || undefined,
      contract_id: contractId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Nouvelle facture</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
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

          {/* Contract (optional) */}
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

          {/* Amount + Tax */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Montant HT (EUR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
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
          </div>

          {/* Total preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">HT</span>
              <span className="text-foreground">{formatEUR(amountNum)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">TVA ({taxRate}%)</span>
              <span className="text-foreground">{formatEUR(taxNum)}</span>
            </div>
            <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-foreground">Total TTC</span>
              <span className="text-foreground">{formatEUR(totalNum)}</span>
            </div>
          </div>

          {/* Due date */}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Informations supplementaires..."
              className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
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
            disabled={!clientId || amountNum <= 0 || isCreating}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isCreating ? "Creation..." : "Creer la facture"}
          </button>
        </div>
      </div>
    </div>
  );
}
