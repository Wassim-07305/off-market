"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect } from "react";
import type { Channel } from "@/types/database";

export function useChannels() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const channelsQuery = useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*, channel_members!inner(profile_id, last_read_at)")
        .eq("channel_members.profile_id", user?.id ?? "")
        .eq("is_archived", false)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data as (Channel & { channel_members: Array<{ profile_id: string; last_read_at: string }> })[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    const channel = supabase
      .channel("channels-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        () => queryClient.invalidateQueries({ queryKey: ["channels"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channel_members" },
        () => queryClient.invalidateQueries({ queryKey: ["channels"] })
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, queryClient]);

  const createChannel = useMutation({
    mutationFn: async ({
      name,
      description,
      type,
      memberIds,
    }: {
      name: string;
      description?: string;
      type: "public" | "private" | "dm";
      memberIds: string[];
    }) => {
      const { data: channel, error } = await supabase
        .from("channels")
        .insert({
          name,
          description,
          type,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;

      const members = memberIds.map((profileId) => ({
        channel_id: channel.id,
        profile_id: profileId,
        role: profileId === user?.id ? "admin" : "member",
      }));
      if (user && !memberIds.includes(user.id)) {
        members.push({
          channel_id: channel.id,
          profile_id: user.id,
          role: "admin",
        });
      }

      const { error: memberError } = await supabase
        .from("channel_members")
        .insert(members);
      if (memberError) throw memberError;

      return channel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  return {
    channels: channelsQuery.data ?? [],
    isLoading: channelsQuery.isLoading,
    createChannel,
  };
}
