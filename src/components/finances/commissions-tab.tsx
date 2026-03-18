"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import {
  COMMISSION_ROLE_LABELS,
  type Commission,
  type CommissionStatus,
} from "@/types/billing";

const STATUS_LABELS: Record<
  CommissionStatus,
  {
    label: string;
    variant: "default" | "success" | "destructive" | "secondary";
  }
> = {
  pending: { label: "En attente", variant: "secondary" },
  paid: { label: "Payee", variant: "success" },
  cancelled: { label: "Annulee", variant: "destructive" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromTable(
  supabase: ReturnType<typeof useSupabase>,
  table: string,
): any {
  return supabase.from(table);
}

function useCommissions() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["commissions"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await fromTable(supabase, "commissions")
        .select(
          "*, contractor:profiles!commissions_contractor_id_fkey(id, full_name, email)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Commission[];
    },
  });
}

export function CommissionsTab() {
  const { data: commissions = [], isLoading } = useCommissions();

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Collaborateur
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Vente
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Taux
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Commission
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
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
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Chargement...
                </td>
              </tr>
            ) : commissions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Coins className="w-8 h-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      Aucune commission
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              commissions.map((c) => {
                const statusCfg =
                  STATUS_LABELS[c.status] ?? STATUS_LABELS.pending;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.contractor?.full_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">
                        {COMMISSION_ROLE_LABELS[c.contractor_role] ??
                          c.contractor_role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatCurrency(c.sale_amount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {Math.round(c.commission_rate * 100)}%
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(c.commission_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusCfg.variant}>
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {formatDate(c.created_at)}
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
