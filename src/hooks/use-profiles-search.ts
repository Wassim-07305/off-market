"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface MentionProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

/**
 * Fetches all profiles for mention autocomplete.
 * Cached and fetched once. Filtering is done client-side.
 */
export function useProfilesForMention() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["profiles-for-mention"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data as MentionProfile[];
    },
  });

  return {
    profiles: query.data ?? [],
    isLoading: query.isLoading,
  };
}
