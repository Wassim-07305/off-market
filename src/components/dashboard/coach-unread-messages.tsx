"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn, getInitials } from "@/lib/utils";
import { MessageSquare, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";

interface UnreadByStudent {
  studentId: string;
  fullName: string;
  avatarUrl: string | null;
  unreadCount: number;
  lastMessage: string;
}

function useCoachUnreadMessages() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-unread-messages", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<UnreadByStudent[]> => {
      // Get channels where the coach is a member
      const { data: channels } = await supabase
        .from("channel_members")
        .select("channel_id, channel:channels(id, is_dm)")
        .eq("profile_id", user!.id);

      type ChannelRow = {
        channel_id: string;
        channel: { id: string; is_dm: boolean } | null;
      };
      const typedChannels = (channels ?? []) as unknown as ChannelRow[];
      if (typedChannels.length === 0) return [];

      const dmChannelIds = typedChannels
        .filter((c) => c.channel?.is_dm)
        .map((c) => c.channel_id);

      if (dmChannelIds.length === 0) return [];

      // Get unread messages (messages in DM channels not sent by the coach)
      const { data: messages } = await supabase
        .from("messages")
        .select(
          "id, channel_id, content, created_at, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)",
        )
        .in("channel_id", dmChannelIds)
        .neq("sender_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(100);

      type MessageRow = {
        id: string;
        channel_id: string;
        content: string | null;
        created_at: string;
        sender: {
          id: string;
          full_name: string;
          avatar_url: string | null;
        } | null;
      };
      const typedMessages = (messages ?? []) as unknown as MessageRow[];
      if (typedMessages.length === 0) return [];

      // Group by sender
      const byStudent: Record<string, UnreadByStudent> = {};
      for (const msg of typedMessages) {
        if (!msg.sender) continue;

        if (!byStudent[msg.sender.id]) {
          byStudent[msg.sender.id] = {
            studentId: msg.sender.id,
            fullName: msg.sender.full_name,
            avatarUrl: msg.sender.avatar_url,
            unreadCount: 0,
            lastMessage: msg.content?.slice(0, 60) ?? "",
          };
        }
        byStudent[msg.sender.id].unreadCount++;
      }

      return Object.values(byStudent)
        .sort((a, b) => b.unreadCount - a.unreadCount)
        .slice(0, 8);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function CoachUnreadMessages() {
  const { data: unreadMessages, isLoading } = useCoachUnreadMessages();
  const prefix = useRoutePrefix();
  const totalUnread = (unreadMessages ?? []).reduce(
    (sum, m) => sum + m.unreadCount,
    0,
  );

  return (
    <div
      className="bg-surface rounded-xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          Messages non lus
        </h3>
        {totalUnread > 0 && (
          <span className="text-[10px] font-semibold text-white bg-primary px-2 py-0.5 rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 animate-shimmer rounded-lg" />
                <div className="h-2.5 w-40 animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : !unreadMessages || unreadMessages.length === 0 ? (
        <div className="py-6 text-center">
          <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun message non lu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unreadMessages.map((msg) => (
            <Link
              key={msg.studentId}
              href={`${prefix}/messaging?student=${msg.studentId}`}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors group"
            >
              {msg.avatarUrl ? (
                <Image
                  src={msg.avatarUrl}
                  alt={msg.fullName}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium shrink-0">
                  {getInitials(msg.fullName)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {msg.fullName}
                  </p>
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full shrink-0">
                    {msg.unreadCount}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {msg.lastMessage}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
