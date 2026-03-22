/**
 * Compatibility re-exports — the canonical hook lives in use-notifications.ts.
 * This file exists so that legacy imports from "@/hooks/useNotifications" keep working.
 */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";

export { useNotifications } from "./use-notifications";

/**
 * Standalone mutation hook to mark a single notification as read.
 * Used by NotificationsPanel and NotificationDropdown.
 */
export function useMarkAsRead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: now } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Standalone mutation hook to mark all notifications as read for a user.
 */
export function useMarkAllAsRead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: now } as never)
        .eq("recipient_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
