"use client";

import { useState } from "react";
import { usePaymentSchedules } from "@/hooks/use-invoices";
import { useStudents } from "@/hooks/use-students";
import {
  FREQUENCY_LABELS,
  type PaymentFrequency,
  type PaymentScheduleInstallment,
} from "@/types/billing";
import { formatCurrency } from "@/lib/utils";
import { useUserCurrency, useConvertCurrency } from "@/hooks/use-currency";
import { CurrencySelector } from "@/components/ui/currency-selector";
import {
  Plus,
  X,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export function PaymentScheduleView() {
  const { schedules, isLoading, createSchedule, updateInstallmentStatus } =
    usePaymentSchedules();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currency = useUserCurrency();
  const convert = useConvertCurrency();
  const fmt = (amount: number) =>
    formatCurrency(convert(amount, "EUR", currency), currency);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Echeanciers de paiement
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suivi des paiements en plusieurs fois
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <CurrencySelector />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nouvel echeancier
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun echeancier de paiement
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => {
            const installments =
              (schedule.installment_details as
                | PaymentScheduleInstallment[]
                | null) ?? [];
            const paidCount = installments.filter(
              (i) => i.status === "paid",
            ).length;
            const totalInstallments = schedule.installments;
            const progress =
              totalInstallments > 0
                ? Math.round((paidCount / totalInstallments) * 100)
                : 0;

            return (
              <div
                key={schedule.id}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                {/* Schedule header */}
                <div className="p-5 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {schedule.client?.full_name ?? "Client"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {FREQUENCY_LABELS[
                          schedule.frequency as PaymentFrequency
                        ] ?? schedule.frequency}{" "}
                        - {schedule.installments} echeance
                        {schedule.installments !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">
                        {fmt(schedule.total_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paidCount}/{totalInstallments} payee
                        {paidCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Installments timeline */}
                {installments.length > 0 && (
                  <div className="divide-y divide-border">
                    {installments.map((inst) => (
                      <div
                        key={inst.index}
                        className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {inst.status === "paid" ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : inst.status === "overdue" ? (
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm text-foreground">
                              Echeance {inst.index}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(inst.due_date).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-foreground">
                            {fmt(inst.amount)}
                          </span>
                          {inst.status === "paid" ? (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                              Paye
                              {inst.paid_at &&
                                ` le ${new Date(inst.paid_at).toLocaleDateString("fr-FR")}`}
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                updateInstallmentStatus.mutate(
                                  {
                                    scheduleId: schedule.id,
                                    installmentIndex: inst.index,
                                    status: "paid",
                                  },
                                  {
                                    onSuccess: () =>
                                      toast.success(
                                        `Echeance ${inst.index} marquee comme payee`,
                                      ),
                                  },
                                )
                              }
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                            >
                              Marquer paye
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateScheduleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            createSchedule.mutate(data, {
              onSuccess: () => {
                setShowCreateModal(false);
                toast.success("Echeancier cree");
              },
            });
          }}
          isPending={createSchedule.isPending}
        />
      )}
    </div>
  );
}

function CreateScheduleModal({
  onClose,
  onCreate,
  isPending,
}: {
  onClose: () => void;
  onCreate: (data: {
    client_id: string;
    total_amount: number;
    installments: number;
    frequency: string;
    start_date: string;
    installment_details: PaymentScheduleInstallment[];
  }) => void;
  isPending: boolean;
}) {
  const { students: clients } = useStudents();
  const currency = useUserCurrency();
  const convert = useConvertCurrency();
  const fmt = (amount: number) =>
    formatCurrency(convert(amount, "EUR", currency), currency);
  const [clientId, setClientId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installmentCount, setInstallmentCount] = useState("3");
  const [frequency, setFrequency] = useState<PaymentFrequency>("monthly");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const totalAmountNum = parseFloat(totalAmount) || 0;
  const instCount = parseInt(installmentCount) || 1;
  const perInstallment =
    instCount > 0 ? Math.round((totalAmountNum / instCount) * 100) / 100 : 0;

  // Generate installment preview
  const generateInstallments = (): PaymentScheduleInstallment[] => {
    const installments: PaymentScheduleInstallment[] = [];
    const start = new Date(startDate);
    let remaining = totalAmountNum;

    for (let i = 1; i <= instCount; i++) {
      const dueDate = new Date(start);
      switch (frequency) {
        case "weekly":
          dueDate.setDate(dueDate.getDate() + (i - 1) * 7);
          break;
        case "biweekly":
          dueDate.setDate(dueDate.getDate() + (i - 1) * 14);
          break;
        case "monthly":
        default:
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          break;
      }

      const amount =
        i === instCount ? Math.round(remaining * 100) / 100 : perInstallment;
      remaining -= amount;

      installments.push({
        index: i,
        amount,
        due_date: dueDate.toISOString().split("T")[0],
        status: "pending",
        paid_at: null,
      });
    }

    return installments;
  };

  const previewInstallments = generateInstallments();

  const handleCreate = () => {
    if (!clientId || totalAmountNum <= 0) return;
    onCreate({
      client_id: clientId,
      total_amount: totalAmountNum,
      installments: instCount,
      frequency,
      start_date: startDate,
      installment_details: previewInstallments,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto m-4">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Nouvel echeancier
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Montant total (EUR)
              </label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                min="0"
                step="0.01"
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Nombre d&apos;echeances
              </label>
              <select
                value={installmentCount}
                onChange={(e) => setInstallmentCount(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {[1, 2, 3, 4, 6, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n}x
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Frequence
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(e.target.value as PaymentFrequency)
                }
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {(
                  Object.entries(FREQUENCY_LABELS) as [
                    PaymentFrequency,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date de debut
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Preview */}
          {totalAmountNum > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Apercu des echeances
                </p>
                <p className="text-sm text-muted-foreground">
                  {fmt(perInstallment)} / echeance
                </p>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {previewInstallments.map((inst) => (
                  <div
                    key={inst.index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                        {inst.index}
                      </span>
                      <span className="text-xs text-foreground">
                        {new Date(inst.due_date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-foreground">
                      {fmt(inst.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            disabled={!clientId || totalAmountNum <= 0 || isPending}
            className="h-10 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Creation..." : "Creer l'echeancier"}
          </button>
        </div>
      </div>
    </div>
  );
}
