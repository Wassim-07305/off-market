import { useChannels } from "@/hooks/use-channels";

/**
 * Hook pour obtenir le nombre total de messages non lus
 */
export function useUnreadCount() {
  const { channels } = useChannels();

  const totalUnread =
    channels.reduce((sum: number, channel) => sum + (channel.unreadCount ?? 0), 0);

  return totalUnread;
}
