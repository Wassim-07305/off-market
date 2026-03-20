"use client";

import { useCallback, useMemo, useState } from "react";
import { useMessagingStore } from "@/stores/messaging-store";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { ThreadPanel } from "./thread-panel";
import { PinnedMessagesBar } from "./pinned-messages-bar";
import { BookmarksPanel } from "./bookmarks-panel";
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
      isUrgent?: boolean;
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
  onPin?: () => void;
  onMute?: () => void;
  onArchive?: () => void;
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
  onPin,
  onMute,
  onArchive,
  typingUsers,
  broadcastTyping,
  stopTyping,
}: ChatPanelProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const {
    replyToMessage,
    setReplyTo,
    showSearchPanel,
    setShowSearchPanel,
    searchQuery,
    setSearchQuery,
    showBookmarksPanel,
    setShowBookmarksPanel,
  } = useMessagingStore();
  const { isBookmarked, toggleBookmark, bookmarkedMessages } = useBookmarks();
  const [threadMessage, setThreadMessage] = useState<EnrichedMessage | null>(
    null,
  );

  // Compute pinned messages from the current channel's messages
  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.is_pinned),
    [messages],
  );

  const handleSend = useCallback(
    async (content: string, scheduledAt?: string, isUrgent?: boolean) => {
      if (!content.trim()) return;
      await sendMessage.mutateAsync({
        content,
        replyTo: replyToMessage?.id,
        scheduledAt,
        isUrgent,
      });
      setReplyTo(null);
      if (scheduledAt) {
        toast.success("Message programme");
      }
      if (isUrgent) {
        toast.success("Message urgent envoye");
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
      const filePath = `message-attachments/${channel.id}/${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", filePath);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Erreur lors de l'upload");
        return;
      }

      const { url } = await res.json();

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
          fileUrl: url,
          fileType: file.type,
          fileSize: file.size,
        });
      }

      setReplyTo(null);
      toast.success("Fichier envoye");
    },
    [user, channel, sendMessage, addAttachment, replyToMessage, setReplyTo],
  );

  const handleVoiceSend = useCallback(
    async (blob: Blob, duration: number) => {
      if (!user || !channel) return;

      const ext = blob.type.includes("mp4")
        ? "m4a"
        : blob.type.includes("ogg")
          ? "ogg"
          : "webm";
      const filePath = `message-attachments/${channel.id}/${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append(
        "file",
        new File([blob], `vocal-${Date.now()}.${ext}`, { type: blob.type }),
      );
      formData.append("path", filePath);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        toast.error("Erreur lors de l'upload");
        return;
      }

      const { url } = await res.json();

      const result = await sendMessage.mutateAsync({
        content: `Message vocal (${Math.ceil(duration)}s)`,
        contentType: "audio",
      });

      if (result?.id) {
        await addAttachment.mutateAsync({
          messageId: result.id,
          fileName: `vocal-${Date.now()}.webm`,
          fileUrl: url,
          fileType: "audio/webm",
          fileSize: blob.size,
        });
      }

      toast.success("Message vocal envoye");
    },
    [user, channel, sendMessage, addAttachment],
  );

  const handleGifSend = useCallback(
    async (gifUrl: string) => {
      await sendMessage.mutateAsync({
        content: gifUrl,
        contentType: "image",
        replyTo: replyToMessage?.id,
      });
      setReplyTo(null);
    },
    [sendMessage, replyToMessage, setReplyTo],
  );

  // Filter messages by search
  const displayedMessages = searchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : messages;

  return (
    <div
      className="flex flex-1 min-h-0 relative"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDraggingOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setDroppedFile(file);
      }}
    >
      {/* Drag overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 bg-primary/5 border-2 border-dashed border-primary rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-primary">
              Deposer le fichier ici
            </p>
          </div>
        </div>
      )}
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
          showBookmarks={showBookmarksPanel}
          onToggleBookmarks={() => setShowBookmarksPanel(!showBookmarksPanel)}
          onPin={onPin}
          onMute={onMute}
          onArchive={onArchive}
        />

        <PinnedMessagesBar
          pinnedMessages={pinnedMessages}
          onJumpToMessage={(id) => {
            document
              .getElementById(`msg-${id}`)
              ?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          onUnpin={(id) => togglePin.mutate({ id, pinned: true })}
        />

        <MessageList
          messages={displayedMessages}
          isLoading={isLoading}
          currentUserId={user?.id ?? ""}
          channelId={channel.id}
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
          onBookmark={(messageId) => toggleBookmark.mutate(messageId)}
          isBookmarked={isBookmarked}
        />

        <TypingIndicator typingUsers={typingUsers} />

        <ChatInput
          channelName={channel.dmPartner?.full_name ?? channel.name}
          onSend={handleSend}
          onFileUpload={handleFileUpload}
          onVoiceSend={handleVoiceSend}
          onGifSend={handleGifSend}
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
          droppedFile={droppedFile}
          onClearDroppedFile={() => setDroppedFile(null)}
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

      {/* Bookmarks panel */}
      <BookmarksPanel
        bookmarks={bookmarkedMessages}
        open={showBookmarksPanel}
        onClose={() => setShowBookmarksPanel(false)}
        onJumpToMessage={(id) => {
          document
            .getElementById(`msg-${id}`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        onRemoveBookmark={(messageId) => toggleBookmark.mutate(messageId)}
      />
    </div>
  );
}
