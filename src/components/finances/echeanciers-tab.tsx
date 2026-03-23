"use client";

import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { usePaymentSchedules } from "@/hooks/use-invoices";
import { Badge } from "@/components/ui/badge";
import { CalendarRange } from "lucide-react";
import {
  FREQUENCY_LABELS,
  type PaymentScheduleInstallment,
} from "@/types/billing";

function InstallmentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "paid":
      return <Badge variant="success">Paye</Badge>;
    case "overdue":
      return <Badge variant="destructive">En retard</Badge>;
    default:
      return <Badge variant="secondary">En attente</Badge>;
  }
}

export function EcheanciersTab() {
  const { schedules, isLoading } = usePaymentSchedules();

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center text-muted-foreground">
        Chargement...
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <CalendarRange className="w-8 h-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Aucun échéancier de paiement
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => {
        const installments = (schedule.installment_details ??
          []) as PaymentScheduleInstallment[];
        const paidCount = installments.filter(
          (i) => i.status === "paid",
        ).length;
        const progress =
          installments.length > 0
            ? Math.round((paidCount / installments.length) * 100)
            : 0;

        return (
          <div
            key={schedule.id}
            className="bg-surface border border-border rounded-2xl p-5 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {schedule.client?.full_name ?? "Client inconnu"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatCurrency(schedule.total_amount)} -{" "}
                  {schedule.installments} echeances (
                  {FREQUENCY_LABELS[schedule.frequency] ?? schedule.frequency})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {progress}%
                </span>
                <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Installments */}
            {installments.length > 0 && (
              <div className="grid gap-2">
                {installments.map((inst, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm",
                      inst.status === "paid"
                        ? "bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "bg-muted/30",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6">
                        #{idx + 1}
                      </span>
                      <span className="font-medium tabular-nums">
                        {formatCurrency(inst.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {inst.due_date ? formatDate(inst.due_date) : "—"}
                      </span>
                      <InstallmentStatusBadge status={inst.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
