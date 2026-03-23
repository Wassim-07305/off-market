"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface ClientLTV {
  clientId: string;
  fullName: string;
  avatarUrl: string | null;
  ltv: number;
  monthsActive: number;
  avgMonthlyRevenue: number;
}

/**
 * Get LTV ranking for all clients (admin).
 * Computes LTV from paid invoices grouped by client.
 */
export function useLTVRanking(limit = 20) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ltv-ranking", limit],
    enabled: !!user,
    queryFn: async (): Promise<ClientLTV[]> => {
      // Fetch all paid invoices with client info
      interface InvoiceWithClient {
        total: number;
        paid_at: string | null;
        client_id: string;
        client: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        } | null;
      }

      const { data } = await supabase
        .from("invoices")
        .select(
          "total, paid_at, client_id, client:profiles!invoices_client_id_fkey(id, full_name, avatar_url, created_at)",
        )
        .eq("status", "paid");

      const invoices = (data ?? []) as unknown as InvoiceWithClient[];
      if (!invoices.length) return [];

      // Group by client
      const clientMap = new Map<
        string,
        {
          fullName: string;
          avatarUrl: string | null;
          createdAt: string;
          totalPaid: number;
          firstPayment: string;
          lastPayment: string;
        }
      >();

      for (const inv of invoices) {
        const clientId = inv.client_id;
        const client = inv.client as {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
        } | null;
        if (!clientId || !client) continue;

        const existing = clientMap.get(clientId);
        const paidAt = inv.paid_at ?? inv.client?.created_at ?? "";

        if (existing) {
          existing.totalPaid += Number(inv.total ?? 0);
          if (paidAt < existing.firstPayment) existing.firstPayment = paidAt;
          if (paidAt > existing.lastPayment) existing.lastPayment = paidAt;
        } else {
          clientMap.set(clientId, {
            fullName: client.full_name,
            avatarUrl: client.avatar_url,
            createdAt: client.created_at,
            totalPaid: Number(inv.total ?? 0),
            firstPayment: paidAt,
            lastPayment: paidAt,
          });
        }
      }

      const now = new Date();
      const results: ClientLTV[] = [];

      for (const [clientId, data] of clientMap) {
        const startDate = new Date(data.createdAt);
        const monthsActive = Math.max(
          1,
          Math.ceil(
            (now.getTime() - startDate.getTime()) /
              (30.44 * 24 * 60 * 60 * 1000),
          ),
        );

        results.push({
          clientId,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
          ltv: Math.round(data.totalPaid),
          monthsActive,
          avgMonthlyRevenue: Math.round(data.totalPaid / monthsActive),
        });
      }

      return results.sort((a, b) => b.ltv - a.ltv).slice(0, limit);
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get LTV for a single client.
 */
export function useClientLTV(clientId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["client-ltv", clientId],
    enabled: !!clientId,
    queryFn: async (): Promise<ClientLTV | null> => {
      const [invoicesRes, profileRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("total, paid_at")
          .eq("client_id", clientId)
          .eq("status", "paid"),
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url, created_at")
          .eq("id", clientId)
          .single(),
      ]);

      const profile = profileRes.data as {
        id: string;
        full_name: string;
        avatar_url: string | null;
        created_at: string;
      } | null;
      const invoices = (invoicesRes.data ?? []) as {
        total: number;
        paid_at: string | null;
      }[];

      if (!profile) return null;

      const totalPaid = invoices.reduce(
        (sum, inv) => sum + Number(inv.total ?? 0),
        0,
      );

      const now = new Date();
      const startDate = new Date(profile.created_at);
      const monthsActive = Math.max(
        1,
        Math.ceil(
          (now.getTime() - startDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000),
        ),
      );

      return {
        clientId,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        ltv: Math.round(totalPaid),
        monthsActive,
        avgMonthlyRevenue: Math.round(totalPaid / monthsActive),
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
