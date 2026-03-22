"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface UserPreferences {
  id: string;
  user_id: string;
  notify_messages: boolean;
  notify_feed: boolean;
  notify_reports: boolean;
  notify_badges: boolean;
  notify_checkins: boolean;
  notify_goals: boolean;
  notify_calls: boolean;
  notify_forms: boolean;
  notify_certificates: boolean;
  email_digest: "none" | "daily" | "weekly";
  email_marketing: boolean;
  created_at: string;
  updated_at: string;
}

export function usePreferences() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Try to get existing preferences
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;

      // Auto-create if not found
      if (!data) {
        const { data: created, error: createErr } = await supabase
          .from("user_preferences")
          .insert({ user_id: user!.id } as never)
          .select()
          .single();
        if (createErr) throw createErr;
        return created as UserPreferences;
      }

      return data as UserPreferences;
    },
  });
}

export function useUpdatePreferences() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Partial<
        Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">
      >,
    ) => {
      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates as never)
        .eq("user_id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return data as UserPreferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user-preferences", user?.id], data);
    },
  });
}
