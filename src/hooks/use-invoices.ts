"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  Invoice,
  InvoiceStatus,
  PaymentSchedule,
  BillingStats,
} from "@/types/billing";

interface UseInvoicesOptions {
  status?: InvoiceStatus;
  clientId?: string;
  limit?: number;
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { status, clientId, limit = 50 } = options;

  const invoicesQuery = useQuery({
    queryKey: ["invoices", status, clientId, limit],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select("*, client:profiles(id, full_name, email, avatar_url), contract:contracts(id, title)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query.returns<Invoice[]>();
      if (error) throw error;
      return (data ?? []) as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: {
      contract_id?: string;
      client_id: string;
      amount: number;
      tax: number;
      tax_rate?: number;
      total: number;
      due_date?: string;
      notes?: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...invoice,
          invoice_number: "",
          tax_rate: invoice.tax_rate ?? 20,
        } as never) // trigger generates number
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création de la facture");
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Invoice> & { id: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la facture");
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
    },
    onError: () => {
      toast.error("Erreur lors du marquage comme payé");
    },
  });

  const sendInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "sent" } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de la facture");
    },
  });

  return {
    invoices: invoicesQuery.data ?? [],
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    createInvoice,
    updateInvoice,
    markAsPaid,
    sendInvoice,
  };
}

export function useInvoice(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "*, client:profiles!invoices_client_id_fkey(id, full_name, email, avatar_url), contract:contracts(id, title)",
        )
        .eq("id", id)
        .returns<Invoice[]>()
        .single();
      if (error) throw error;
      return data as unknown as Invoice;
    },
    enabled: !!id,
  });
}

export function useBillingStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["billing-stats"],
    enabled: !!user,
    queryFn: async () => {
      const [invoicesRes, contractsRes] = await Promise.all([
        supabase.from("invoices").select("status, total").returns<{ status: string; total: number }[]>(),
        supabase.from("contracts").select("status").returns<{ status: string }[]>(),
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (contractsRes.error) throw contractsRes.error;

      const invoices = invoicesRes.data ?? [];
      const contracts = contractsRes.data ?? [];

      const stats: BillingStats = {
        // CA = only paid invoices (real money received)
        totalRevenue: invoices
          .filter((i) => i.status === "paid")
          .reduce((sum, i) => sum + Number(i.total), 0),
        pendingAmount: invoices
          .filter((i) => i.status === "sent")
          .reduce((sum, i) => sum + Number(i.total), 0),
        overdueAmount: invoices
          .filter((i) => i.status === "overdue")
          .reduce((sum, i) => sum + Number(i.total), 0),
        contractsSigned: contracts.filter((c) => c.status === "signed").length,
        contractsPending: contracts.filter(
          (c) => c.status === "sent" || c.status === "draft",
        ).length,
        invoicesPaid: invoices.filter((i) => i.status === "paid").length,
        invoicesOverdue: invoices.filter((i) => i.status === "overdue").length,
      };

      return stats;
    },
  });
}

export function usePaymentSchedules(clientId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const schedulesQuery = useQuery({
    queryKey: ["payment-schedules", clientId],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("payment_schedules")
        .select(
          "*, client:profiles!payment_schedules_client_id_fkey(id, full_name)",
        )
        .order("created_at", { ascending: false });

      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query.returns<PaymentSchedule[]>();
      if (error) throw error;
      return (data ?? []) as PaymentSchedule[];
    },
  });

  const createSchedule = useMutation({
    mutationFn: async (schedule: {
      contract_id?: string;
      client_id: string;
      total_amount: number;
      installments: number;
      frequency: string;
      start_date: string;
    }) => {
      const { data, error } = await supabase
        .from("payment_schedules")
        .insert(schedule as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as PaymentSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'échéancier");
    },
  });

  const updateInstallmentStatus = useMutation({
    mutationFn: async ({
      scheduleId,
      installmentIndex,
      status,
    }: {
      scheduleId: string;
      installmentIndex: number;
      status: "pending" | "paid" | "overdue";
    }) => {
      // Get current schedule
      const { data: schedule, error: fetchError } = await supabase
        .from("payment_schedules")
        .select("installment_details")
        .eq("id", scheduleId)
        .returns<{ installment_details: Array<Record<string, unknown>> }[]>()
        .single();
      if (fetchError) throw fetchError;

      const details =
        (schedule?.installment_details as Array<Record<string, unknown>>) ?? [];
      if (details[installmentIndex]) {
        details[installmentIndex].status = status;
        if (status === "paid") {
          details[installmentIndex].paid_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from("payment_schedules")
        .update({ installment_details: details } as never)
        .eq("id", scheduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de l'échéance");
    },
  });

  return {
    schedules: schedulesQuery.data ?? [],
    isLoading: schedulesQuery.isLoading,
    createSchedule,
    updateInstallmentStatus,
  };
}

// ─── Financial Dashboard ────────────────

type InvoicePartial = { status: string; total: number; created_at?: string; paid_at?: string };

export function useFinancialDashboard() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial-dashboard"],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      ).toISOString();
      const endOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
      ).toISOString();

      const [currentRes, lastRes, allRes] = await Promise.all([
        supabase
          .from("invoices")
          .select("status, total, paid_at")
          .gte("created_at", startOfMonth)
          .returns<InvoicePartial[]>(),
        supabase
          .from("invoices")
          .select("status, total")
          .gte("created_at", startOfLastMonth)
          .lte("created_at", endOfLastMonth)
          .returns<InvoicePartial[]>(),
        supabase.from("invoices").select("status, total, created_at, paid_at").returns<InvoicePartial[]>(),
      ]);

      if (currentRes.error) throw currentRes.error;
      if (lastRes.error) throw lastRes.error;
      if (allRes.error) throw allRes.error;

      const currentMonthRevenue = (currentRes.data ?? [])
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.total), 0);

      const lastMonthRevenue = (lastRes.data ?? [])
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.total), 0);

      const totalRevenue = (allRes.data ?? [])
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.total), 0);

      const pendingAmount = (allRes.data ?? [])
        .filter((i) => i.status === "sent" || i.status === "overdue")
        .reduce((sum, i) => sum + Number(i.total), 0);

      return {
        currentMonthRevenue,
        lastMonthRevenue,
        totalRevenue,
        pendingAmount,
        invoiceCount: allRes.data?.length ?? 0,
        paidCount: (allRes.data ?? []).filter((i) => i.status === "paid")
          .length,
        overdueCount: (allRes.data ?? []).filter((i) => i.status === "overdue")
          .length,
        monthlyData: allRes.data ?? [],
      };
    },
  });
}
