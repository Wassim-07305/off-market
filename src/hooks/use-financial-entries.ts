"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────

export interface FinancialEntry {
  id: string;
  client_id: string | null;
  type: "ca" | "récurrent" | "charge" | "prestataire";
  label: string;
  amount: number;
  prestataire: string | null;
  is_paid: boolean;
  date: string;
  recurrence: "mensuel" | "trimestriel" | "annuel" | null;
  currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface FinancialEntryRow {
  type: string;
  amount: number;
  is_paid: boolean;
  date: string;
  recurrence: string | null;
}

export interface FinancialEntryFilters {
  clientId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  isPaid?: boolean;
}

export interface FinancialKPIs {
  caTotal: number;
  newCash: number;
  mrr: number;
  chargesTotales: number;
  marge: number;
}

// Helper to bypass Supabase strict typing for untyped tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromTable(
  supabase: ReturnType<typeof useSupabase>,
  table: string,
): any {
  return supabase.from(table);
}

// ─── List entries with filters ─────────────

export function useFinancialEntries(filters: FinancialEntryFilters = {}) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial-entries", filters],
    enabled: !!user,
    queryFn: async () => {
      // Try with client join first, fallback without if FK doesn't exist
      let data: unknown[] | null = null;
      let error: { message: string } | null = null;

      const buildQuery = (selectStr: string) => {
        let q = fromTable(supabase, "financial_entries")
          .select(selectStr)
          .order("date", { ascending: false });
        if (filters.clientId) q = q.eq("client_id", filters.clientId);
        if (filters.type) q = q.eq("type", filters.type);
        if (filters.dateFrom) q = q.gte("date", filters.dateFrom);
        if (filters.dateTo) q = q.lte("date", filters.dateTo);
        if (filters.isPaid !== undefined) q = q.eq("is_paid", filters.isPaid);
        return q;
      };

      const res1 = await buildQuery(
        "*, client:profiles!financial_entries_client_id_fkey(id, full_name, email, avatar_url)",
      );

      if (res1.error) {
        // FK or client_id column doesn't exist — fetch without join
        const res2 = await buildQuery("*");
        data = res2.data;
        error = res2.error;
      } else {
        data = res1.data;
        error = res1.error;
      }
      if (error) throw error;
      return (data ?? []) as FinancialEntry[];
    },
  });
}

// ─── Create entry ─────────────────────────

export function useCreateEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (entry: {
      client_id?: string | null;
      type: string;
      label: string;
      amount: number;
      prestataire?: string;
      is_paid?: boolean;
      date: string;
      recurrence?: string | null;
    }) => {
      const { data, error } = await fromTable(supabase, "financial_entries")
        .insert({ ...entry, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as FinancialEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["financial-kpis"] });
      toast.success("Entree ajoutee avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de l'entree");
    },
  });
}

// ─── Update entry ─────────────────────────

export function useUpdateEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<FinancialEntry> & { id: string }) => {
      const { error } = await fromTable(supabase, "financial_entries")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["financial-kpis"] });
      toast.success("Entree mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

// ─── Delete entry ─────────────────────────

export function useDeleteEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await fromTable(supabase, "financial_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["financial-kpis"] });
      toast.success("Entree supprimee");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// ─── Toggle paid status ───────────────────

export function useTogglePaid() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_paid }: { id: string; is_paid: boolean }) => {
      const { error } = await fromTable(supabase, "financial_entries")
        .update({ is_paid, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-entries"] });
      queryClient.invalidateQueries({ queryKey: ["financial-kpis"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut");
    },
  });
}

// ─── KPIs ─────────────────────────────────

export function useFinancialKPIs() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial-kpis"],
    enabled: !!user,
    queryFn: async (): Promise<FinancialKPIs> => {
      const { data, error } = await fromTable(
        supabase,
        "financial_entries",
      ).select("type, amount, is_paid, date, recurrence");
      if (error) throw error;

      const entries = (data ?? []) as FinancialEntryRow[];

      // CA Total = sum of all CA + recurring entries (paid)
      const caTotal = entries
        .filter((e) => (e.type === "ca" || e.type === "récurrent") && e.is_paid)
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

      // New Cash = CA entries paid this month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const newCash = entries
        .filter(
          (e) =>
            (e.type === "ca" || e.type === "récurrent") &&
            e.is_paid &&
            e.date >= startOfMonth,
        )
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

      // MRR = sum of monthly recurring entries
      const mrr = entries
        .filter((e) => e.recurrence === "mensuel" && e.is_paid)
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

      // Charges totales = sum of all charge + prestataire entries
      const chargesTotales = entries
        .filter((e) => e.type === "charge" || e.type === "prestataire")
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

      // Marge = ((CA - Charges) / CA * 100)%
      const marge =
        caTotal > 0
          ? Math.round(((caTotal - chargesTotales) / caTotal) * 100)
          : 0;

      return { caTotal, newCash, mrr, chargesTotales, marge };
    },
  });
}

// ─── Profiles for client dropdown ─────────

export function useClientProfiles() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-profiles-for-finance"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, role")
        .in("role", ["client", "coach", "admin"])
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        role: string;
      }[];
    },
  });
}
