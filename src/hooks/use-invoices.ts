"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Invoice, InvoiceStatus, PaymentSchedule, BillingStats } from "@/types/billing";

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
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select("*, client:profiles!invoices_client_id_fkey(id, full_name, email, avatar_url), contract:contracts(id, title)")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (status) query = query.eq("status", status);
      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const createInvoice = useMutation({
    mutationFn: async (invoice: {
      contract_id?: string;
      client_id: string;
      amount: number;
      tax: number;
      total: number;
      due_date?: string;
      notes?: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("invoices")
        .insert({ ...invoice, invoice_number: "" }) // trigger generates number
        .select()
        .single();
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["billing-stats"] });
    },
  });

  const sendInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
        .select("*, client:profiles!invoices_client_id_fkey(id, full_name, email, avatar_url), contract:contracts(id, title)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Invoice;
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
        supabase.from("invoices").select("status, total"),
        supabase.from("contracts").select("status"),
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (contractsRes.error) throw contractsRes.error;

      const invoices = invoicesRes.data as { status: string; total: number }[];
      const contracts = contractsRes.data as { status: string }[];

      const stats: BillingStats = {
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
        contractsPending: contracts.filter((c) => c.status === "sent" || c.status === "draft").length,
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
        .select("*, client:profiles!payment_schedules_client_id_fkey(id, full_name)")
        .order("created_at", { ascending: false });

      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentSchedule[];
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
        .insert(schedule)
        .select()
        .single();
      if (error) throw error;
      return data as PaymentSchedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });
    },
  });

  return {
    schedules: schedulesQuery.data ?? [],
    isLoading: schedulesQuery.isLoading,
    createSchedule,
  };
}
