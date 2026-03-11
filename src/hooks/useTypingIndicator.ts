import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

const TYPING_TIMEOUT = 3000; // 3 secondes sans frappe = plus en train d'écrire
const BROADCAST_THROTTLE = 2000; // max 1 broadcast toutes les 2 secondes

interface TypingUser {
  userId: string;
  fullName: string;
}

export function useTypingIndicator(channelId: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id);
  const profile = useAuthStore((s) => s.profile);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const lastBroadcast = useRef(0);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  // Écouter les événements de typing des autres
  useEffect(() => {
    if (!channelId || !userId) return;

    const channel = supabase.channel(`typing:${channelId}`);

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const data = payload.payload as { userId: string; fullName: string };
        if (data.userId === userId) return; // Ignorer ses propres events

        // Ajouter l'utilisateur à la liste
        setTypingUsers((prev) => {
          const exists = prev.some((u) => u.userId === data.userId);
          if (!exists) {
            return [...prev, { userId: data.userId, fullName: data.fullName }];
          }
          return prev;
        });

        // Reset le timeout pour cet utilisateur
        const existingTimeout = timeoutsRef.current.get(data.userId);
        if (existingTimeout) clearTimeout(existingTimeout);

        const timeout = setTimeout(() => {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== data.userId),
          );
          timeoutsRef.current.delete(data.userId);
        }, TYPING_TIMEOUT);

        timeoutsRef.current.set(data.userId, timeout);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      // Nettoyer tous les timeouts
      for (const timeout of timeoutsRef.current.values()) {
        clearTimeout(timeout);
      }
      timeoutsRef.current.clear();
      setTypingUsers([]);
    };
  }, [channelId, userId]);

  // Envoyer un event de typing (throttled)
  const sendTyping = useCallback(() => {
    if (!channelId || !userId || !profile) return;

    const now = Date.now();
    if (now - lastBroadcast.current < BROADCAST_THROTTLE) return;
    lastBroadcast.current = now;

    supabase.channel(`typing:${channelId}`).send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId,
        fullName: profile.full_name,
      },
    });
  }, [channelId, userId, profile]);

  return { typingUsers, sendTyping };
}
