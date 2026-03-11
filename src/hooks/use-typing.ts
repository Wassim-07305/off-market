"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface TypingUser {
  userId: string;
  fullName: string;
}

/**
 * Manage typing indicators per channel via Supabase Presence.
 * - broadcastTyping(): call on input change (debounced)
 * - typingUsers: list of users currently typing (excluding self)
 */
export function useTyping(channelId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!channelId || !user) return;

    const ch = supabase.channel(`typing-${channelId}`, {
      config: { presence: { key: user.id } },
    });

    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState();
      const users: TypingUser[] = [];
      for (const [key, presences] of Object.entries(state)) {
        if (key === user.id) continue;
        const latest = presences[presences.length - 1] as Record<
          string,
          unknown
        >;
        if (latest?.typing) {
          users.push({
            userId: key,
            fullName: (latest.full_name as string) ?? "Quelqu'un",
          });
        }
      }
      setTypingUsers(users);
    }).subscribe();

    channelRef.current = ch;

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      supabase.removeChannel(ch);
      channelRef.current = null;
    };
  }, [supabase, channelId, user]);

  const broadcastTyping = useCallback(
    async (fullName: string) => {
      if (!channelRef.current || !user) return;

      // Track typing = true
      await channelRef.current.track({
        user_id: user.id,
        full_name: fullName,
        typing: true,
      });

      // Clear after 3 seconds of inactivity
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        if (channelRef.current) {
          await channelRef.current.track({
            user_id: user.id,
            full_name: fullName,
            typing: false,
          });
        }
      }, 3000);
    },
    [user],
  );

  const stopTyping = useCallback(
    async (fullName: string) => {
      if (!channelRef.current || !user) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      await channelRef.current.track({
        user_id: user.id,
        full_name: fullName,
        typing: false,
      });
    },
    [user],
  );

  return { typingUsers, broadcastTyping, stopTyping };
}
