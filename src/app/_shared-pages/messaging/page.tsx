"use client";

import { useState, useRef, useEffect } from "react";
import { useChannels } from "@/hooks/use-channels";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { getInitials, formatDate, cn } from "@/lib/utils";
import {
  Hash,
  Lock,
  User,
  Plus,
  Send,
  Search,
  Users,
  Smile,
  Paperclip,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { AddMembersModal } from "@/components/messaging/add-members-modal";
import { EmojiPicker } from "@/components/messaging/emoji-picker";

export default function MessagingPage() {
  const { channels, isLoading: channelsLoading, createChannel } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { messages, isLoading: messagesLoading, sendMessage, markAsRead } = useMessages(selectedChannelId);
  const { user, profile } = useAuth();
  const supabase = useSupabase();
  const [newMessage, setNewMessage] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [channelMemberIds, setChannelMemberIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedChannelId) markAsRead();
  }, [selectedChannelId]);

  // Fetch channel members when channel changes
  useEffect(() => {
    if (!selectedChannelId) return;
    supabase
      .from("channel_members")
      .select("profile_id")
      .eq("channel_id", selectedChannelId)
      .then(({ data }) => {
        setChannelMemberIds((data ?? []).map((m) => m.profile_id));
      });
  }, [selectedChannelId, supabase, showMembers]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await sendMessage.mutateAsync({ content: newMessage });
    setNewMessage("");
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    await createChannel.mutateAsync({
      name: newChannelName,
      type: "public",
      memberIds: user ? [user.id] : [],
    });
    setNewChannelName("");
    setShowNewChannel(false);
    toast.success("Canal cree");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !selectedChannelId) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }

    const ext = file.name.split(".").pop();
    const filePath = `${selectedChannelId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("message-attachments")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Erreur lors de l'upload");
      return;
    }

    const { data } = supabase.storage
      .from("message-attachments")
      .getPublicUrl(filePath);

    const isImage = file.type.startsWith("image/");
    const content = isImage
      ? `![${file.name}](${data.publicUrl})`
      : `[${file.name}](${data.publicUrl})`;

    await sendMessage.mutateAsync({ content, contentType: isImage ? "image" : "file" });
    toast.success("Fichier envoye");

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getChannelIcon = (type: string) => {
    if (type === "private") return Lock;
    if (type === "dm") return User;
    return Hash;
  };

  // Filter messages by search
  const displayedMessages = searchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-surface rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Channel list */}
      <div className="w-64 border-r border-border/50 flex flex-col shrink-0 hidden sm:flex">
        <div className="p-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground">Canaux</h2>
            <button
              onClick={() => setShowNewChannel(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showNewChannel && (
            <div className="flex gap-1.5 mb-2">
              <input
                autoFocus
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Nom du canal"
                className="flex-1 h-8 px-2.5 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
              />
              <button
                onClick={handleCreateChannel}
                className="h-8 px-2 bg-primary text-white rounded-lg text-xs"
              >
                OK
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {channelsLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : channels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Aucun canal
            </p>
          ) : (
            channels.map((channel) => {
              const Icon = getChannelIcon(channel.type);
              const isActive = channel.id === selectedChannelId;
              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={cn(
                    "relative w-full flex items-center gap-2.5 px-3 h-9 rounded-xl text-[13px] transition-all duration-200",
                    isActive
                      ? "bg-primary/8 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedChannel ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Selectionne un canal pour commencer
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Channel header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getChannelIcon(selectedChannel.type);
                  return <Icon className="w-4 h-4 text-muted-foreground" />;
                })()}
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedChannel.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {channelMemberIds.length} membre{channelMemberIds.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowSearch(!showSearch);
                    if (showSearch) setSearchQuery("");
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    showSearch
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Search className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowMembers(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search bar */}
            {showSearch && (
              <div className="px-4 py-2 border-b border-border flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans les messages..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {searchQuery && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {displayedMessages.length} resultat{displayedMessages.length !== 1 ? "s" : ""}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-3 w-56 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayedMessages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "Aucun message ne correspond"
                      : "Aucun message dans ce canal. Ecris le premier !"}
                  </p>
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const sender = msg.sender as { id: string; full_name: string; avatar_url: string | null; role: string } | null;
                  const isImage = msg.content_type === "image" || msg.content.startsWith("![");

                  return (
                    <div key={msg.id} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                        {sender?.avatar_url ? (
                          <img src={sender.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          sender ? getInitials(sender.full_name) : "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              sender?.role === "admin" || sender?.role === "coach"
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {sender?.full_name ?? "Inconnu"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(msg.created_at, "relative")}
                          </span>
                        </div>
                        {isImage && msg.content.includes("](") ? (
                          <img
                            src={msg.content.match(/\((.*?)\)/)?.[1] ?? ""}
                            alt="image"
                            className="mt-1 max-w-xs rounded-lg border border-border"
                          />
                        ) : msg.content_type === "file" || (msg.content.startsWith("[") && msg.content.includes("](")) ? (
                          <a
                            href={msg.content.match(/\((.*?)\)/)?.[1] ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-sm text-foreground hover:bg-muted/80 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            {msg.content.match(/\[(.*?)\]/)?.[1] ?? "Fichier"}
                          </a>
                        ) : (
                          <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border/50 p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-muted/50 rounded-2xl px-4 py-2.5 flex items-end gap-2" style={{ boxShadow: "var(--shadow-xs)" }}>
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="flex items-center gap-0.5 shrink-0 relative">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowEmoji(!showEmoji)}
                      className={cn(
                        "w-7 h-7 rounded flex items-center justify-center transition-colors",
                        showEmoji ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    {showEmoji && (
                      <EmojiPicker
                        onSelect={(emoji) => setNewMessage((prev) => prev + emoji)}
                        onClose={() => setShowEmoji(false)}
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white hover:bg-primary-hover transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Members modal */}
      {selectedChannelId && (
        <AddMembersModal
          open={showMembers}
          onClose={() => setShowMembers(false)}
          channelId={selectedChannelId}
          existingMemberIds={channelMemberIds}
        />
      )}
    </div>
  );
}
