"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

const AI_CONSENT_KEY = "ai-consent";
const AI_CONSENT_COOKIE = "off_market_ai_consent";

/**
 * Hook pour gerer le consentement IA (F46.2).
 * Verifie si l'utilisateur a accepte l'utilisation de l'IA.
 * Stocke le consentement dans la table user_consents.
 */
export function useAiConsent() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: hasConsented, isLoading } = useQuery({
    queryKey: [AI_CONSENT_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Verifier le cookie en premier (evite un appel DB)
      if (typeof document !== "undefined") {
        const cookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith(`${AI_CONSENT_COOKIE}=`));
        if (cookie) return true;
      }

      // Verifier en DB
      const { data, error } = await supabase
        .from("user_consents" as never)
        .select("id" as never)
        .eq("user_id" as never, user!.id as never)
        .eq("consent_type" as never, "ai_usage" as never)
        .maybeSingle();

      if (error) {
        console.error("Erreur verification consentement IA:", error);
        return false;
      }

      if (data) {
        setCookie();
        return true;
      }

      return false;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecte");

      const { error } = await supabase.from("user_consents" as never).insert({
        user_id: user.id,
        consent_type: "ai_usage",
        consent_version: "1.0",
        ip_address: null,
        accepted: true,
      } as never);

      if (error) throw error;
      setCookie();
    },
    onSuccess: () => {
      queryClient.setQueryData([AI_CONSENT_KEY, user?.id], true);
      toast.success("Consentement IA enregistre");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du consentement");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecte");

      const { error } = await supabase
        .from("user_consents" as never)
        .delete()
        .eq("user_id" as never, user.id as never)
        .eq("consent_type" as never, "ai_usage" as never);

      if (error) throw error;
      removeCookie();
    },
    onSuccess: () => {
      queryClient.setQueryData([AI_CONSENT_KEY, user?.id], false);
      toast.success("Consentement IA retire");
    },
    onError: () => {
      toast.error("Erreur lors du retrait du consentement");
    },
  });

  return {
    hasConsented: hasConsented ?? false,
    isLoading,
    accept: acceptMutation.mutate,
    revoke: revokeMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRevoking: revokeMutation.isPending,
  };
}

function setCookie() {
  if (typeof document === "undefined") return;
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  document.cookie = `${AI_CONSENT_COOKIE}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function removeCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AI_CONSENT_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}
