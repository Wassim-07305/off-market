"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Channel } from "@/types/database";
import type { ChannelWithMeta } from "@/types/messaging";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export function useChannels() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showArchived, setShowArchived] = useState(false);

  const channelsQuery = useQuery({
    queryKey: ["channels", showArchived],
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      // Fetch channels where user is a member
      let memberQuery = sb
        .from("channels")
        .select(
          `*,
          channel_members!inner(profile_id, last_read_at, notifications_muted, is_pinned)`,
        )
        .eq("channel_members.profile_id", user?.id ?? "");

      if (!showArchived) {
        memberQuery = memberQuery.eq("is_archived", false);
      }

      const { data: memberChannels, error: memberErr } =
        await memberQuery.order("last_message_at", {
          ascending: false,
          nullsFirst: false,
        });
      if (memberErr)
        console.warn("[channels] member query:", memberErr.message);

      // Also fetch public channels (visible to everyone even without membership)
      let publicQuery = sb
        .from("channels")
        .select("*")
        .eq("type", "public");

      if (!showArchived) {
        publicQuery = publicQuery.eq("is_archived", false);
      }

      const { data: publicChannelsData, error: pubErr } =
        await publicQuery.order("last_message_at", {
          ascending: false,
          nullsFirst: false,
        });
      if (pubErr) console.warn("[channels] public query:", pubErr.message);

      // Merge: member channels take priority, then add public channels not already included
      const memberIds = new Set((memberChannels ?? []).map((c: any) => c.id));
      const publicOnly = (publicChannelsData ?? [])
        .filter((c: any) => !memberIds.has(c.id))
        .map((c: any) => ({
          ...c,
          channel_members: [] as Array<{
            profile_id: string;
            last_read_at: string;
            notifications_muted: boolean;
            is_pinned: boolean;
          }>,
        }));

      const allChannels = [
        ...((memberChannels ?? []) as (Channel & {
          channel_members: Array<{
            profile_id: string;
            last_read_at: string;
            notifications_muted: boolean;
            is_pinned: boolean;
          }>;
        })[]),
        ...publicOnly,
      ];

      // Sort: pinned first, then by last_message_at desc
      allChannels.sort((a, b) => {
        const aPinned = a.channel_members?.[0]?.is_pinned ? 1 : 0;
        const bPinned = b.channel_members?.[0]?.is_pinned ? 1 : 0;
        if (aPinned !== bPinned) return bPinned - aPinned;
        const aTime = a.last_message_at ?? a.created_at ?? "";
        const bTime = b.last_message_at ?? b.created_at ?? "";
        return bTime.localeCompare(aTime);
      });

      return allChannels;
    },
    enabled: !!user,
  });

  // Fetch unread counts for all channels (total + urgent)
  const unreadQuery = useQuery({
    queryKey: [
      "channel-unreads",
      user?.id,
      channelsQuery.data?.map((c) => c.id).join(","),
    ],
    queryFn: async () => {
      if (!channelsQuery.data?.length) return {};
      const unreads: Record<string, { total: number; urgent: number }> = {};

      for (const ch of channelsQuery.data) {
        const memberInfo = ch.channel_members[0];
        const lastRead = memberInfo?.last_read_at;

        // Count unread messages NOT sent by me
        let totalQuery = sb
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("channel_id", ch.id)
          .neq("sender_id", user!.id)
          .is("deleted_at", null);

        if (lastRead) {
          totalQuery = totalQuery.gt("created_at", lastRead);
        }

        const { count, error } = await totalQuery;
        if (!error) {
          let urgentQuery = sb
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("channel_id", ch.id)
            .neq("sender_id", user!.id)
            .eq("is_urgent", true)
            .is("deleted_at", null);

          if (lastRead) {
            urgentQuery = urgentQuery.gt("created_at", lastRead);
          }

          const { count: urgentCount } = await urgentQuery;
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
      const { data, error } = await sb
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
      isPinned: ch.channel_members[0]?.is_pinned ?? false,
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
    const channel = sb
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
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => {
          // New message in any channel → refresh unread badges
          queryClient.invalidateQueries({ queryKey: ["channel-unreads"] });
          queryClient.invalidateQueries({ queryKey: ["channels"] });
        },
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
      const { data: channel, error } = await sb
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

      const { error: memberError } = await sb
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
      const { data: existingChannels } = await sb
        .from("channel_members")
        .select("channel_id")
        .eq("profile_id", user.id);

      const myChannelIds = (existingChannels ?? []).map((c: any) => c.channel_id);

      if (myChannelIds.length > 0) {
        const { data: otherMemberships } = await sb
          .from("channel_members")
          .select("channel_id")
          .eq("profile_id", otherUserId)
          .in("channel_id", myChannelIds);

        const sharedIds = (otherMemberships ?? []).map((c: any) => c.channel_id);

        if (sharedIds.length > 0) {
          const { data: existingDM } = await sb
            .from("channels")
            .select("*")
            .eq("type", "dm")
            .in("id", sharedIds)
            .maybeSingle();

          if (existingDM) return existingDM as Channel;
        }
      }

      // Fetch both profiles in parallel
      const [otherRes, myRes] = await Promise.all([
        sb
          .from("profiles")
          .select("full_name")
          .eq("id", otherUserId)
          .single(),
        sb
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single(),
      ]);

      if (otherRes.error || !otherRes.data) {
        throw new Error("Profil du destinataire introuvable");
      }

      const dmName = `${myRes.data?.full_name ?? "Moi"} & ${otherRes.data.full_name}`;

      const { data: channel, error } = await sb
        .from("channels")
        .insert({ name: dmName, type: "dm", created_by: user.id })
        .select()
        .single();
      if (error) throw error;

      const { error: membersError } = await sb
        .from("channel_members")
        .insert([
          { channel_id: channel.id, profile_id: user.id, role: "admin" },
          { channel_id: channel.id, profile_id: otherUserId, role: "member" },
        ]);

      if (membersError) {
        // Rollback: delete the channel if members insert failed
        await sb.from("channels").delete().eq("id", channel.id);
        throw membersError;
      }

      return channel as Channel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["dm-partners"] });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error ? err.message : "Erreur lors de la creation du DM";
      toast.error(msg);
    },
  });

  // Mute / unmute channel
  const muteChannel = useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await sb
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
      const { error } = await sb
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
      const { error } = await sb
        .from("channels")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user?.id ?? null,
        })
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
      const { error } = await sb
        .from("channels")
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null,
        })
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

  const pinChannel = useMutation({
    mutationFn: async ({
      channelId,
      pinned,
    }: {
      channelId: string;
      pinned: boolean;
    }) => {
      const { error } = await sb
        .from("channel_members")
        .update({ is_pinned: pinned })
        .eq("channel_id", channelId)
        .eq("profile_id", user?.id ?? "");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });

  const deleteChannel = useMutation({
    mutationFn: async (channelId: string) => {
      // 1. Récupérer les IDs des messages du canal
      const { data: msgs } = await sb
        .from("messages")
        .select("id")
        .eq("channel_id", channelId);
      const messageIds = (msgs ?? []).map((m: any) => m.id);

      // 2. Supprimer les fichiers du storage
      if (messageIds.length) {
        const { data: attachments } = await sb
          .from("message_attachments")
          .select("file_url")
          .in("message_id", messageIds);

        if (attachments?.length) {
          for (const att of attachments) {
            try {
              const url = new URL(att.file_url);
              // Extraire la cle B2 depuis l'URL publique
              // Format: https://s3.eu-central-003.backblazeb2.com/Off-Market/...
              const pathParts = url.pathname.split("/").slice(2); // Remove "" and bucket name
              const key = pathParts.join("/");
              if (key) {
                await fetch("/api/storage/delete", {
                  method: "DELETE",
                  body: JSON.stringify({ key }),
                  headers: { "Content-Type": "application/json" },
                });
              }
            } catch {
              // Ignorer les erreurs de suppression de fichier
            }
          }
        }

        // 3. Supprimer réactions et pièces jointes
        await sb
          .from("message_reactions")
          .delete()
          .in("message_id", messageIds);
        await sb
          .from("message_attachments")
          .delete()
          .in("message_id", messageIds);
      }

      // 4. Supprimer messages, membres, canal
      await sb.from("messages").delete().eq("channel_id", channelId);
      await sb
        .from("channel_members")
        .delete()
        .eq("channel_id", channelId);
      const { error } = await sb
        .from("channels")
        .delete()
        .eq("id", channelId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal supprime");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
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
    pinChannel,
    deleteChannel,
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
  const sb2 = supabase as AnySupabase;

  return useQuery({
    queryKey: ["channel-members", channelId],
    queryFn: async () => {
      const { data, error } = await sb2
        .from("channel_members")
        .select("*, profile:profiles(id, full_name, avatar_url, role, email)")
        .eq("channel_id", channelId!);
      if (error) throw error;
      return (data ?? []) as ChannelMemberRow[];
    },
    enabled: !!channelId,
  });
}
