"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { useInvoices } from "@/hooks/use-invoices";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Ban,
} from "lucide-react";
import type { InvoiceStatus } from "@/types/billing";

const STATUS_CONFIG: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "secondary";
    icon: typeof FileText;
  }
> = {
  draft: { label: "Brouillon", variant: "secondary", icon: FileText },
  sent: { label: "Envoyee", variant: "default", icon: Send },
  paid: { label: "Payee", variant: "success", icon: CheckCircle },
  overdue: { label: "En retard", variant: "destructive", icon: AlertCircle },
  partial: { label: "Partielle", variant: "warning", icon: Clock },
  cancelled: { label: "Annulee", variant: "secondary", icon: Ban },
  refunded: { label: "Remboursee", variant: "secondary", icon: Ban },
};

export function InvoicesTab() {
  const { invoices, isLoading } = useInvoices();

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                N Facture
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Client
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Montant HT
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                TVA
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total TTC
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Echeance
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Chargement...
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Aucune facture
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                const statusCfg =
                  STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.draft;
                return (
                  <tr
                    key={inv.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground font-mono text-xs">
                      {inv.invoice_number || "—"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {inv.client?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCfg.variant}>
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {formatCurrency(inv.tax)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {formatDate(inv.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
