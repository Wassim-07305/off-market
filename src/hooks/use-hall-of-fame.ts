"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface HallOfFameEntry {
  id: string;
  profile_id: string;
  monthly_revenue: number;
  testimony: string | null;
  niche: string | null;
  achievement_date: string;
  is_visible: boolean;
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  total_xp: number;
  badge_count: number;
}

// Row shape returned by the hall_of_fame_enriched view
interface HallOfFameEnrichedRow {
  id: string;
  profile_id: string;
  achievement: string | null;
  description: string | null;
  featured_at: string | null;
  created_at: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  total_xp: number;
  badge_count: number;
  monthly_revenue: number | null;
  niche: string | null;
}

export function useHallOfFame() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const hallQuery = useQuery({
    queryKey: ["hall-of-fame"],
    enabled: !!user,
    queryFn: async (): Promise<HallOfFameEntry[]> => {
      // Single query via the hall_of_fame_enriched view (replaces 3 separate queries)
      const { data, error } = await supabase
        .from("hall_of_fame_enriched")
        .select("*")
        .order("featured_at", { ascending: false })
        .returns<HallOfFameEnrichedRow[]>();

      if (error) {
        // View might not be available yet — return empty
        console.warn(
          "hall_of_fame_enriched view not available:",
          error.message,
        );
        return [];
      }

      if (!data || data.length === 0) return [];

      return data.map((entry) => ({
        id: entry.id,
        profile_id: entry.profile_id,
        monthly_revenue: entry.monthly_revenue ?? 0,
        testimony: entry.description,
        niche: entry.niche ?? null,
        achievement_date: entry.featured_at ?? entry.created_at,
        is_visible: true,
        created_at: entry.created_at,
        profile: entry.full_name
          ? {
              id: entry.profile_id,
              full_name: entry.full_name,
              avatar_url: entry.avatar_url,
              bio: entry.bio,
            }
          : null,
        total_xp: entry.total_xp ?? 0,
        badge_count: entry.badge_count ?? 0,
      }));
    },
  });

  return {
    entries: hallQuery.data ?? [],
    isLoading: hallQuery.isLoading,
    error: hallQuery.error,
  };
}
