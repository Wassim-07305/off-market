"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ─── Alias generator ─────────────────────────────────
const ADJECTIVES = [
  "Agile",
  "Rapide",
  "Malin",
  "Brillant",
  "Sage",
  "Furtif",
  "Noble",
  "Vaillant",
  "Hardi",
  "Astucieux",
  "Tenace",
  "Serein",
  "Audacieux",
  "Intrepide",
  "Rusé",
  "Fougueux",
  "Subtil",
  "Alerte",
  "Loyal",
  "Fier",
];

const ANIMALS = [
  "Lion",
  "Aigle",
  "Renard",
  "Loup",
  "Faucon",
  "Panthere",
  "Tigre",
  "Lynx",
  "Hibou",
  "Dauphin",
  "Cerf",
  "Puma",
  "Ours",
  "Jaguar",
  "Cobra",
  "Phoenix",
  "Griffon",
  "Dragon",
  "Colibri",
  "Condor",
];

function generateAlias(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  return `${animal} ${adj}`;
}

// ─── Hook ────────────────────────────────────────────

export function useLeaderboardPrivacy() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const privacyQuery = useQuery({
    queryKey: ["leaderboard-privacy", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("leaderboard_anonymous, anonymous_alias")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data as {
        leaderboard_anonymous: boolean;
        anonymous_alias: string | null;
      };
    },
    enabled: !!user,
  });

  const toggleAnonymity = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecte");

      const current = privacyQuery.data;
      const newValue = !(current?.leaderboard_anonymous ?? false);

      // Auto-generate alias if turning on and no alias exists
      const updates: Record<string, unknown> = {
        leaderboard_anonymous: newValue,
      };

      if (newValue && !current?.anonymous_alias) {
        updates.anonymous_alias = generateAlias();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
      return newValue;
    },
    onSuccess: (isNowAnonymous) => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboard-privacy", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });

      if (isNowAnonymous) {
        toast.success("Mode anonyme active", {
          description:
            "Les autres participants verront un alias a la place de ton nom.",
        });
      } else {
        toast.success("Mode anonyme desactive", {
          description:
            "Ton vrai nom est maintenant visible dans le classement.",
        });
      }
    },
    onError: () => {
      toast.error("Erreur lors du changement de mode anonyme");
    },
  });

  const regenerateAlias = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non connecte");

      const newAlias = generateAlias();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("profiles")
        .update({ anonymous_alias: newAlias })
        .eq("id", user.id);

      if (error) throw error;
      return newAlias;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboard-privacy", user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast.success("Nouvel alias généré");
    },
    onError: () => {
      toast.error("Erreur lors de la generation de l'alias");
    },
  });

  return {
    isAnonymous: privacyQuery.data?.leaderboard_anonymous ?? false,
    alias: privacyQuery.data?.anonymous_alias ?? null,
    isLoading: privacyQuery.isLoading,
    toggleAnonymity,
    regenerateAlias,
  };
}
