"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { CONTACT_SOURCES } from "@/types/pipeline";

export interface ClosingStatBySource {
  source: string;
  sourceLabel: string;
  totalContacts: number;
  clientCount: number;
  perduCount: number;
  closingRate: number; // percentage
  avgTimeToCloseDays: number | null;
  avgDealValue: number;
  totalRevenue: number;
}

export interface ClosingStatsResult {
  bySource: ClosingStatBySource[];
  overall: {
    totalContacts: number;
    totalClients: number;
    totalPerdus: number;
    overallClosingRate: number;
    avgTimeToCloseDays: number | null;
    avgDealValue: number;
  };
}

interface UseClosingStatsOptions {
  from?: string; // ISO date
  to?: string; // ISO date
}

export function useClosingStats(options: UseClosingStatsOptions = {}) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const now = new Date();
  const defaultFrom = "2020-01-01";
  const defaultTo = now.toISOString().split("T")[0];

  const from = options.from ?? defaultFrom;
  const to = options.to ?? defaultTo;

  return useQuery({
    queryKey: ["closing-stats", from, to],
    enabled: !!user,
    queryFn: async (): Promise<ClosingStatsResult> => {
      const { data: contacts, error } = await supabase
        .from("crm_contacts")
        .select(
          "id, source, stage, estimated_value, created_at, updated_at, stage_changed_at, lost_reason",
        )
        .gte("created_at", from)
        .lte("created_at", to + "T23:59:59");

      if (error) throw error;
      const rows = (contacts ?? []) as Array<{
        id: string;
        source: string | null;
        stage: string;
        estimated_value: number | null;
        created_at: string;
        updated_at: string;
        stage_changed_at: string | null;
        lost_reason: string | null;
      }>;

      const sourceMap = new Map<
        string,
        {
          total: number;
          clients: number;
          perdus: number;
          closeTimes: number[];
          dealValues: number[];
          totalRevenue: number;
        }
      >();

      // Initialize all known sources
      for (const src of CONTACT_SOURCES) {
        sourceMap.set(src.value, {
          total: 0,
          clients: 0,
          perdus: 0,
          closeTimes: [],
          dealValues: [],
          totalRevenue: 0,
        });
      }

      for (const contact of rows) {
        const source = contact.source ?? "other";
        let entry = sourceMap.get(source);
        if (!entry) {
          entry = {
            total: 0,
            clients: 0,
            perdus: 0,
            closeTimes: [],
            dealValues: [],
            totalRevenue: 0,
          };
          sourceMap.set(source, entry);
        }

        entry.total++;

        if (contact.stage === "client") {
          entry.clients++;
          const value = Number(contact.estimated_value ?? 0);
          if (value > 0) {
            entry.dealValues.push(value);
            entry.totalRevenue += value;
          }

          // Compute time to close
          const closedAt = contact.stage_changed_at ?? contact.updated_at;
          if (closedAt && contact.created_at) {
            const created = new Date(contact.created_at).getTime();
            const closed = new Date(closedAt).getTime();
            const daysDiff = Math.round(
              (closed - created) / (1000 * 60 * 60 * 24),
            );
            if (daysDiff >= 0) {
              entry.closeTimes.push(daysDiff);
            }
          }
        } else if (contact.stage === "perdu") {
          entry.perdus++;
        }
      }

      const sourceLabel = (source: string): string => {
        const found = CONTACT_SOURCES.find((s) => s.value === source);
        return found?.label ?? source;
      };

      const bySource: ClosingStatBySource[] = Array.from(
        sourceMap.entries(),
      )
        .map(([source, data]) => {
          const decided = data.clients + data.perdus;
          const closingRate =
            decided > 0 ? Math.round((data.clients / decided) * 1000) / 10 : 0;
          const avgTimeToCloseDays =
            data.closeTimes.length > 0
              ? Math.round(
                  data.closeTimes.reduce((s, t) => s + t, 0) /
                    data.closeTimes.length,
                )
              : null;
          const avgDealValue =
            data.dealValues.length > 0
              ? Math.round(
                  data.dealValues.reduce((s, v) => s + v, 0) /
                    data.dealValues.length,
                )
              : 0;

          return {
            source,
            sourceLabel: sourceLabel(source),
            totalContacts: data.total,
            clientCount: data.clients,
            perduCount: data.perdus,
            closingRate,
            avgTimeToCloseDays,
            avgDealValue,
            totalRevenue: Math.round(data.totalRevenue),
          };
        })
        .filter((s) => s.totalContacts > 0)
        .sort((a, b) => b.closingRate - a.closingRate);

      // Overall stats
      const totalContacts = rows.length;
      const totalClients = rows.filter((c) => c.stage === "client").length;
      const totalPerdus = rows.filter((c) => c.stage === "perdu").length;
      const totalDecided = totalClients + totalPerdus;
      const overallClosingRate =
        totalDecided > 0
          ? Math.round((totalClients / totalDecided) * 1000) / 10
          : 0;

      const allCloseTimes = bySource.flatMap((s) =>
        s.avgTimeToCloseDays !== null ? [s.avgTimeToCloseDays] : [],
      );
      const avgTimeToCloseDays =
        allCloseTimes.length > 0
          ? Math.round(
              allCloseTimes.reduce((s, t) => s + t, 0) / allCloseTimes.length,
            )
          : null;

      const clientRows = rows.filter(
        (c) => c.stage === "client" && Number(c.estimated_value ?? 0) > 0,
      );
      const avgDealValue =
        clientRows.length > 0
          ? Math.round(
              clientRows.reduce(
                (s, c) => s + Number(c.estimated_value ?? 0),
                0,
              ) / clientRows.length,
            )
          : 0;

      return {
        bySource,
        overall: {
          totalContacts,
          totalClients,
          totalPerdus,
          overallClosingRate,
          avgTimeToCloseDays,
          avgDealValue,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
