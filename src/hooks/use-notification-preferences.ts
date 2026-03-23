"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  NotificationPreferences,
  NotificationPriority,
} from "@/types/database";

/**
 * Fetch the current user's notification preferences.
 * Auto-creates a row if none exists (upsert on first access).
 */
export function useNotificationPreferences() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notification-preferences", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      // Try to fetch existing preferences
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      // Auto-create if none exists
      if (!data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: created, error: createError } = await (supabase as any)
          .from("notification_preferences")
          .upsert({ user_id: user!.id })
          .select()
          .single();

        if (createError) throw createError;
        return created as NotificationPreferences;
      }

      return data as NotificationPreferences;
    },
  });
}

/**
 * Mutation to update notification preferences.
 */
export function useUpdateNotificationPreferences() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<
        Pick<
          NotificationPreferences,
          | "quiet_hours_start"
          | "quiet_hours_end"
          | "batch_frequency"
          | "priority_threshold"
          | "email_digest"
          | "push_enabled"
        >
      >,
    ) => {
      if (!user?.id) throw new Error("Non authentifie");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notification-preferences", user?.id],
      });
      toast.success("Preferences mises a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour des preferences");
    },
  });
}

/**
 * Determines whether a notification of a given priority should be
 * shown right now, based on the user's preferences (quiet hours, DND,
 * batch settings, priority threshold).
 */
export function useShouldShowNotification() {
  const { data: prefs } = useNotificationPreferences();

  return (priority: NotificationPriority): boolean => {
    if (!prefs) return true; // Default: show everything

    // Critical notifications always show
    if (priority === "critical") return true;

    // Check priority threshold
    if (prefs.priority_threshold === "critical") return false;
    if (prefs.priority_threshold === "high") {
      if (priority !== "high") return false;
    }

    // Check batch frequency: if not instant, suppress real-time display
    if (prefs.batch_frequency !== "instant") return false;

    // Check quiet hours
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const start = prefs.quiet_hours_start;
    const end = prefs.quiet_hours_end;

    // Handle overnight quiet hours (e.g., 22:00 -> 08:00)
    if (start > end) {
      // Quiet if current >= start OR current < end
      if (currentTime >= start || currentTime < end) return false;
    } else {
      // Quiet if current >= start AND current < end
      if (currentTime >= start && currentTime < end) return false;
    }

    return true;
  };
}
