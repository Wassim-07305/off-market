"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  ClientFlag,
  ClientFlagValue,
  ClientFlagHistoryEntry,
} from "@/types/roadmap";

// ─── Single client flag ──────────────────────────────────────

export function useClientFlag(clientId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  return useQuery({
    queryKey: ["client-flag", effectiveClientId],
    enabled: !!effectiveClientId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("client_flags")
        .select(
          "*, client:profiles!client_flags_client_id_fkey(id, full_name, avatar_url), changer:profiles!client_flags_changed_by_fkey(id, full_name)",
        )
        .eq("client_id", effectiveClientId!)
        .maybeSingle();

      if (error) throw error;
      return data as ClientFlag | null;
    },
  });
}

// ─── Set / update client flag ────────────────────────────────

const FLAG_LABELS: Record<ClientFlagValue, string> = {
  green: "Vert",
  orange: "Orange",
  red: "Rouge",
};

export function useSetClientFlag() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientId,
      flag,
      reason,
    }: {
      clientId: string;
      flag: ClientFlagValue;
      reason?: string;
    }): Promise<{
      clientId: string;
      oldFlag: ClientFlagValue | null;
      newFlag: ClientFlagValue;
      reason?: string;
    }> => {
      if (!user) throw new Error("Non authentifie");

      // Fetch current flag before updating (for notification)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: currentFlag } = await (supabase as any)
        .from("client_flags")
        .select("id, flag")
        .eq("client_id", clientId)
        .maybeSingle();

      const oldFlag = (currentFlag?.flag as ClientFlagValue) ?? null;

      if (currentFlag) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from("client_flags")
          .update({
            flag,
            reason: reason ?? null,
            changed_by: user.id,
            notified: false,
          })
          .eq("client_id", clientId);
        if (error) throw error;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any).from("client_flags").insert({
          client_id: clientId,
          flag,
          reason: reason ?? null,
          changed_by: user.id,
        });
        if (error) throw error;
      }

      return { clientId, oldFlag, newFlag: flag, reason };
    },
    onSuccess: async (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-flag", variables.clientId],
      });
      queryClient.invalidateQueries({ queryKey: ["flagged-clients"] });
      queryClient.invalidateQueries({
        queryKey: ["client-flag-history", variables.clientId],
      });
      toast.success("Drapeau mis a jour");

      // ── Auto-notifications on flag change ──────────────────────
      if (!result || result.oldFlag === result.newFlag) return;

      try {
        // Fetch student name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: studentProfile } = await (supabase as any)
          .from("profiles")
          .select("full_name")
          .eq("id", result.clientId)
          .single();

        const studentName = studentProfile?.full_name ?? "Client";
        const oldLabel = result.oldFlag ? FLAG_LABELS[result.oldFlag] : "Aucun";
        const newLabel = FLAG_LABELS[result.newFlag];
        const reasonSuffix = result.reason ? ` — ${result.reason}` : "";
        const title = `Drapeau change : ${studentName}`;
        const body = `${oldLabel} → ${newLabel}${reasonSuffix}`;
        const notifData = {
          student_id: result.clientId,
          old_flag: result.oldFlag,
          new_flag: result.newFlag,
        };

        // Fetch admin users
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: adminProfiles } = await (supabase as any)
          .from("profiles")
          .select("id")
          .eq("role", "admin");

        const adminIds = (adminProfiles ?? []).map((p: { id: string }) => p.id);

        // Fetch assigned coach for this client
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: assignment } = await (supabase as any)
          .from("coach_assignments")
          .select("coach_id")
          .eq("client_id", result.clientId)
          .eq("status", "active")
          .maybeSingle();

        const assignedCoachId = assignment?.coach_id as string | null;

        // Build notification inserts (deduplicate if admin is also the coach)
        const recipientIds = new Set<string>();
        adminIds.forEach((id: string) => recipientIds.add(id));
        if (assignedCoachId) recipientIds.add(assignedCoachId);

        // Don't notify the user who made the change
        recipientIds.delete(user!.id);

        if (recipientIds.size === 0) return;

        const notifications = Array.from(recipientIds).map((recipientId) => ({
          user_id: recipientId,
          type: "flag_change",
          title,
          body,
          data: notifData,
          category: "system",
          action_url: `/clients/${result.clientId}`,
          is_read: false,
          is_archived: false,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from("notifications").insert(notifications);
      } catch (err) {
        // Notification failure should not block the main mutation
        console.error("[FlagNotification] Error sending notifications:", err);
      }
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du drapeau");
    },
  });
}

// ─── All flagged clients (orange/red) ────────────────────────

export function useFlaggedClients() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flagged-clients"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("client_flags")
        .select(
          "*, client:profiles!client_flags_client_id_fkey(id, full_name, avatar_url, email), changer:profiles!client_flags_changed_by_fkey(id, full_name)",
        )
        .in("flag", ["orange", "red"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as ClientFlag[];
    },
  });
}

// ─── Flag history for a client ───────────────────────────────

export function useFlagHistory(clientId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["client-flag-history", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("client_flag_history")
        .select(
          "*, changer:profiles!client_flag_history_changed_by_fkey(id, full_name)",
        )
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ClientFlagHistoryEntry[];
    },
  });
}
