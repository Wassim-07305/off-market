"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect } from "react";
import type { Message } from "@/types/database";

export function useMessages(channelId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const messagesQuery = useQuery({
    queryKey: ["messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)")
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data as (Message & { sender: { id: string; full_name: string; avatar_url: string | null; role: string } })[];
    },
    enabled: !!channelId,
  });

  // Realtime
  useEffect(() => {
    if (!channelId) return;
    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, channelId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      contentType = "text",
      replyTo,
    }: {
      content: string;
      contentType?: string;
      replyTo?: string;
    }) => {
      if (!channelId || !user) throw new Error("Missing channel or user");
      const { error } = await supabase.from("messages").insert({
        channel_id: channelId,
        sender_id: user.id,
        content,
        content_type: contentType,
        reply_to: replyTo ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const markAsRead = async () => {
    if (!channelId || !user) return;
    await supabase
      .from("channel_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("channel_id", channelId)
      .eq("profile_id", user.id);
  };

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    sendMessage,
    markAsRead,
  };
}
