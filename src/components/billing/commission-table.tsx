"use client";

import { useState } from "react";
import { useCommissions } from "@/hooks/use-commissions";
import { useStudents } from "@/hooks/use-students";
import { COMMISSION_ROLE_LABELS, type CommissionRole } from "@/types/billing";
import { formatCurrency } from "@/lib/utils";
import { useUserCurrency, useConvertCurrency } from "@/hooks/use-currency";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { ExportDropdown } from "@/components/shared/export-dropdown";
import {
  Plus,
  X,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Percent,
  FileText,
  Table,
} from "lucide-react";
import { toast } from "sonner";

export function CommissionTable() {
  const { commissions, summaries, isLoading, createCommission, markAsPaid } =
    useCommissions();
  const { students: contractors } = useStudents();
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<"detail" | "summary">("summary");
  const currency = useUserCurrency();
  const convert = useConvertCurrency();
  const fmt = (amount: number) =>
    formatCurrency(convert(amount, "EUR", currency), currency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Commissions</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suivi des commissions par collaborateur
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32">
            <CurrencySelector />
          </div>
          <ExportDropdown
            disabled={isLoading}
            options={[
              {
                label: "Export PDF",
                icon: FileText,
                onClick: () => {
                  exportToPDF({
                    title: "Rapport Commissions",
                    sections: summaries.map((s) => ({
                      title: `${s.contractor_name} (${COMMISSION_ROLE_LABELS[s.role]})`,
                      rows: [
                        { label: "Ventes", value: String(s.count) },
                        {
                          label: "Du",
                          value: fmt(s.total_owed + s.total_paid),
                        },
                        { label: "Paye", value: fmt(s.total_paid) },
                        {
                          label: "Restant",
                          value: fmt(s.remaining),
                        },
                      ],
                    })),
                  });
                },
              },
              {
                label: "Export CSV",
                icon: Table,
                onClick: () => {
                  exportToCSV(
                    commissions.map((c) => ({
                      collaborateur: c.contractor?.full_name ?? "",
                      role: COMMISSION_ROLE_LABELS[c.contractor_role],
                      montant_vente: c.sale_amount,
                      taux: `${c.commission_rate}%`,
                      commission: c.commission_amount,
                      statut: c.status === "paid" ? "Paye" : "En attente",
                    })),
                    [
                      { key: "collaborateur", label: "Collaborateur" },
                      { key: "role", label: "Role" },
                      { key: "montant_vente", label: "Montant vente" },
                      { key: "taux", label: "Taux" },
                      { key: "commission", label: "Commission" },
                      { key: "statut", label: "Statut" },
                    ],
                    "commissions-export",
                  );
                },
              },
            ]}
          />
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        <button
          onClick={() => setView("summary")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            view === "summary"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Par collaborateur
        </button>
        <button
          onClick={() => setView("detail")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            view === "detail"
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Detail
        </button>
      </div>

      {/* Summary view */}
      {view === "summary" && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune commission enregistree
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Collaborateur
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                    Role
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Ventes
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Du total
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Paye
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                    Restant
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => (
                  <tr
                    key={s.contractor_id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-foreground">
                        {s.contractor_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {COMMISSION_ROLE_LABELS[s.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-foreground">
                      {s.count}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {fmt(s.total_owed + s.total_paid)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-emerald-600">
                      {fmt(s.total_paid)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`text-sm font-medium ${
                          s.remaining > 0
                            ? "text-amber-600"
                            : "text-emerald-600"
                        }`}
                      >
                        {fmt(s.remaining)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/30">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-sm font-semibold text-foreground"
                  >
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-foreground">
                    {fmt(
                      summaries.reduce(
                        (sum, s) => sum + s.total_owed + s.total_paid,
                        0,
                      ),
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                    {fmt(summaries.reduce((sum, s) => sum + s.total_paid, 0))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-amber-600">
                    {fmt(summaries.reduce((sum, s) => sum + s.remaining, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}

      {/* Detail view */}
      {view === "detail" && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          {commissions.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Aucune commission</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Collaborateur
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Role
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Vente
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Taux
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Commission
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                      Statut
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-foreground">
                        {c.contractor?.full_name ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {COMMISSION_ROLE_LABELS[c.contractor_role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {fmt(c.sale_amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-foreground">
                        {c.commission_rate}%
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                        {fmt(c.commission_amount)}
                      </td>
                      <td className="px-4 py-3">
                        {c.status === "paid" ? (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                            Paye
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === "pending" && (
                          <button
                            onClick={() => {
                              markAsPaid.mutate(c.id, {
                                onSuccess: () =>
                                  toast.success(
                                    "Commission marquee comme payee",
                                  ),
                              });
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-emerald-500"
                            title="Marquer paye"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add commission modal */}
      {showAddModal && (
        <AddCommissionModal
          contractors={contractors}
          onClose={() => setShowAddModal(false)}
          onAdd={(data) => {
            createCommission.mutate(data, {
              onSuccess: () => {
                setShowAddModal(false);
                toast.success("Commission ajoutee");
              },
            });
          }}
          isPending={createCommission.isPending}
        />
      )}
    </div>
  );
}

function AddCommissionModal({
  contractors,
  onClose,
  onAdd,
  isPending,
}: {
  contractors: { id: string; full_name: string; email: string }[];
  onClose: () => void;
  onAdd: (data: {
    contractor_id: string;
    contractor_role: CommissionRole;
    sale_amount: number;
    commission_rate: number;
    commission_amount: number;
  }) => void;
  isPending: boolean;
}) {
  const currency = useUserCurrency();
  const [contractorId, setContractorId] = useState("");
  const [role, setRole] = useState<CommissionRole>("setter");
  const [saleAmount, setSaleAmount] = useState("");
  const [commissionRate, setCommissionRate] = useState("10");

  const saleAmountNum = parseFloat(saleAmount) || 0;
  const rateNum = parseFloat(commissionRate) || 0;
  const commissionAmount =
    Math.round(((saleAmountNum * rateNum) / 100) * 100) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Nouvelle commission
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Collaborateur
            </label>
            <select
              value={contractorId}
              onChange={(e) => setContractorId(e.target.value)}
              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selectionner...</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Role
            </label>
            <div className="flex gap-2">
              {(
                Object.entries(COMMISSION_ROLE_LABELS) as [
                  CommissionRole,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex-1 h-9 rounded-lg text-xs font-medium transition-colors ${
                    role === key
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Montant vente (EUR)
              </label>
              <input
                type="number"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Taux (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                min="0"
                max="100"
                step="0.5"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Commission</span>
            </div>
            <span className="text-lg font-semibold text-foreground">
              {formatCurrency(commissionAmount, currency)}
            </span>
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
            onClick={() =>
              onAdd({
                contractor_id: contractorId,
                contractor_role: role,
                sale_amount: saleAmountNum,
                commission_rate: rateNum,
                commission_amount: commissionAmount,
              })
            }
            disabled={!contractorId || saleAmountNum <= 0 || isPending}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
