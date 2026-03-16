import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Notification } from "@/types/database";
import { useNotificationStore } from "@/stores/notification-store";
import {
  playNotificationSound,
  getSoundTypeForNotification,
} from "@/lib/notification-sounds";
import { toast } from "sonner";
import { useDndMode } from "./use-dnd-mode";

export function useNotifications(userId: string | undefined) {
  const { setNotifications, setUnreadCount, addNotification } =
    useNotificationStore();
  const queryClient = useQueryClient();
  const prefsRef = useRef({ sound_enabled: true });
  const { isDnd } = useDndMode();

  const query = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  // Sync with store
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
      setUnreadCount(query.data.filter((n) => !n.is_read).length);
    }
  }, [query.data, setNotifications, setUnreadCount]);

  // Keep a ref to isDnd so the realtime callback reads the latest value
  const dndRef = useRef(isDnd);
  useEffect(() => {
    dndRef.current = isDnd;
  }, [isDnd]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          addNotification(notification);
          queryClient.invalidateQueries({
            queryKey: ["notifications", userId],
          });

          // Respect DND: still queue the notification but no toast or sound
          if (!dndRef.current) {
            toast.info(notification.title, {
              description: notification.body ?? undefined,
            });

            // Play differentiated notification sound
            if (prefsRef.current?.sound_enabled !== false) {
              const soundType = getSoundTypeForNotification(
                notification.type,
                notification.category,
              );
              playNotificationSound(soundType);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, addNotification, queryClient]);

  return query;
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: now, opened_at: now })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: now, opened_at: now })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Track a click on a notification (for analytics).
 */
export function useTrackNotificationClick() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("notifications")
        .update({ clicked_at: now })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
