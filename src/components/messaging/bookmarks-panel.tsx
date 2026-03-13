"use client";

import { Bookmark, X, MessageSquare } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { formatMessageTime } from "@/lib/messaging-utils";
import type { EnrichedMessage } from "@/types/messaging";

interface BookmarksPanelProps {
  bookmarks: EnrichedMessage[];
  open: boolean;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
  onRemoveBookmark: (messageId: string) => void;
}

export function BookmarksPanel({
  bookmarks,
  open,
  onClose,
  onJumpToMessage,
  onRemoveBookmark,
}: BookmarksPanelProps) {
  if (!open) return null;

  return (
    <div className="w-80 border-l border-border flex flex-col bg-surface h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Favoris</h3>
          <span className="text-xs text-muted-foreground">
            {bookmarks.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bookmarks list */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
            <Bookmark className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground text-center">
              Aucun favori pour le moment
            </p>
            <p className="text-xs text-muted-foreground/70 text-center">
              Clique sur le signet d&apos;un message pour l&apos;ajouter ici
            </p>
          </div>
        ) : (
          bookmarks.map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2.5 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/20"
              onClick={() => onJumpToMessage(msg.id)}
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                {msg.sender?.avatar_url ? (
                  <img
                    src={msg.sender.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-primary">
                    {msg.sender ? getInitials(msg.sender.full_name) : "?"}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {msg.sender?.full_name ?? "Inconnu"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatMessageTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 line-clamp-2">
                  {msg.content_type === "image"
                    ? "Image"
                    : msg.content_type === "audio"
                      ? "Message vocal"
                      : msg.content_type === "file"
                        ? "Fichier"
                        : msg.content.slice(0, 150)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(msg.id);
                }}
                className="w-5 h-5 rounded flex items-center justify-center text-primary/60 hover:text-destructive transition-colors shrink-0 mt-0.5"
                title="Retirer des favoris"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
