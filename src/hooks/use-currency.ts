"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import type { SupportedCurrency } from "@/lib/utils";

export interface CurrencyRate {
  id: string;
  base: string;
  target: string;
  rate: number;
  updated_at: string;
}

/**
 * Fetch all currency rates from currency_rates table.
 */
export function useCurrencyRates() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["currency-rates"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currency_rates")
        .select("*")
        .order("base");

      if (error) throw error;
      return (data ?? []) as CurrencyRate[];
    },
    staleTime: 10 * 60 * 1000, // 10 min — rates don't change often
  });
}

/**
 * Convert an amount between two currencies using fetched rates.
 */
export function useConvertCurrency() {
  const { data: rates } = useCurrencyRates();

  return (
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency,
  ): number => {
    if (from === to || !rates) return amount;

    // Direct rate
    const direct = rates.find((r) => r.base === from && r.target === to);
    if (direct) return amount * direct.rate;

    // Reverse rate
    const reverse = rates.find((r) => r.base === to && r.target === from);
    if (reverse && reverse.rate !== 0) return amount / reverse.rate;

    // Via EUR pivot
    if (from !== "EUR" && to !== "EUR") {
      const toEur = rates.find((r) => r.base === from && r.target === "EUR");
      const fromEur = rates.find((r) => r.base === "EUR" && r.target === to);
      if (toEur && fromEur) return amount * toEur.rate * fromEur.rate;
    }

    return amount;
  };
}

/**
 * Get the current user's default currency from their profile.
 */
export function useUserCurrency(): SupportedCurrency {
  const { profile } = useAuth();
  const raw = profile?.default_currency;
  if (typeof raw === "string" && ["EUR", "USD", "GBP", "CHF"].includes(raw)) {
    return raw as SupportedCurrency;
  }
  return "EUR";
}

/**
 * Mutation to update the user's default currency on their profile.
 */
export function useUpdateDefaultCurrency() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (currency: SupportedCurrency) => {
      if (!user) throw new Error("Non authentifie");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from("profiles") as any)
        .update({ default_currency: currency })
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Devise par defaut mise a jour");
    },
    onError: () => {
      toast.error("Erreur lors du changement de devise");
    },
  });
}
