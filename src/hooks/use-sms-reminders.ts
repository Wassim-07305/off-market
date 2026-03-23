"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface SmsReminder {
  id: string;
  user_id: string;
  recipient_phone: string;
  message: string;
  scheduled_at: string;
  sent_at: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  related_type: "call" | "coaching" | "payment" | null;
  related_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface SmsReminderFilters {
  status?: SmsReminder["status"];
  relatedType?: SmsReminder["related_type"];
  relatedId?: string;
}

// Helper to access the untyped sms_reminders table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function smsTable(supabase: ReturnType<typeof useSupabase>) {
  return supabase.from("sms_reminders" as any);
}

export function useSmsReminders(filters?: SmsReminderFilters) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sms-reminders", filters],
    enabled: !!user,
    queryFn: async () => {
      let query = smsTable(supabase)
        .select("*")
        .order("scheduled_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.relatedType) {
        query = query.eq("related_type", filters.relatedType);
      }
      if (filters?.relatedId) {
        query = query.eq("related_id", filters.relatedId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SmsReminder[];
    },
  });
}

export function useCreateSmsReminder() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminder: {
      recipient_phone: string;
      message: string;
      scheduled_at: string;
      related_type?: "call" | "coaching" | "payment";
      related_id?: string;
    }) => {
      if (!user) throw new Error("Non authentifié");

      // Normalise le numéro au format international
      let phone = reminder.recipient_phone.replace(/[^\d+]/g, "");
      if (phone.startsWith("0") && !phone.startsWith("00")) {
        phone = "+33" + phone.slice(1);
      } else if (phone.startsWith("00")) {
        phone = "+" + phone.slice(2);
      } else if (!phone.startsWith("+")) {
        phone = "+" + phone;
      }

      const { data, error } = await smsTable(supabase)
        .insert({
          user_id: user.id,
          recipient_phone: phone,
          message: reminder.message,
          scheduled_at: reminder.scheduled_at,
          related_type: reminder.related_type ?? null,
          related_id: reminder.related_id ?? null,
          status: "pending",
        } as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .select()
        .single();

      if (error) throw error;
      return data as unknown as SmsReminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-reminders"] });
      toast.success("Rappel SMS programme");
    },
    onError: () => {
      toast.error("Erreur lors de la creation du rappel SMS");
    },
  });
}

export function useCancelSmsReminder() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (smsTable(supabase) as any)
        .update({ status: "cancelled" })
        .eq("id", reminderId)
        .eq("status", "pending");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sms-reminders"] });
      toast.success("Rappel SMS annule");
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation du rappel");
    },
  });
}

export function useSmsStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sms-reminders-stats"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await smsTable(supabase).select("status");

      if (error) throw error;

      const stats = {
        pending: 0,
        sent: 0,
        failed: 0,
        cancelled: 0,
        total: 0,
      };

      for (const row of (data ?? []) as Array<{ status: string }>) {
        const s = row.status as keyof typeof stats;
        if (s in stats) stats[s]++;
        stats.total++;
      }

      return stats;
    },
  });
}
