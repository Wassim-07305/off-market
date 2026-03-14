"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Channel } from "@/types/database";
import type { ChannelWithMeta } from "@/types/messaging";

export function useChannels() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);

  const channelsQuery = useQuery({
    queryKey: ["channels", showArchived],
    queryFn: async () => {
      let query = supabase
        .from("channels")
        .select(
          `*,
          channel_members!inner(profile_id, last_read_at, notifications_muted)`,
        )
        .eq("channel_members.profile_id", user?.id ?? "");

      if (!showArchived) {
        query = query.eq("is_archived", false);
      }

      const { data, error } = await query.order("last_message_at", {
        ascending: false,
        nullsFirst: false,
      });
      if (error) throw error;

      return (data ?? []) as (Channel & {
        channel_members: Array<{
          profile_id: string;
          last_read_at: string;
          notifications_muted: boolean;
        }>;
      })[];
    },
    enabled: !!user,
  });

  // Fetch unread counts for all channels (total + urgent)
  const unreadQuery = useQuery({
    queryKey: ["channel-unreads", user?.id, channelsQuery.data?.map((c) => c.id).join(",")],
    queryFn: async () => {
      if (!channelsQuery.data?.length) return {};
      const unreads: Record<string, { total: number; urgent: number }> = {};

      for (const ch of channelsQuery.data) {
        const memberInfo = ch.channel_members[0];
        if (!memberInfo?.last_read_at) {
          unreads[ch.id] = { total: 0, urgent: 0 };
          continue;
        }
        // Total unread
        const { count, error } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("channel_id", ch.id)
          .is("deleted_at", null)
          .gt("created_at", memberInfo.last_read_at);
        if (!error) {
          // Urgent unread
          const { count: urgentCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("channel_id", ch.id)
            .eq("is_urgent", true)
            .is("deleted_at", null)
            .gt("created_at", memberInfo.last_read_at);
          unreads[ch.id] = {
            total: count ?? 0,
            urgent: urgentCount ?? 0,
          };
        }
      }
      return unreads;
    },
    enabled: !!channelsQuery.data?.length,
    refetchInterval: 30000,
  });

  // Fetch DM partner profiles
  const dmChannelIds = useMemo(
    () =>
      (channelsQuery.data ?? [])
        .filter((c) => c.type === "dm")
        .map((c) => c.id),
    [channelsQuery.data],
  );

  const dmPartnersQuery = useQuery({
    queryKey: ["dm-partners", dmChannelIds],
    queryFn: async () => {
      if (!dmChannelIds.length || !user) return {};
      const { data, error } = await supabase
        .from("channel_members")
        .select("channel_id, profile:profiles(id, full_name, avatar_url, role)")
        .in("channel_id", dmChannelIds)
        .neq("profile_id", user.id);
      if (error) throw error;

      const map: Record<
        string,
        {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: string;
        }
      > = {};
      for (const row of data ?? []) {
        const p = row.profile as unknown as {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: string;
        };
        if (p) map[row.channel_id] = p;
      }
      return map;
    },
    enabled: dmChannelIds.length > 0,
  });

  // Enrich channels with metadata
  const channels = useMemo((): ChannelWithMeta[] => {
    return (channelsQuery.data ?? []).map((ch) => ({
      ...ch,
      unreadCount: unreadQuery.data?.[ch.id]?.total ?? 0,
      urgentUnreadCount: unreadQuery.data?.[ch.id]?.urgent ?? 0,
      isMuted: ch.channel_members[0]?.notifications_muted ?? false,
      myLastRead: ch.channel_members[0]?.last_read_at ?? null,
      dmPartner: dmPartnersQuery.data?.[ch.id] ?? null,
    }));
  }, [channelsQuery.data, unreadQuery.data, dmPartnersQuery.data]);

  const publicChannels = useMemo(
    () => channels.filter((c) => c.type === "public" || c.type === "private"),
    [channels],
  );

  const dmChannels = useMemo(
    () => channels.filter((c) => c.type === "dm"),
    [channels],
  );

  // Separate active and archived channels
  const activePublicChannels = useMemo(
    () => publicChannels.filter((c) => !c.is_archived),
    [publicChannels],
  );

  const archivedChannels = useMemo(
    () => channels.filter((c) => c.is_archived),
    [channels],
  );

  useEffect(() => {
    const channel = supabase
      .channel("channels-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channels" },
        () => queryClient.invalidateQueries({ queryKey: ["channels"] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "channel_members" },
        () => queryClient.invalidateQueries({ queryKey: ["channels"] }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        .insert({ name, description, type, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;

      const members = memberIds.map((profileId) => ({
        channel_id: channel.id,
        profile_id: profileId,
        role: profileId === user?.id ? "admin" : ("member" as const),
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

  const createDMChannel = useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error("Not authenticated");

      // Check if DM already exists between these two users
      const { data: existingChannels } = await supabase
        .from("channel_members")
        .select("channel_id")
        .eq("profile_id", user.id);

      const myChannelIds = (existingChannels ?? []).map((c) => c.channel_id);

      if (myChannelIds.length > 0) {
        const { data: otherMemberships } = await supabase
          .from("channel_members")
          .select("channel_id")
          .eq("profile_id", otherUserId)
          .in("channel_id", myChannelIds);

        const sharedIds = (otherMemberships ?? []).map((c) => c.channel_id);

        if (sharedIds.length > 0) {
          const { data: existingDM } = await supabase
            .from("channels")
            .select("*")
            .eq("type", "dm")
            .in("id", sharedIds)
            .maybeSingle();

          if (existingDM) return existingDM as Channel;
        }
      }

      // Fetch other user's name
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .single();

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const dmName = `${myProfile?.full_name ?? "?"} & ${otherProfile?.full_name ?? "?"}`;

      const { data: channel, error } = await supabase
        .from("channels")
        .insert({ name: dmName, type: "dm", created_by: user.id })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("channel_members").insert([
        { channel_id: channel.id, profile_id: user.id, role: "admin" },
        { channel_id: channel.id, profile_id: otherUserId, role: "member" },
      ]);

      return channel as Channel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["dm-partners"] });
    },
  });

  // Mute / unmute channel
  const muteChannel = useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("channel_members")
        .update({ notifications_muted: true })
        .eq("channel_id", channelId)
        .eq("profile_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal mis en sourdine");
    },
    onError: () => {
      toast.error("Erreur lors de la mise en sourdine");
    },
  });

  const unmuteChannel = useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("channel_members")
        .update({ notifications_muted: false })
        .eq("channel_id", channelId)
        .eq("profile_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Notifications reactivees");
    },
    onError: () => {
      toast.error("Erreur lors de la reactivation");
    },
  });

  // Archive / unarchive channel
  const archiveChannel = useMutation({
    mutationFn: async (channelId: string) => {
      const { error } = await supabase
        .from("channels")
        .update({ is_archived: true })
        .eq("id", channelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal archive");
    },
    onError: () => {
      toast.error("Erreur lors de l'archivage");
    },
  });

  const unarchiveChannel = useMutation({
    mutationFn: async (channelId: string) => {
      const { error } = await supabase
        .from("channels")
        .update({ is_archived: false })
        .eq("id", channelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal desarchive");
    },
    onError: () => {
      toast.error("Erreur lors du desarchivage");
    },
  });

  return {
    channels,
    publicChannels: activePublicChannels,
    archivedChannels,
    dmChannels,
    isLoading: channelsQuery.isLoading,
    createChannel,
    createDMChannel,
    muteChannel,
    unmuteChannel,
    archiveChannel,
    unarchiveChannel,
    showArchived,
    setShowArchived,
  };
}

interface ChannelMemberRow {
  id: string;
  channel_id: string;
  profile_id: string;
  role: string;
  last_read_at: string;
  notifications_muted: boolean;
  joined_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    email: string;
  } | null;
}

export function useChannelMembers(channelId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["channel-members", channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_members")
        .select("*, profile:profiles(id, full_name, avatar_url, role, email)")
        .eq("channel_id", channelId!);
      if (error) throw error;
      return (data ?? []) as ChannelMemberRow[];
    },
    enabled: !!channelId,
  });
}
