"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect, useCallback, useRef } from "react";
import type { EnrichedMessage } from "@/types/messaging";
import { playUrgentSound } from "@/lib/sounds";
import { containsAlexiaMention } from "@/components/messaging/alexia-mention";

export function useMessages(channelId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const scrollLockRef = useRef(false);

  const messagesQuery = useQuery({
    queryKey: ["messages", channelId],
    retry: 1,
    staleTime: 0, // Temps reel — toujours refetch, les subscriptions gerent les updates
    queryFn: async () => {
      if (!channelId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select(
          `*,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role),
          reactions:message_reactions(id, emoji, profile_id),
          attachments:message_attachments(id, file_name, file_url, file_type, file_size),
          reply_message:messages!reply_to(id, content, content_type, sender:profiles!messages_sender_id_fkey(full_name))`,
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
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
          // Play urgent sound on new urgent messages from other users
          if (
            payload.eventType === "INSERT" &&
            payload.new?.is_urgent &&
            payload.new?.sender_id !== user?.id
          ) {
            playUrgentSound();
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "message_reactions" },
        () =>
          queryClient.invalidateQueries({ queryKey: ["messages", channelId] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, channelId, queryClient, user?.id]);

  // --- Optimistic send ---
  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      contentType = "text",
      replyTo,
      scheduledAt,
      isUrgent = false,
    }: {
      content: string;
      contentType?: string;
      replyTo?: string;
      scheduledAt?: string;
      isUrgent?: boolean;
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
          scheduled_at: scheduledAt ?? null,
          is_urgent: isUrgent,
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({
      content,
      contentType = "text",
      replyTo,
      isUrgent = false,
    }) => {
      if (!user) return;
      // Cancel in-flight fetches
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });

      const previousMessages = queryClient.getQueryData<EnrichedMessage[]>([
        "messages",
        channelId,
      ]);

      // Build optimistic reply_message from existing messages if replying
      let replyMessage: EnrichedMessage["reply_message"] = undefined;
      if (replyTo && previousMessages) {
        const original = previousMessages.find((m) => m.id === replyTo);
        if (original) {
          replyMessage = {
            id: original.id,
            content: original.content,
            content_type: original.content_type,
            sender: original.sender
              ? { full_name: original.sender.full_name }
              : null,
          };
        }
      }

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
        is_urgent: isUrgent,
        is_ai_generated: false,
        reply_count: 0,
        scheduled_at: null,
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
        reply_message: replyMessage,
      };

      queryClient.setQueryData<EnrichedMessage[]>(
        ["messages", channelId],
        (old) => [...(old ?? []), optimisticMsg],
      );

      scrollLockRef.current = true;
      return { previousMessages };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", channelId],
          context.previousMessages,
        );
      }
      scrollLockRef.current = false;
    },
    onSuccess: async (_data, variables) => {
      // Send push notifications to other channel members
      if (channelId && user) {
        try {
          const { data: members } = await supabase
            .from("channel_members" as never)
            .select("user_id" as never)
            .eq("channel_id" as never, channelId as never)
            .neq("user_id" as never, user.id as never);
          const recipientIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
          if (recipientIds.length > 0) {
            const senderName = user.user_metadata?.full_name ?? "Quelqu'un";
            const preview = variables.content.length > 80
              ? variables.content.slice(0, 80) + "..."
              : variables.content;
            fetch("/api/notifications/push", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userIds: recipientIds,
                title: `${senderName}`,
                body: preview,
                url: `/admin/messaging`,
                tag: `msg-${channelId}`,
              }),
            }).catch(() => {});
          }
        } catch {
          // Push notification is best-effort, never block
        }
      }

      // Auto-respond when @Alexia is mentioned
      if (channelId && containsAlexiaMention(variables.content)) {
        try {
          const res = await fetch("/api/ai/alexia/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: variables.content.replace(/@alexia\b/gi, "").trim(),
              channelId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.response) {
              await supabase.from("messages").insert({
                channel_id: channelId,
                sender_id: user!.id,
                content: `🤖 **AlexIA** :\n${data.response}`,
                content_type: "text",
                is_ai_generated: true,
                metadata: { bot: "alexia" },
              } as never);
            }
          }
        } catch {
          // Silently ignore AI errors
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      scrollLockRef.current = false;
    },
  });

  // --- Optimistic edit ---
  const editMessage = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("messages")
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>([
        "messages",
        channelId,
      ]);

      queryClient.setQueryData<EnrichedMessage[]>(
        ["messages", channelId],
        (old) =>
          (old ?? []).map((m) =>
            m.id === id ? { ...m, content, is_edited: true } : m,
          ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["messages", channelId], ctx.previous);
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
        .update({ deleted_at: new Date().toISOString() } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>([
        "messages",
        channelId,
      ]);

      queryClient.setQueryData<EnrichedMessage[]>(
        ["messages", channelId],
        (old) => (old ?? []).filter((m) => m.id !== id),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["messages", channelId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const togglePin = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_pinned: !pinned } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, pinned }) => {
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>([
        "messages",
        channelId,
      ]);

      queryClient.setQueryData<EnrichedMessage[]>(
        ["messages", channelId],
        (old) =>
          (old ?? []).map((m) =>
            m.id === id ? { ...m, is_pinned: !pinned } : m,
          ),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["messages", channelId], ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  // --- Optimistic reactions ---
  const toggleReaction = useMutation({
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: existing } = await supabase
        .from("message_reactions")
        .select("id")
        .eq("message_id", messageId)
        .eq("profile_id", user.id)
        .eq("emoji", emoji)
        .returns<{ id: string }[]>()
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("message_reactions")
          .delete()
          .eq("id", (existing as { id: string }).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("message_reactions")
          .insert({ message_id: messageId, profile_id: user.id, emoji } as never);
        if (error) throw error;
      }
    },
    onMutate: async ({ messageId, emoji }) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["messages", channelId] });
      const previous = queryClient.getQueryData<EnrichedMessage[]>([
        "messages",
        channelId,
      ]);

      queryClient.setQueryData<EnrichedMessage[]>(
        ["messages", channelId],
        (old) =>
          (old ?? []).map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions?.find(
              (r) => r.emoji === emoji && r.profile_id === user.id,
            );
            if (existing) {
              return {
                ...m,
                reactions: (m.reactions ?? []).filter(
                  (r) => r.id !== existing.id,
                ),
              };
            }
            return {
              ...m,
              reactions: [
                ...(m.reactions ?? []),
                {
                  id: `opt-${Date.now()}`,
                  emoji,
                  profile_id: user.id,
                  message_id: messageId,
                  created_at: new Date().toISOString(),
                },
              ],
            };
          }),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["messages", channelId], ctx.previous);
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
      } as never);
      if (error) throw error;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", channelId] });
    },
  });

  const markAsRead = useCallback(async () => {
    if (!channelId || !user) return;
    const { error } = await supabase
      .from("channel_members")
      .update({ last_read_at: new Date().toISOString() } as never)
      .eq("channel_id", channelId)
      .eq("profile_id", user.id);
    if (!error) {
      // Refresh channels (for updated last_read_at) then unread counts
      await queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["channel-unreads"] });
    }
  }, [channelId, user, supabase, queryClient]);

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

/** Fetch replies for a specific parent message (thread) */
export function useThreadMessages(parentId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const threadQuery = useQuery({
    queryKey: ["thread", parentId],
    queryFn: async () => {
      if (!parentId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select(
          `*,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role),
          reactions:message_reactions(id, emoji, profile_id),
          attachments:message_attachments(id, file_name, file_url, file_type, file_size)`,
        )
        .eq("reply_to", parentId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as EnrichedMessage[];
    },
    enabled: !!parentId,
  });

  // Realtime for thread replies
  useEffect(() => {
    if (!parentId) return;
    const channel = supabase
      .channel(`thread-${parentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `reply_to=eq.${parentId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["thread", parentId] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, parentId, queryClient]);

  return {
    replies: threadQuery.data ?? [],
    isLoading: threadQuery.isLoading,
  };
}
