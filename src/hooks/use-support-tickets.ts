"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface SupportTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: "bug" | "feature" | "question" | "autre";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  page_url: string | null;
  user_agent: string | null;
  screenshot_url: string | null;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  title: string;
  description: string;
  category: SupportTicket["category"];
  priority: SupportTicket["priority"];
  page_url?: string;
}

export function useSupportTickets() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["support-tickets"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SupportTicket[];
    },
  });
}

export function useCreateTicket() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTicketData) => {
      if (!user) throw new Error("Non authentifié");

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur");
      return json as SupportTicket;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket envoyé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi du ticket");
    },
  });
}

export function useUpdateTicket() {
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<SupportTicket> & { id: string }) => {
      const { error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      toast.success("Ticket mis à jour");
    },
  });
}
