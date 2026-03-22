"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { PaymentReminder } from "@/types/billing";

export function usePaymentReminders(invoiceId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const remindersQuery = useQuery({
    queryKey: ["payment-reminders", invoiceId],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("payment_reminders")
        .select("*")
        .order("scheduled_at", { ascending: true });

      if (invoiceId) query = query.eq("invoice_id", invoiceId);

      const { data, error } = await query;
      if (error) throw error;
      return data as PaymentReminder[];
    },
  });

  const markAsSent = useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from("payment_reminders")
        .update({ sent_at: new Date().toISOString() })
        .eq("id", reminderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-reminders"] });
    },
  });

  const reminders = remindersQuery.data ?? [];

  // Pending reminders (not sent yet & scheduled_at <= now)
  const pendingReminders = reminders.filter(
    (r) => !r.sent_at && new Date(r.scheduled_at) <= new Date(),
  );

  // Upcoming reminders (not sent yet & scheduled_at > now)
  const upcomingReminders = reminders.filter(
    (r) => !r.sent_at && new Date(r.scheduled_at) > new Date(),
  );

  return {
    reminders,
    pendingReminders,
    upcomingReminders,
    isLoading: remindersQuery.isLoading,
    markAsSent,
  };
}

export const REMINDER_LABELS: Record<
  string,
  { label: string; severity: string }
> = {
  "j-3": { label: "3 jours avant echeance", severity: "text-blue-500" },
  j0: { label: "Jour d'echeance", severity: "text-amber-500" },
  "j+3": { label: "3 jours de retard", severity: "text-orange-500" },
  "j+7": { label: "7 jours de retard", severity: "text-red-500" },
  "j+14": {
    label: "14 jours de retard",
    severity: "text-red-600",
  },
  "j+21": {
    label: "21 jours de retard — relance finale",
    severity: "text-red-700",
  },
};
