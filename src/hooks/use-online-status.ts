"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Track online users via Supabase Presence.
 * Returns a Set of online user IDs + broadcast my own presence.
 */
export function useOnlineStatus() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel;

    const setup = () => {
      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const ids = new Set<string>();
          for (const key of Object.keys(state)) {
            ids.add(key);
          }
          setOnlineUserIds(ids);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  const isOnline = useCallback(
    (userId: string) => onlineUserIds.has(userId),
    [onlineUserIds],
  );

  return { onlineUserIds, isOnline };
}
