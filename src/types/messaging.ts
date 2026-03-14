import type {
  Message,
  Channel,
  ChannelMember,
  MessageReaction,
  MessageAttachment,
  Profile,
} from "./database";

export interface MessageSender {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export type EnrichedMessage = Omit<
  Message,
  "sender" | "reactions" | "attachments" | "reply_message"
> & {
  sender: MessageSender | null;
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  reply_message?: {
    id: string;
    content: string;
    content_type: string;
    sender: { full_name: string } | null;
  } | null;
};

export interface MessageGroup {
  senderId: string;
  sender: MessageSender | null;
  messages: EnrichedMessage[];
  date: string;
}

export interface ChannelWithMeta extends Channel {
  unreadCount: number;
  urgentUnreadCount: number;
  isMuted: boolean;
  myLastRead: string | null;
  lastMessage?: {
    content: string;
    content_type: string;
    sender_name: string;
    created_at: string;
  } | null;
  dmPartner?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  } | null;
}
