"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import type { EnrichedMessage } from "@/types/messaging";

interface BookmarkRow {
  id: string;
  user_id: string;
  message_id: string;
  created_at: string;
}

/**
 * Manage message bookmarks for the current user.
 * Bookmarks are persisted in the `message_bookmarks` DB table.
 */
export function useBookmarks() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all bookmarked message IDs for the current user
  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("message_bookmarks")
        .select("id, user_id, message_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BookmarkRow[];
    },
    enabled: !!user,
  });

  const bookmarkedIds = useMemo(() => {
    return new Set((bookmarksQuery.data ?? []).map((b) => b.message_id));
  }, [bookmarksQuery.data]);

  const isBookmarked = useCallback(
    (messageId: string) => bookmarkedIds.has(messageId),
    [bookmarkedIds],
  );

  // Toggle bookmark (add or remove)
  const toggleBookmark = useMutation({
    mutationFn: async (messageId: string) => {
      if (!user) throw new Error("Non authentifie");

      const existing = (bookmarksQuery.data ?? []).find(
        (b) => b.message_id === messageId,
      );

      if (existing) {
        const { error } = await supabase
          .from("message_bookmarks")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" as const };
      } else {
        const { error } = await (
          supabase.from("message_bookmarks") as any
        ).insert({ user_id: user.id, message_id: messageId });
        if (error) throw error;
        return { action: "added" as const };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
      if (result.action === "added") {
        toast.success("Message ajoute aux favoris");
      } else {
        toast.success("Message retire des favoris");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du favori");
    },
  });

  // Fetch full enriched messages for bookmarked IDs (for the bookmarks panel)
  const bookmarkedMessagesQuery = useQuery({
    queryKey: ["bookmarked-messages", Array.from(bookmarkedIds)],
    queryFn: async () => {
      if (bookmarkedIds.size === 0) return [];
      const ids = Array.from(bookmarkedIds);
      const { data, error } = await supabase
        .from("messages")
        .select(
          `*,
          sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role),
          reactions:message_reactions(id, emoji, profile_id),
          attachments:message_attachments(id, file_name, file_url, file_type, file_size)`,
        )
        .in("id", ids)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EnrichedMessage[];
    },
    enabled: bookmarkedIds.size > 0,
  });

  return {
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
    bookmarkedMessages: bookmarkedMessagesQuery.data ?? [],
    isLoadingBookmarks: bookmarksQuery.isLoading,
  };
}
