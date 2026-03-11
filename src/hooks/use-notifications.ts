"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect } from "react";
import type { Notification, NotificationCategory } from "@/types/database";

interface UseNotificationsOptions {
  category?: NotificationCategory;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const category = options?.category;

  const notificationsQuery = useQuery({
    queryKey: ["notifications", { category }],
    queryFn: async () => {
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("recipient_id", user?.id ?? "")
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(100);

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user,
  });

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, queryClient]);

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      let query = supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("recipient_id", user.id)
        .eq("is_read", false);

      if (category) {
        query = query.eq("category", category);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const archiveNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_archived: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const archiveAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_archived: true })
        .eq("recipient_id", user.id)
        .eq("is_read", true)
        .eq("is_archived", false);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);
      if (error) throw error;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const countByCategory = notifications.reduce<Record<string, number>>(
    (acc, n) => {
      if (!n.is_read) {
        acc[n.category] = (acc[n.category] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  return {
    notifications,
    isLoading: notificationsQuery.isLoading,
    unreadCount,
    countByCategory,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    archiveAllRead,
    deleteNotification,
  };
}
