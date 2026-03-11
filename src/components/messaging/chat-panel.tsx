"use client";

import { useCallback, useState } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useMessagingStore } from "@/stores/messaging-store";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { ThreadPanel } from "./thread-panel";
import { toast } from "sonner";
import type { ChannelWithMeta, EnrichedMessage } from "@/types/messaging";
import type { UseMutationResult } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

interface ChatPanelProps {
  channel: ChannelWithMeta;
  messages: EnrichedMessage[];
  isLoading: boolean;
  user: User | null;
  sendMessage: UseMutationResult<
    { id: string },
    Error,
    {
      content: string;
      contentType?: string;
      replyTo?: string;
      scheduledAt?: string;
    }
  >;
  editMessage: UseMutationResult<void, Error, { id: string; content: string }>;
  deleteMessage: UseMutationResult<void, Error, string>;
  togglePin: UseMutationResult<void, Error, { id: string; pinned: boolean }>;
  toggleReaction: UseMutationResult<
    void,
    Error,
    { messageId: string; emoji: string }
  >;
  addAttachment: UseMutationResult<
    void,
    Error,
    {
      messageId: string;
      fileName: string;
      fileUrl: string;
      fileType: string;
      fileSize: number;
    }
  >;
  onOpenMembers: () => void;
  onOpenMobileSidebar: () => void;
  isOnline?: (userId: string) => boolean;
  typingUsers: Array<{ userId: string; fullName: string }>;
  broadcastTyping: (fullName: string) => Promise<void>;
  stopTyping: (fullName: string) => Promise<void>;
}

export function ChatPanel({
  channel,
  messages,
  isLoading,
  user,
  sendMessage,
  editMessage,
  deleteMessage,
  togglePin,
  toggleReaction,
  addAttachment,
  onOpenMembers,
  onOpenMobileSidebar,
  isOnline,
  typingUsers,
  broadcastTyping,
  stopTyping,
}: ChatPanelProps) {
  const supabase = useSupabase();
  const {
    replyToMessage,
    setReplyTo,
    showSearchPanel,
    setShowSearchPanel,
    searchQuery,
    setSearchQuery,
  } = useMessagingStore();
  const [threadMessage, setThreadMessage] = useState<EnrichedMessage | null>(
    null,
  );

  const handleSend = useCallback(
    async (content: string, scheduledAt?: string) => {
      if (!content.trim()) return;
      await sendMessage.mutateAsync({
        content,
        replyTo: replyToMessage?.id,
        scheduledAt,
      });
      setReplyTo(null);
      if (scheduledAt) {
        toast.success("Message programme");
      }
    },
    [sendMessage, replyToMessage, setReplyTo],
  );

  const handleThreadReply = useCallback(
    async (content: string, replyTo: string) => {
      await sendMessage.mutateAsync({
        content,
        replyTo,
      });
    },
    [sendMessage],
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user || !channel) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Fichier trop volumineux (max 10 Mo)");
        return;
      }

      const ext = file.name.split(".").pop();
      const filePath = `${channel.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("message-attachments")
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Erreur lors de l'upload");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("message-attachments")
        .getPublicUrl(filePath);

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const contentType = isImage ? "image" : isVideo ? "video" : "file";

      const msg = await sendMessage.mutateAsync({
        content: file.name,
        contentType,
        replyTo: replyToMessage?.id,
      });

      if (msg?.id) {
        await addAttachment.mutateAsync({
          messageId: msg.id,
          fileName: file.name,
          fileUrl: urlData.publicUrl,
          fileType: file.type,
          fileSize: file.size,
        });
      }

      setReplyTo(null);
      toast.success("Fichier envoye");
    },
    [
      supabase,
      user,
      channel,
      sendMessage,
      addAttachment,
      replyToMessage,
      setReplyTo,
    ],
  );

  const handleVoiceSend = useCallback(
    async (blob: Blob, duration: number) => {
      if (!user || !channel) return;

      const ext = blob.type.includes("mp4")
        ? "m4a"
        : blob.type.includes("ogg")
          ? "ogg"
          : "webm";
      const filePath = `${channel.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("message-attachments")
        .upload(filePath, blob, { contentType: blob.type });

      if (uploadError) {
        toast.error("Erreur lors de l'upload");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("message-attachments")
        .getPublicUrl(filePath);

      const result = await sendMessage.mutateAsync({
        content: `Message vocal (${Math.ceil(duration)}s)`,
        contentType: "audio",
      });

      if (result?.id) {
        await addAttachment.mutateAsync({
          messageId: result.id,
          fileName: `vocal-${Date.now()}.webm`,
          fileUrl: urlData.publicUrl,
          fileType: "audio/webm",
          fileSize: blob.size,
        });
      }

      toast.success("Message vocal envoye");
    },
    [supabase, user, channel, sendMessage, addAttachment],
  );

  // Filter messages by search
  const displayedMessages = searchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : messages;

  return (
    <div className="flex flex-1 min-h-0">
      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          channel={channel}
          onOpenMembers={onOpenMembers}
          onOpenMobileSidebar={onOpenMobileSidebar}
          showSearch={showSearchPanel}
          onToggleSearch={() => {
            setShowSearchPanel(!showSearchPanel);
            if (showSearchPanel) setSearchQuery("");
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchResultCount={searchQuery ? displayedMessages.length : undefined}
          isOnline={isOnline}
        />

        <MessageList
          messages={displayedMessages}
          isLoading={isLoading}
          currentUserId={user?.id ?? ""}
          onReact={(messageId, emoji) =>
            toggleReaction.mutate({ messageId, emoji })
          }
          onReply={(msg) =>
            setReplyTo({
              id: msg.id,
              content: msg.content,
              senderName: msg.sender?.full_name ?? "Inconnu",
            })
          }
          onEdit={(id, content) => editMessage.mutate({ id, content })}
          onDelete={(id) => deleteMessage.mutate(id)}
          onPin={(id, pinned) => togglePin.mutate({ id, pinned })}
          onOpenThread={(msg) => setThreadMessage(msg)}
          searchQuery={searchQuery}
        />

        <TypingIndicator typingUsers={typingUsers} />

        <ChatInput
          channelName={channel.dmPartner?.full_name ?? channel.name}
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          onVoiceSend={handleVoiceSend}
          replyTo={replyToMessage}
          onCancelReply={() => setReplyTo(null)}
          isSending={sendMessage.isPending}
          onTyping={() =>
            broadcastTyping(user?.user_metadata?.full_name ?? "Quelqu'un")
          }
          onStopTyping={() =>
            stopTyping(user?.user_metadata?.full_name ?? "Quelqu'un")
          }
          channelId={channel.id}
        />
      </div>

      {/* Thread panel */}
      {threadMessage && (
        <ThreadPanel
          parentMessage={threadMessage}
          channelId={channel.id}
          user={user}
          onClose={() => setThreadMessage(null)}
          onSendReply={handleThreadReply}
          onReact={(messageId, emoji) =>
            toggleReaction.mutate({ messageId, emoji })
          }
        />
      )}
    </div>
  );
}
