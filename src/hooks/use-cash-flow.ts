"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface CashFlowMonth {
  month: string; // "Jan", "Fev", etc.
  key: string; // "2026-03"
  invoiced: number;
  collected: number;
}

/**
 * Returns monthly cash flow data: invoiced (all invoices) vs collected (paid only).
 * Last 12 months.
 */
export function useCashFlow() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cash-flow-chart"],
    enabled: !!user,
    queryFn: async (): Promise<CashFlowMonth[]> => {
      const now = new Date();
      const twelveMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 11,
        1,
      );

      const { data } = await supabase
        .from("invoices")
        .select("total, status, paid_at, created_at")
        .gte("created_at", twelveMonthsAgo.toISOString());

      const invoices = (data ?? []) as {
        total: number;
        status: string;
        paid_at: string | null;
        created_at: string;
      }[];

      const months = [
        "Jan",
        "Fev",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Aout",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Initialize 12 months
      const monthKeys: string[] = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthKeys.push(key);
      }

      const invoicedMap: Record<string, number> = {};
      const collectedMap: Record<string, number> = {};
      for (const key of monthKeys) {
        invoicedMap[key] = 0;
        collectedMap[key] = 0;
      }

      for (const inv of invoices) {
        // Invoiced: based on created_at
        const createdDate = new Date(inv.created_at);
        const createdKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, "0")}`;
        if (createdKey in invoicedMap) {
          invoicedMap[createdKey] += Number(inv.total ?? 0);
        }

        // Collected: based on paid_at for paid invoices
        if (inv.status === "paid" && inv.paid_at) {
          const paidDate = new Date(inv.paid_at);
          const paidKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, "0")}`;
          if (paidKey in collectedMap) {
            collectedMap[paidKey] += Number(inv.total ?? 0);
          }
        }
      }

      return monthKeys.map((key) => {
        const [, monthStr] = key.split("-");
        const monthIdx = parseInt(monthStr, 10) - 1;
        return {
          month: months[monthIdx],
          key,
          invoiced: Math.round(invoicedMap[key]),
          collected: Math.round(collectedMap[key]),
        };
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
