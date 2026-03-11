import { useChannels } from "@/hooks/useChannels";

/**
 * Hook pour obtenir le nombre total de messages non lus
 */
export function useUnreadCount() {
  const { data: channels } = useChannels();

  const totalUnread =
    channels?.reduce((sum, channel) => sum + (channel.unread_count ?? 0), 0) ??
    0;

  return totalUnread;
}
