"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check if user already has a push subscription stored
  const subscriptionQuery = useQuery({
    queryKey: ["push-subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("push_subscriptions" as never)
        .select("*")
        .eq("user_id" as never, user.id as never)
        .maybeSingle();
      return data as { id: string; endpoint: string } | null;
    },
    enabled: !!user && isSupported,
  });

  const isSubscribed = !!subscriptionQuery.data;

  // Subscribe to push notifications
  const subscribe = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!isSupported) throw new Error("Push non supporte");
      if (!VAPID_PUBLIC_KEY) throw new Error("VAPID key manquante");

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        throw new Error("Permission refusee");
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          VAPID_PUBLIC_KEY,
        ) as BufferSource,
      });

      const sub = subscription.toJSON();

      // Store subscription in database
      const { error } = await supabase
        .from("push_subscriptions" as never)
        .upsert(
          {
            user_id: user.id,
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys?.p256dh ?? "",
              auth: sub.keys?.auth ?? "",
              user_agent: navigator.userAgent,
            },
          } as never,
          { onConflict: "user_id,endpoint" as never },
        );

      if (error) throw error;
      return subscription;
    },
    onSuccess: () => {
      toast.success("Notifications push activees !");
      queryClient.invalidateQueries({ queryKey: ["push-subscription"] });
    },
    onError: (err: Error) => {
      if (err.message === "Permission refusee") {
        toast.error(
          "Tu as refuse les notifications. Active-les dans les paramètres de ton navigateur.",
        );
      } else {
        toast.error("Erreur lors de l'activation des notifications push");
      }
    },
  });

  // Unsubscribe from push notifications
  const unsubscribe = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Remove from browser
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Remove from database
      const { error } = await supabase
        .from("push_subscriptions" as never)
        .delete()
        .eq("user_id" as never, user.id as never);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Notifications push desactivees");
      queryClient.invalidateQueries({ queryKey: ["push-subscription"] });
    },
    onError: () => {
      toast.error("Erreur lors de la desactivation");
    },
  });

  const toggle = useCallback(() => {
    if (isSubscribed) {
      unsubscribe.mutate();
    } else {
      subscribe.mutate();
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading:
      subscribe.isPending ||
      unsubscribe.isPending ||
      subscriptionQuery.isLoading,
    toggle,
    subscribe,
    unsubscribe,
  };
}
