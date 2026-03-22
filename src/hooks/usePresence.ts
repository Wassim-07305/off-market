import { useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function usePresence() {
  const { user } = useAuth();
  const supabase = useSupabase();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    const updatePresence = async () => {
      if (document.visibilityState === "visible") {
        await supabase
          .from("profiles")
          .update({ last_seen_at: new Date().toISOString() } as never)
          .eq("id", userId);
      }
    };

    // Update immediately
    updatePresence();

    // Then every 5 minutes
    const interval = setInterval(updatePresence, UPDATE_INTERVAL);

    // Also update when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updatePresence();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [userId, supabase]);
}
