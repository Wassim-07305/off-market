"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { getInitials, cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/messaging-utils";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";
import {
  CornerUpLeft,
  Smile,
  Pencil,
  Trash2,
  Pin,
  MessageSquare,
  Bookmark,
  AlertTriangle,
} from "lucide-react";
import { AiResponseBadge } from "@/components/ai/ai-response-badge";
import type { EnrichedMessage } from "@/types/messaging";

interface MessageBubbleProps {
  message: EnrichedMessage;
  isFirstInGroup: boolean;
  isOwn: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: () => void;
  onEdit: (id: string, content: string) => void;
  onDelete: () => void;
  onPin: () => void;
  onOpenThread?: () => void;
  onBookmark?: (messageId: string) => void;
  isBookmarked?: boolean;
}

const QUICK_REACTIONS = [
  "\u{1F44D}",
  "\u{2764}\u{FE0F}",
  "\u{1F602}",
  "\u{1F389}",
  "\u{1F525}",
  "\u{2705}",
];

export function MessageBubble({
  message,
  isFirstInGroup,
  isOwn,
  currentUserId,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onOpenThread,
  onBookmark,
  isBookmarked,
}: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showQuickReact, setShowQuickReact] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const sender = message.sender;
  const isOptimistic = message.id.startsWith("optimistic-");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // System messages
  if (message.content_type === "system") {
    return (
      <div className="flex items-center justify-center py-1.5">
        <span className="text-xs text-muted-foreground italic">
          {sender?.full_name ?? "Systeme"} {message.content}
        </span>
      </div>
    );
  }

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setEditing(false);
  };

  const handleMouseEnter = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowActions(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setShowActions(false);
      setShowQuickReact(false);
    }, 120);
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3.5 px-2 -mx-2 rounded-xl transition-all duration-200",
        isFirstInGroup ? "pt-3" : "pt-0.5",
        showActions && "bg-muted/20",
        isOptimistic && "opacity-40",
        message.is_urgent &&
          "bg-red-50/80 dark:bg-red-950/20 border-l-[3px] border-l-red-500 pl-3.5",
        isOwn && !message.is_urgent && "flex-row-reverse",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar or spacer */}
      <div className="w-9 shrink-0">
        {isFirstInGroup && (
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center overflow-hidden shadow-sm",
              isOwn
                ? "bg-gradient-to-br from-[#AF0000]/15 to-[#DC2626]/15"
                : "bg-muted/80",
            )}
          >
            {sender?.avatar_url ? (
              <Image
                src={sender.avatar_url}
                alt=""
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <span
                className={cn(
                  "text-xs font-bold",
                  isOwn ? "text-[#AF0000]" : "text-muted-foreground",
                )}
              >
                {sender ? getInitials(sender.full_name) : "?"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isOwn && "flex flex-col items-end")}>
        {isFirstInGroup && (
          <div
            className={cn(
              "flex items-baseline gap-2 mb-1",
              isOwn && "flex-row-reverse",
            )}
          >
            <span
              className={cn(
                "text-[13px] font-bold tracking-tight",
                sender?.role === "admin" || sender?.role === "coach"
                  ? "text-[#AF0000]"
                  : "text-foreground",
              )}
            >
              {sender?.full_name ?? "Inconnu"}
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-medium">
              {formatMessageTime(message.created_at)}
            </span>
            {message.is_urgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-sm shadow-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-surface animate-pulse" />
                Urgent
              </span>
            )}
            {message.is_pinned && (
              <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
            )}
            {message.is_edited && (
              <span className="text-[10px] text-muted-foreground/50 italic">
                (modifie)
              </span>
            )}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to && message.reply_message && (
          <div className="flex items-center gap-2 mb-1.5 pl-3 border-l-[3px] border-[#AF0000]/30 rounded-r-lg bg-[#AF0000]/[0.03] py-1 pr-3">
            <span className="text-[11px] text-[#AF0000] font-semibold">
              {message.reply_message.sender?.full_name ?? "Inconnu"}
            </span>
            <span className="text-[11px] text-muted-foreground/70 truncate">
              {message.reply_message.content.slice(0, 80)}
            </span>
          </div>
        )}

        {/* Editing mode */}
        {editing ? (
          <div className="space-y-1.5 max-w-full">
            <textarea
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2.5 bg-surface border border-border/60 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/15 focus:border-[#AF0000]/20 resize-none transition-all duration-200"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSubmit();
                }
                if (e.key === "Escape") setEditing(false);
              }}
            />
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-muted-foreground/60">
                Echap pour annuler
              </span>
              <span className="text-muted-foreground/40">&middot;</span>
              <span className="text-muted-foreground/60">
                Entree pour sauvegarder
              </span>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "inline-block max-w-full",
              isOwn && !message.is_urgent
                ? "bg-gradient-to-br from-[#AF0000]/[0.06] to-[#DC2626]/[0.04] rounded-lg rounded-tr-sm px-3.5 py-2"
                : !message.is_urgent
                  ? "bg-surface rounded-lg rounded-tl-sm px-3.5 py-2"
                  : "",
            )}
          >
            <MessageContent message={message} />
          </div>
        )}

        {/* AI response label */}
        {message.is_ai_generated && <AiResponseBadge />}

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggle={(emoji) => onReact(message.id, emoji)}
          />
        )}

        {/* Thread indicator */}
        {message.reply_count > 0 && onOpenThread && (
          <button
            onClick={onOpenThread}
            className="flex items-center gap-1.5 mt-1.5 text-[#AF0000] text-xs font-medium hover:text-[#DC2626] transition-colors duration-200 group/thread"
          >
            <MessageSquare className="w-3 h-3" />
            <span className="group-hover/thread:underline">
              {message.reply_count} réponse
              {message.reply_count !== 1 ? "s" : ""}
            </span>
          </button>
        )}
      </div>

      {/* Actions toolbar — fade transition */}
      <div
        className={cn(
          "absolute -top-3.5 flex items-center bg-surface border border-border/40 rounded-xl shadow-lg shadow-black/[0.06] overflow-hidden z-10 transition-all duration-200",
          isOwn ? "left-2" : "right-2",
          showActions && !editing
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-1 pointer-events-none",
        )}
      >
        <button
          onClick={() => setShowQuickReact(!showQuickReact)}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          title="Reagir"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReply}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all duration-200"
          title="Repondre"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>
        {onOpenThread && (
          <button
            onClick={onOpenThread}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            title="Ouvrir le fil"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        )}
        {isOwn && (
          <button
            onClick={() => {
              setEditing(true);
              setEditContent(message.content);
            }}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-muted/60 transition-all duration-200"
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onPin}
          className={cn(
            "w-7 h-7 flex items-center justify-center transition-colors",
            message.is_pinned
              ? "text-amber-500 hover:bg-amber-50"
              : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/60",
          )}
          title={message.is_pinned ? "Desepingler" : "Epingler"}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
        {onBookmark && (
          <button
            onClick={() => onBookmark(message.id)}
            className={cn(
              "w-7 h-7 flex items-center justify-center transition-colors",
              isBookmarked
                ? "text-[#AF0000] hover:bg-[#AF0000]/5"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/60",
            )}
            title={isBookmarked ? "Retirer le signet" : "Ajouter un signet"}
          >
            <Bookmark
              className={cn("w-3.5 h-3.5", isBookmarked && "fill-primary")}
            />
          </button>
        )}
        {isOwn && (
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick reactions popup — scale transition */}
      <div
        className={cn(
          "absolute -top-11 flex items-center gap-0.5 bg-surface border border-border/30 rounded-2xl shadow-xl shadow-black/[0.08] p-1.5 z-20 transition-all duration-200 origin-bottom-right",
          isOwn ? "left-2" : "right-2",
          showQuickReact
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none",
        )}
      >
        {QUICK_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onReact(message.id, emoji);
              setShowQuickReact(false);
            }}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted/60 transition-all duration-150 hover:scale-125 active:scale-95 text-base"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
