"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect, useCallback, useRef } from "react";
import type { EnrichedMessage } from "@/types/messaging";

export function useMessages(channelId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const scrollLockRef = useRef(false);

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

  // --- Optimistic send ---
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
    onMutate: async ({ content, contentType = "text", replyTo }) => {
      if (!user) return;
      // Cancel in-flight fetches
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });

      const previousMessages = queryClient.getQueryData<EnrichedMessage[]>(["messages", channelId]);

      // Create optimistic message
      const optimisticMsg: EnrichedMessage = {
        id: `optimistic-${Date.now()}`,
        channel_id: channelId!,
        sender_id: user.id,
        content,
        content_type: contentType as EnrichedMessage["content_type"],
        reply_to: replyTo ?? null,
        is_pinned: false,
        is_edited: false,
        metadata: {},
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? "Moi",
          avatar_url: user.user_metadata?.avatar_url ?? null,
          role: user.user_metadata?.role ?? "client",
        },
        reactions: [],
        attachments: [],
        reply_message: null,
      };

      queryClient.setQueryData<EnrichedMessage[]>(["messages", channelId], (old) => [
        ...(old ?? []),
        optimisticMsg,
      ]);

      scrollLockRef.current = true;
      return { previousMessages };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages", channelId], context.previousMessages);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  // --- Optimistic edit ---
  const editMessage = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("messages")
        .update({ content, is_edited: true, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>(["messages", channelId]);

      queryClient.setQueryData<EnrichedMessage[]>(["messages", channelId], (old) =>
        (old ?? []).map((m) => (m.id === id ? { ...m, content, is_edited: true } : m))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["messages", channelId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  // --- Optimistic delete ---
  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>(["messages", channelId]);

      queryClient.setQueryData<EnrichedMessage[]>(["messages", channelId], (old) =>
        (old ?? []).filter((m) => m.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["messages", channelId], ctx.previous);
    },
    onSettled: () => {
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
    onMutate: async ({ id, pinned }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>(["messages", channelId]);

      queryClient.setQueryData<EnrichedMessage[]>(["messages", channelId], (old) =>
        (old ?? []).map((m) => (m.id === id ? { ...m, is_pinned: !pinned } : m))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["messages", channelId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  // --- Optimistic reactions ---
  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error("Not authenticated");

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
    onMutate: async ({ messageId, emoji }) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>(["messages", channelId]);

      queryClient.setQueryData<EnrichedMessage[]>(["messages", channelId], (old) =>
        (old ?? []).map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions?.find((r) => r.emoji === emoji && r.profile_id === user.id);
          if (existing) {
            return { ...m, reactions: (m.reactions ?? []).filter((r) => r.id !== existing.id) };
          }
          return {
            ...m,
            reactions: [
              ...(m.reactions ?? []),
              { id: `opt-${Date.now()}`, emoji, profile_id: user.id, message_id: messageId, created_at: new Date().toISOString() },
            ],
          };
        })
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["messages", channelId], ctx.previous);
    },
    onSettled: () => {
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const markAsRead = useCallback(async () => {
    if (!channelId || !user) return;
    await supabase
      .from("channel_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("channel_id", channelId)
      .eq("profile_id", user.id);
  }, [channelId, user, supabase]);

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
