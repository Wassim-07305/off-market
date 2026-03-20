"use client";

import { useEffect, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChannels } from "@/hooks/use-channels";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTyping } from "@/hooks/use-typing";
import { useMessagingStore } from "@/stores/messaging-store";
import { ChannelSidebar } from "./channel-sidebar";
import { ChatPanel } from "./chat-panel";
import { ChannelSettingsModal } from "./channel-settings-modal";
import { UnifiedInbox } from "./unified-inbox";
import { Hash, MessageSquare, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type InboxMode = "internal" | "external";

export default function MessagingContainer() {
  const [inboxMode, setInboxMode] = useState<InboxMode>("internal");
  const { user, isStaff } = useAuth();
  const queryClient = useQueryClient();
  const {
    channels,
    publicChannels,
    archivedChannels,
    dmChannels,
    isLoading: channelsLoading,
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
  } = useChannels();

  const {
    activeChannelId,
    setActiveChannelId,
    showMembersPanel,
    setShowMembersPanel,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useMessagingStore();

  const selectedChannel =
    channels.find((c) => c.id === activeChannelId) ?? null;

  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    addAttachment,
    markAsRead,
  } = useMessages(activeChannelId);

  const { isOnline } = useOnlineStatus();
  const { typingUsers, broadcastTyping, stopTyping } =
    useTyping(activeChannelId);

  // If user loses staff access, reset to internal inbox
  useEffect(() => {
    if (!isStaff && inboxMode === "external") {
      setInboxMode("internal");
    }
  }, [isStaff, inboxMode]);

  // Auto-select first channel
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId, setActiveChannelId]);

  // Mark as read when channel changes or markAsRead updates (new channel's closure)
  useEffect(() => {
    if (activeChannelId) {
      markAsRead();
    }
  }, [activeChannelId, markAsRead]);

  const handleSelectChannel = useCallback(
    (id: string) => {
      setActiveChannelId(id);
      setMobileSidebarOpen(false);
    },
    [setActiveChannelId, setMobileSidebarOpen],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* ── Inbox mode toggle ── */}
      <div className="flex items-center bg-muted/60 backdrop-blur-sm rounded-xl p-1 mb-3 w-fit border border-border/30">
        <button
          onClick={() => setInboxMode("internal")}
          className={cn(
            "flex items-center gap-2 px-4 h-8 rounded-lg text-xs font-semibold transition-all duration-200",
            inboxMode === "internal"
              ? "bg-surface text-foreground shadow-md shadow-black/5 ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground hover:bg-surface/50",
          )}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Off-Market
        </button>
        {isStaff && (
          <button
            onClick={() => setInboxMode("external")}
            className={cn(
              "flex items-center gap-2 px-4 h-8 rounded-lg text-xs font-semibold transition-all duration-200",
              inboxMode === "external"
                ? "bg-surface text-foreground shadow-md shadow-black/5 ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-surface/50",
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            Boite unifiee
          </button>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 min-h-0 bg-surface rounded-2xl overflow-hidden border border-border/50 shadow-lg shadow-black/[0.03]">
        {inboxMode === "external" ? (
          <UnifiedInbox />
        ) : (
          <>
            {/* Sidebar */}
            <div
              className={`
              w-[272px] border-r border-border/30 flex flex-col shrink-0 bg-surface
              max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-30 max-sm:w-[272px] max-sm:bg-surface max-sm:shadow-xl max-sm:shadow-black/10
              ${mobileSidebarOpen ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"}
              sm:relative sm:translate-x-0 transition-transform duration-300 ease-out
            `}
            >
              <ChannelSidebar
                publicChannels={publicChannels}
                archivedChannels={archivedChannels}
                dmChannels={dmChannels}
                activeChannelId={activeChannelId}
                onSelectChannel={handleSelectChannel}
                onCreateChannel={({ name, description, type, memberIds }) =>
                  createChannel.mutateAsync({
                    name,
                    description,
                    type,
                    memberIds: user
                      ? [...new Set([user.id, ...memberIds])]
                      : memberIds,
                  })
                }
                onCreateDM={(userId) =>
                  createDMChannel.mutateAsync(userId).then((ch) => {
                    setActiveChannelId(ch.id);
                  })
                }
                isLoading={channelsLoading}
                isOnline={isOnline}
                showArchived={showArchived}
                onToggleShowArchived={() => setShowArchived(!showArchived)}
              />
            </div>

            {/* Backdrop for mobile sidebar */}
            {mobileSidebarOpen && (
              <div
                className="sm:hidden fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
                onClick={() => setMobileSidebarOpen(false)}
              />
            )}

            {/* Chat area */}
            <div
              className="flex-1 flex flex-col min-w-0"
              key={activeChannelId ?? "empty"}
            >
              {selectedChannel ? (
                <ChatPanel
                  channel={selectedChannel}
                  messages={messages}
                  isLoading={messagesLoading}
                  user={user}
                  sendMessage={sendMessage}
                  editMessage={editMessage}
                  deleteMessage={deleteMessage}
                  togglePin={togglePin}
                  toggleReaction={toggleReaction}
                  addAttachment={addAttachment}
                  onOpenMembers={() => setShowMembersPanel(true)}
                  onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                  isOnline={isOnline}
                  onPin={() =>
                    selectedChannel &&
                    pinChannel.mutate({
                      channelId: selectedChannel.id,
                      pinned: !selectedChannel.isPinned,
                    })
                  }
                  onMute={() =>
                    selectedChannel &&
                    (selectedChannel.isMuted
                      ? unmuteChannel.mutate(selectedChannel.id)
                      : muteChannel.mutate(selectedChannel.id))
                  }
                  onArchive={() =>
                    selectedChannel &&
                    (selectedChannel.is_archived
                      ? unarchiveChannel.mutate(selectedChannel.id)
                      : archiveChannel.mutate(selectedChannel.id))
                  }
                  typingUsers={typingUsers}
                  broadcastTyping={broadcastTyping}
                  stopTyping={stopTyping}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-surface via-surface to-[#AF0000]/[0.02]">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#AF0000]/10 to-[#DC2626]/10 flex items-center justify-center mx-auto mb-4 shadow-sm shadow-[#AF0000]/5">
                      <Hash className="w-6 h-6 text-[#AF0000]/60" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Selectionne un canal pour commencer
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Tes conversations apparaitront ici
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Channel settings modal */}
            {selectedChannel && (
              <ChannelSettingsModal
                channel={selectedChannel}
                open={showMembersPanel}
                onClose={() => setShowMembersPanel(false)}
                isOnline={isOnline}
                onMute={() => muteChannel.mutate(selectedChannel.id)}
                onUnmute={() => unmuteChannel.mutate(selectedChannel.id)}
                onArchive={() => archiveChannel.mutate(selectedChannel.id)}
                onUnarchive={() => unarchiveChannel.mutate(selectedChannel.id)}
                onPin={(channelId, pinned) =>
                  pinChannel.mutate({ channelId, pinned })
                }
                onDelete={() => {
                  if (selectedChannel) {
                    deleteChannel.mutate(selectedChannel.id);
                    setActiveChannelId(null);
                  }
                }}
                userRole={user?.user_metadata?.role}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
