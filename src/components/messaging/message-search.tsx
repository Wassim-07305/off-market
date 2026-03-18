"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { formatMessageTime } from "@/lib/messaging-utils";
import type { EnrichedMessage } from "@/types/messaging";

interface MessageSearchProps {
  messages: EnrichedMessage[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClose: () => void;
  onJumpToMessage: (messageId: string) => void;
}

export function MessageSearch({
  messages,
  searchQuery,
  onSearchChange,
  onClose,
  onJumpToMessage,
}: MessageSearchProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) => m.content_type === "text" && m.content.toLowerCase().includes(q),
    );
  }, [messages, searchQuery]);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (results.length === 0) return;
      const newIndex =
        direction === "next"
          ? (selectedIndex + 1) % results.length
          : (selectedIndex - 1 + results.length) % results.length;
      setSelectedIndex(newIndex);
      onJumpToMessage(results[newIndex].id);
    },
    [results, selectedIndex, onJumpToMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        handleNavigate("prev");
      } else {
        handleNavigate("next");
      }
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div className="border-b border-border/40 bg-surface">
      {/* Search input */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          autoFocus
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setSelectedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher dans les messages..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        {searchQuery && results.length > 0 && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-xs text-muted-foreground">
              {selectedIndex + 1}/{results.length}
            </span>
            <button
              onClick={() => handleNavigate("prev")}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Resultat precedent"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleNavigate("next")}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Resultat suivant"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {searchQuery && results.length === 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            Aucun resultat
          </span>
        )}
        <button
          onClick={onClose}
          className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Results dropdown */}
      {searchQuery && results.length > 0 && (
        <div className="max-h-64 overflow-y-auto border-t border-border/30">
          {results.slice(0, 20).map((msg, i) => (
            <button
              key={msg.id}
              onClick={() => {
                setSelectedIndex(i);
                onJumpToMessage(msg.id);
              }}
              className={cn(
                "w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition-colors",
                i === selectedIndex ? "bg-primary/5" : "hover:bg-muted/30",
              )}
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                {msg.sender?.avatar_url ? (
                  <Image
                    src={msg.sender.avatar_url}
                    alt=""
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-semibold text-primary">
                    {msg.sender ? getInitials(msg.sender.full_name) : "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    {msg.sender?.full_name ?? "Inconnu"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatMessageTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 line-clamp-2">
                  {highlightMatch(msg.content.slice(0, 200), searchQuery)}
                </p>
              </div>
            </button>
          ))}
          {results.length > 20 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              +{results.length - 20} autres resultats
            </p>
          )}
        </div>
      )}
    </div>
  );
}
