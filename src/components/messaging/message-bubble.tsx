"use client";

import { useState, useRef } from "react";
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
        "group relative flex gap-3 px-1.5 -mx-1.5 rounded-lg transition-colors duration-150",
        isFirstInGroup ? "pt-2" : "pt-0.5",
        showActions && "bg-muted/30",
        isOptimistic && "opacity-50",
        message.is_urgent && "bg-red-50 dark:bg-red-950/20 border-l-3 border-l-red-500 pl-3",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar or spacer */}
      <div className="w-9 shrink-0">
        {isFirstInGroup && (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {sender?.avatar_url ? (
              <img
                src={sender.avatar_url}
                alt=""
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {sender ? getInitials(sender.full_name) : "?"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isFirstInGroup && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span
              className={cn(
                "text-[13px] font-semibold",
                sender?.role === "admin" || sender?.role === "coach"
                  ? "text-primary"
                  : "text-foreground",
              )}
            >
              {sender?.full_name ?? "Inconnu"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {formatMessageTime(message.created_at)}
            </span>
            {message.is_urgent && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider">
                <AlertTriangle className="w-2.5 h-2.5" />
                Urgent
              </span>
            )}
            {message.is_pinned && (
              <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
            )}
            {message.is_edited && (
              <span className="text-[10px] text-muted-foreground italic">
                (modifie)
              </span>
            )}
          </div>
        )}

        {/* Reply preview */}
        {message.reply_to && message.reply_message && (
          <div className="flex items-center gap-2 mb-1 pl-3 border-l-2 border-primary/30 rounded-r">
            <span className="text-[11px] text-primary font-medium">
              {message.reply_message.sender?.full_name ?? "Inconnu"}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {message.reply_message.content.slice(0, 80)}
            </span>
          </div>
        )}

        {/* Editing mode */}
        {editing ? (
          <div className="space-y-1.5">
            <textarea
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-shadow"
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
              <span className="text-muted-foreground">Echap pour annuler</span>
              <span className="text-muted-foreground">&middot;</span>
              <span className="text-muted-foreground">
                Entree pour sauvegarder
              </span>
            </div>
          </div>
        ) : (
          <MessageContent message={message} />
        )}

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
            className="flex items-center gap-1.5 mt-1 text-primary text-xs hover:underline"
          >
            <MessageSquare className="w-3 h-3" />
            {message.reply_count} reponse{message.reply_count !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Actions toolbar — fade transition */}
      <div
        className={cn(
          "absolute -top-3 right-2 flex items-center bg-surface border border-border/60 rounded-lg shadow-sm overflow-hidden z-10 transition-all duration-150",
          showActions && !editing
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-1 pointer-events-none",
        )}
      >
        <button
          onClick={() => setShowQuickReact(!showQuickReact)}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Reagir"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onReply}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Repondre"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>
        {onOpenThread && (
          <button
            onClick={onOpenThread}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
              ? "text-amber-500 hover:bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
                ? "text-primary hover:bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
            title={isBookmarked ? "Retirer le signet" : "Ajouter un signet"}
          >
            <Bookmark className={cn("w-3.5 h-3.5", isBookmarked && "fill-primary")} />
          </button>
        )}
        {isOwn && (
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick reactions popup — scale transition */}
      <div
        className={cn(
          "absolute -top-10 right-2 flex items-center gap-0.5 bg-surface border border-border/60 rounded-lg shadow-md p-1 z-20 transition-all duration-150 origin-bottom-right",
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
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-muted transition-all duration-100 hover:scale-110 active:scale-95 text-sm"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
