"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { AiConsentScope } from "@/types/database";

const AI_CONSENT_KEY = "ai-consent";
const AI_CONSENT_COOKIE = "off_market_ai_consent";

/**
 * Hook pour gerer le consentement IA (F46.2).
 * Verifie si l'utilisateur a accepte l'utilisation de l'IA.
 * Stocke le consentement dans la table profiles (ai_consent_given_at + ai_consent_scope)
 * et dans user_consents pour compatibilite.
 */
export function useAiConsent() {
  const supabase = useSupabase();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [AI_CONSENT_KEY, user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Check profile first (new approach)
      if (profile?.ai_consent_given_at) {
        setCookie();
        return {
          hasConsent: true,
          scopes: (profile.ai_consent_scope ?? []) as AiConsentScope[],
          consentDate: profile.ai_consent_given_at,
        };
      }

      // Check cookie (avoid DB call)
      if (typeof document !== "undefined") {
        const cookie = document.cookie
          .split("; ")
          .find((c) => c.startsWith(`${AI_CONSENT_COOKIE}=`));
        if (cookie) {
          return {
            hasConsent: true,
            scopes: (profile?.ai_consent_scope ?? []) as AiConsentScope[],
            consentDate: profile?.ai_consent_given_at ?? null,
          };
        }
      }

      // Fallback: check user_consents table
      const { data: consent } = await supabase
        .from("user_consents" as never)
        .select("id" as never)
        .eq("user_id" as never, user!.id as never)
        .eq("consent_type" as never, "ai_usage" as never)
        .maybeSingle();

      if (consent) {
        setCookie();
        return {
          hasConsent: true,
          scopes: (profile?.ai_consent_scope ?? []) as AiConsentScope[],
          consentDate: profile?.ai_consent_given_at ?? null,
        };
      }

      return {
        hasConsent: false,
        scopes: [] as AiConsentScope[],
        consentDate: null as string | null,
      };
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (scopes: AiConsentScope[]) => {
      if (!user) throw new Error("Non connecte");

      const now = new Date().toISOString();

      // Update profile with consent info
      const { error: profileError } = await supabase
        .from("profiles" as never)
        .update({
          ai_consent_given_at: now,
          ai_consent_scope: scopes,
        } as never)
        .eq("id" as never, user.id as never);

      if (profileError) throw profileError;

      // Also insert into user_consents for backward compatibility
      await supabase.from("user_consents" as never).upsert(
        {
          user_id: user.id,
          consent_type: "ai_usage",
          consent_version: "2.0",
          ip_address: null,
          accepted: true,
        } as never,
        { onConflict: "user_id,consent_type" as never },
      );

      setCookie();
    },
    onSuccess: (_data, scopes) => {
      queryClient.setQueryData([AI_CONSENT_KEY, user?.id], {
        hasConsent: true,
        scopes,
        consentDate: new Date().toISOString(),
      });
      toast.success("Consentement IA enregistre");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement du consentement");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecte");

      // Clear profile consent
      const { error: profileError } = await supabase
        .from("profiles" as never)
        .update({
          ai_consent_given_at: null,
          ai_consent_scope: [],
        } as never)
        .eq("id" as never, user.id as never);

      if (profileError) throw profileError;

      // Remove from user_consents
      await supabase
        .from("user_consents" as never)
        .delete()
        .eq("user_id" as never, user.id as never)
        .eq("consent_type" as never, "ai_usage" as never);

      removeCookie();
    },
    onSuccess: () => {
      queryClient.setQueryData([AI_CONSENT_KEY, user?.id], {
        hasConsent: false,
        scopes: [],
        consentDate: null,
      });
      toast.success("Consentement IA retire");
    },
    onError: () => {
      toast.error("Erreur lors du retrait du consentement");
    },
  });

  return {
    hasConsent: data?.hasConsent ?? false,
    scopes: data?.scopes ?? [],
    consentDate: data?.consentDate ?? null,
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
