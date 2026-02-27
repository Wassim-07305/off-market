"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { CallCalendarWithRelations } from "@/types/calls";

export function useCalls(weekStart?: Date) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const callsQuery = useQuery({
    queryKey: ["calls", weekStart?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("call_calendar")
        .select("*, client:profiles!call_calendar_client_id_fkey(id, full_name, avatar_url), assigned_profile:profiles!call_calendar_assigned_to_fkey(id, full_name)")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        query = query
          .gte("date", weekStart.toISOString().split("T")[0])
          .lte("date", weekEnd.toISOString().split("T")[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CallCalendarWithRelations[];
    },
    enabled: !!user,
  });

  const createCall = useMutation({
    mutationFn: async (call: {
      title: string;
      client_id?: string | null;
      date: string;
      time: string;
      duration_minutes?: number;
      call_type?: string;
      status?: string;
      link?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("call_calendar")
        .insert({
          ...call,
          assigned_to: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
  });

  const updateCall = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("call_calendar")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
  });

  const deleteCall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("call_calendar")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
  });

  return {
    calls: callsQuery.data ?? [],
    isLoading: callsQuery.isLoading,
    createCall,
    updateCall,
    deleteCall,
  };
}
