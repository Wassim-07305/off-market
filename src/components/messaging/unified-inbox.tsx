"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";
import {
  useUnipileAccounts,
  useUnipileChats,
  useUnipileMessages,
  useUnipileAttendees,
  useSendUnipileMessage,
} from "@/hooks/use-unipile";
import type { UnipileAccount, UnipileChat } from "@/hooks/use-unipile";
import {
  Linkedin,
  MessageCircle,
  Instagram,
  Send,
  Loader2,
  Search,
  User,
  Inbox,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Platform helpers ──────────────────────────────────

function getPlatformIcon(type: string) {
  const t = type.toUpperCase();
  if (t.includes("LINKEDIN")) return Linkedin;
  if (t.includes("WHATSAPP")) return MessageCircle;
  if (t.includes("INSTAGRAM")) return Instagram;
  return Inbox;
}

function getPlatformLabel(type: string) {
  const t = type.toUpperCase();
  if (t.includes("LINKEDIN")) return "LinkedIn";
  if (t.includes("WHATSAPP")) return "WhatsApp";
  if (t.includes("INSTAGRAM")) return "Instagram";
  return type;
}

function getPlatformColor(type: string) {
  const t = type.toUpperCase();
  if (t.includes("LINKEDIN")) return "text-[#0A66C2]";
  if (t.includes("WHATSAPP")) return "text-[#25D366]";
  if (t.includes("INSTAGRAM")) return "text-[#E1306C]";
  return "text-primary";
}

function getPlatformBg(type: string) {
  const t = type.toUpperCase();
  if (t.includes("LINKEDIN")) return "bg-[#0A66C2]/10";
  if (t.includes("WHATSAPP")) return "bg-[#25D366]/10";
  if (t.includes("INSTAGRAM")) return "bg-[#E1306C]/10";
  return "bg-primary/10";
}

function formatTimestamp(ts: string) {
  try {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return "a l'instant";
    if (diffMin < 60) return `il y a ${diffMin}min`;
    if (diffH < 24) return `il y a ${diffH}h`;
    if (diffD < 7) return `il y a ${diffD}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "";
  }
}

function formatMessageTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

// ── Main Component ────────────────────────────────────

export function UnifiedInbox() {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Queries ──
  const { data: accounts, isLoading: accountsLoading } = useUnipileAccounts();
  const {
    data: chats,
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useUnipileChats(selectedAccountId);
  const {
    data: messages,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useUnipileMessages(selectedChatId);
  const { data: attendees } = useUnipileAttendees(selectedChatId);
  const sendMessage = useSendUnipileMessage();

  // Auto-select first account
  useEffect(() => {
    if (!selectedAccountId && accounts && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get selected account info
  const selectedAccount = accounts?.find(
    (a: UnipileAccount) => a.id === selectedAccountId,
  );

  // Get selected chat info
  const selectedChat = chats?.find((c: UnipileChat) => c.id === selectedChatId);

  // Filter chats by search
  const filteredChats = (chats ?? []).filter((c: UnipileChat) =>
    chatSearch
      ? (c.name ?? "").toLowerCase().includes(chatSearch.toLowerCase())
      : true,
  );

  // Get attendee map for display names in messages
  // Index by both Unipile id and provider_id since sender_id can be either
  const attendeeMap = useMemo(() => {
    const map = new Map<string, (typeof attendees extends (infer T)[] | undefined ? T : never)>();
    for (const a of attendees ?? []) {
      map.set(a.id, a);
      if (a.provider_id) map.set(a.provider_id, a);
    }
    return map;
  }, [attendees]);

  // Fallback: the other person in this chat
  const otherAttendee = useMemo(
    () => (attendees ?? []).find((a) => !a.is_self),
    [attendees],
  );

  const handleSend = useCallback(async () => {
    if (!messageInput.trim() || !selectedChatId) return;
    try {
      await sendMessage.mutateAsync({
        chatId: selectedChatId,
        text: messageInput.trim(),
      });
      setMessageInput("");
    } catch {
      // L'erreur est geree par la mutation (onError)
    }
  }, [messageInput, selectedChatId, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // ── Render ──

  if (accountsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Chargement des comptes...
        </span>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aucun compte externe connecte
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Configurez Unipile pour connecter LinkedIn, WhatsApp ou Instagram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* ── Left sidebar: Platform tabs + Chat list ── */}
      <div
        className={cn(
          "w-[272px] border-r border-border/40 flex flex-col shrink-0 bg-muted/30",
          "max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-30 max-sm:w-[280px] max-sm:bg-surface max-sm:shadow-xl",
          mobileChatOpen ? "max-sm:-translate-x-full" : "max-sm:translate-x-0",
          "sm:relative sm:translate-x-0 transition-transform duration-200",
        )}
      >
        {/* Platform tabs */}
        <div className="h-14 border-b border-border/40 flex items-center px-2 gap-1">
          {accounts.map((account: UnipileAccount) => {
            const Icon = getPlatformIcon(account.type);
            const isActive = account.id === selectedAccountId;
            const colorClass = getPlatformColor(account.type);
            const bgClass = getPlatformBg(account.type);
            return (
              <button
                key={account.id}
                onClick={() => {
                  setSelectedAccountId(account.id);
                  setSelectedChatId(null);
                  setChatSearch("");
                }}
                title={`${getPlatformLabel(account.type)} — ${account.name}`}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? `${bgClass} ${colorClass} shadow-sm`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">
                  {getPlatformLabel(account.type)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full h-8 pl-7 pr-2.5 bg-surface border border-border/60 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {chatsLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-muted/50 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2.5 py-4 text-center">
              Aucune conversation
            </p>
          ) : (
            filteredChats.map((chat: UnipileChat) => {
              const isActive = chat.id === selectedChatId;
              const chatDisplayName = chat.name || "Conversation";
              const chatAvatarUrl = chat._attendee_id
                ? `/api/unipile/attendee-picture/${chat._attendee_id}`
                : null;
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setSelectedChatId(chat.id);
                    setMobileChatOpen(true);
                  }}
                  className={cn(
                    "w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150",
                    isActive
                      ? "bg-primary/10 shadow-sm"
                      : "hover:bg-muted/60 active:scale-[0.98]",
                  )}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {chatAvatarUrl ? (
                      <Image
                        src={chatAvatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {getInitials(chatDisplayName)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "text-[13px] font-medium truncate",
                          isActive ? "text-primary" : "text-foreground",
                        )}
                      >
                        {chatDisplayName}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">
                        {formatTimestamp(chat.timestamp)}
                      </span>
                    </div>
                    {chat.last_message_text && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {chat.last_message_text}
                      </p>
                    )}
                  </div>

                  {/* Unread badge */}
                  {(chat.unread_count ?? 0) > 0 && (
                    <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1 mt-0.5">
                      {(chat.unread_count ?? 0) > 99
                        ? "99+"
                        : chat.unread_count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Refresh button */}
        <div className="px-3 py-2 border-t border-border/40">
          <button
            onClick={() => refetchChats()}
            className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChatId && selectedChat ? (
          <>
            {/* Chat header */}
            <div className="h-12 sm:h-14 border-b border-border/40 flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
              {/* Mobile back button */}
              <button
                onClick={() => setMobileChatOpen(false)}
                className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Contact avatar or platform icon */}
              {(() => {
                const mainAttendee = attendees?.find((a) => !a.is_self);
                const headerAvatar = mainAttendee?.profile_picture;
                if (headerAvatar) {
                  return (
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      <Image
                        src={headerAvatar}
                        alt=""
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                  );
                }
                if (selectedAccount) {
                  const Icon = getPlatformIcon(selectedAccount.type);
                  return (
                    <div className={cn("w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0", getPlatformBg(selectedAccount.type))}>
                      <Icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", getPlatformColor(selectedAccount.type))} />
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {selectedChat.name || attendees?.find((a) => !a.is_self)?.display_name || "Conversation"}
                </h3>
                {/* Show attendee info */}
                {attendees && attendees.length > 0 && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {attendees
                      .filter((a) => !a.is_self)
                      .map((a) => a.occupation || a.display_name)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>

              <button
                onClick={() => refetchMessages()}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors text-muted-foreground"
                title="Actualiser les messages"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-2.5 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Chargement...
                  </span>
                </div>
              ) : !messages || messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-sm text-muted-foreground">Aucun message</p>
                </div>
              ) : (
                [...messages].reverse().map((msg) => {
                  const isSelf = msg.is_sender;
                  const attendee = msg.sender_id
                    ? attendeeMap.get(msg.sender_id)
                    : undefined;
                  // Fallback chain: message sender → matched attendee → other attendee in chat → "Inconnu"
                  const displayName =
                    msg.sender?.display_name ??
                    attendee?.display_name ??
                    (!isSelf ? otherAttendee?.display_name : undefined) ??
                    "Inconnu";
                  const avatar =
                    msg.sender?.profile_picture ??
                    attendee?.profile_picture ??
                    (!isSelf ? otherAttendee?.profile_picture : undefined);

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2.5",
                        isSelf ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      {/* Avatar */}
                      {!isSelf && (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                          {avatar ? (
                            <Image
                              src={avatar}
                              alt=""
                              width={32}
                              height={32}
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <User className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={cn(
                          "max-w-[80%] sm:max-w-[70%] rounded-lg px-2.5 py-1.5 sm:px-3.5 sm:py-2",
                          isSelf
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-surface text-foreground rounded-tl-sm",
                        )}
                      >
                        {!isSelf && (
                          <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
                            {displayName}
                          </p>
                        )}
                        <p className="text-[13px]  leading-relaxed whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                        <p
                          className={cn(
                            "text-[10px] mt-1",
                            isSelf
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground/60",
                          )}
                        >
                          {formatMessageTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="border-t border-border/40 px-2.5 sm:px-4 py-2 sm:py-3 shrink-0">
              <div className="flex items-end gap-1.5 sm:gap-2">
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ecrire un message..."
                  rows={1}
                  className="flex-1 resize-none bg-muted/50 border border-border/60 rounded-xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary min-h-[36px] sm:min-h-[40px] max-h-[100px] sm:max-h-[120px]"
                  style={{
                    height: "auto",
                    overflow: messageInput.includes("\n") ? "auto" : "hidden",
                  }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageInput.trim() || sendMessage.isPending}
                  loading={sendMessage.isPending}
                  size="sm"
                  className="rounded-xl h-9 w-9 sm:h-10 sm:w-10 p-0"
                  icon={<Send className="w-4 h-4" />}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                {selectedAccount ? (
                  (() => {
                    const Icon = getPlatformIcon(selectedAccount.type);
                    return (
                      <Icon
                        className={cn(
                          "w-7 h-7",
                          getPlatformColor(selectedAccount.type),
                          "opacity-40",
                        )}
                      />
                    );
                  })()
                ) : (
                  <Inbox className="w-7 h-7 text-muted-foreground/40" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Selectionne une conversation pour commencer
              </p>
              {selectedAccount && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {getPlatformLabel(selectedAccount.type)} —{" "}
                  {selectedAccount.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
