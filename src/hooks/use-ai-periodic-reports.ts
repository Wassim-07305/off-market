"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface PeriodicReportStats {
  journalEntries: number;
  checkins: number;
  messages: number;
  sessions: number;
  calls: number;
  activeStudents: number;
  inactiveStudents: number;
}

interface PeriodicReport {
  report: string;
  period: {
    start: string;
    end: string;
  };
  stats: PeriodicReportStats;
}

/**
 * Hook pour generer et afficher les rapports IA periodiques.
 * Appelle l'API /api/ai/periodic-report qui agregue les donnees
 * des 7 derniers jours et genere un rapport via IA.
 *
 * Reserve aux roles admin et coach.
 */
export function useAiPeriodicReport(enabled = true) {
  const { user, profile } = useAuth();

  const isEligible = !!user && ["admin", "coach"].includes(profile?.role ?? "");

  const query = useQuery<PeriodicReport>({
    queryKey: ["ai-periodic-report", user?.id],
    enabled: enabled && isEligible,
    staleTime: 1000 * 60 * 30, // 30 minutes — ne pas regenerer trop souvent
    gcTime: 1000 * 60 * 60, // 1 heure en cache
    retry: 1,
    queryFn: async () => {
      const res = await fetch("/api/ai/periodic-report");
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(
          err?.error ?? "Erreur lors de la generation du rapport",
        );
      }
      return res.json();
    },
  });

  return {
    report: query.data?.report ?? null,
    period: query.data?.period ?? null,
    stats: query.data?.stats ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isEligible,
  };
}
