"use client";

import { useEffect, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useCallStore } from "@/stores/call-store";

/**
 * Listens for incoming call notifications via Supabase broadcast.
 * Used ONLY in IncomingCallToast (global, single instance).
 */
export function useCallNotifications() {
  const supabase = useSupabase();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`call-notify-${user.id}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "incoming-call" }, ({ payload }) => {
        // Read store state at callback time (not closure time)
        const { phase } = useCallStore.getState();
        if (phase === "idle" || phase === "ended") {
          useCallStore.getState().setIncomingCall(payload.callId, payload.callerName);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, supabase]);

  const dismissIncoming = useCallback(() => {
    useCallStore.getState().setIncomingCall(null, null);
  }, []);

  return { dismissIncoming };
}
