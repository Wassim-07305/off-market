"use client";

import { useEffect, useRef } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useCallStore } from "@/stores/call-store";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Listens for incoming call notifications via Supabase broadcast.
 * When a peer joins a call, they broadcast to the other participant.
 * This hook receives that notification and sets the incoming call state.
 */
export function useCallNotifications() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const store = useCallStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`call-notify-${user.id}`, {
      config: { broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "incoming-call" }, ({ payload }) => {
        // Only show notification if not already in a call
        if (store.phase === "idle" || store.phase === "ended") {
          store.setIncomingCall(payload.callId, payload.callerName);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user?.id, supabase, store]);

  /** Broadcast to the other participant that we're joining */
  const notifyPeer = (peerId: string, callId: string, callerName: string) => {
    const notifyChannel = supabase.channel(`call-notify-${peerId}`, {
      config: { broadcast: { self: false } },
    });

    notifyChannel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        notifyChannel.send({
          type: "broadcast",
          event: "incoming-call",
          payload: { callId, callerName },
        });
        // Remove after sending
        setTimeout(() => supabase.removeChannel(notifyChannel), 2000);
      }
    });
  };

  const dismissIncoming = () => {
    store.setIncomingCall(null, null);
  };

  return { notifyPeer, dismissIncoming };
}
