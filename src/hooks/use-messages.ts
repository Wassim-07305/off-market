"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect } from "react";
import type { EnrichedMessage } from "@/types/messaging";

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
        .select(
          `*,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role),
          reactions:message_reactions(id, emoji, profile_id),
          attachments:message_attachments(id, file_name, file_url, file_type, file_size)`
        )
        .eq("channel_id", channelId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as EnrichedMessage[];
    },
    enabled: !!channelId,
  });

  // Realtime: messages INSERT/UPDATE/DELETE + reactions INSERT/DELETE
  useEffect(() => {
    if (!channelId) return;
    const channel = supabase
      .channel(`msg-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions" },
        () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
      const { data, error } = await supabase
        .from("messages")
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content,
          content_type: contentType,
          reply_to: replyTo ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const editMessage = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("messages")
        .update({ content, is_edited: true, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_pinned: !pinned })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if reaction already exists
      const { data: existing } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("profile_id", user.id)
        .eq("emoji", emoji)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("message_reactions")
          .insert({ message_id: messageId, profile_id: user.id, emoji });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const addAttachment = useMutation({
    mutationFn: async ({
      messageId,
      fileName,
      fileUrl,
      fileType,
      fileSize,
    }: {
      messageId: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }) => {
      const { error } = await supabase.from("message_attachments").insert({
        message_id: messageId,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        file_size: fileSize,
      });
      if (error) throw error;
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
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    addAttachment,
    markAsRead,
  };
}
