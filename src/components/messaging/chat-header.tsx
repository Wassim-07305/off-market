"use client";

import { getInitials, cn } from "@/lib/utils";
import { Hash, Lock, Search, Settings, X, Menu, Bookmark } from "lucide-react";
import type { ChannelWithMeta } from "@/types/messaging";

interface ChatHeaderProps {
  channel: ChannelWithMeta;
  onOpenMembers: () => void;
  onOpenMobileSidebar: () => void;
  showSearch: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResultCount?: number;
  isOnline?: (userId: string) => boolean;
  showBookmarks?: boolean;
  onToggleBookmarks?: () => void;
}

export function ChatHeader({
  channel,
  onOpenMembers,
  onOpenMobileSidebar,
  showSearch,
  onToggleSearch,
  searchQuery,
  onSearchChange,
  searchResultCount,
  isOnline,
  showBookmarks,
  onToggleBookmarks,
}: ChatHeaderProps) {
  const isDM = channel.type === "dm";
  const partner = channel.dmPartner;
  const ChannelIcon = channel.type === "private" ? Lock : Hash;
  const partnerOnline = partner ? (isOnline?.(partner.id) ?? false) : false;

  return (
    <div className="shrink-0 border-b border-[#AF0000]/[0.06] bg-white/80 backdrop-blur-sm">
      <div className="h-[60px] flex items-center justify-between px-5">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="sm:hidden w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
          >
            <Menu className="w-4 h-4" />
          </button>

          {isDM && partner ? (
            <>
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ring-2 transition-all duration-200",
                    partnerOnline ? "ring-emerald-400/60" : "ring-transparent",
                    !partner.avatar_url && "bg-[#AF0000]/10",
                  )}
                >
                  {partner.avatar_url ? (
                    <img
                      src={partner.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#AF0000]">
                      {getInitials(partner.full_name)}
                    </span>
                  )}
                </div>
                {partnerOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm shadow-emerald-500/30" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-foreground truncate tracking-tight">
                  {partner.full_name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {partnerOnline ? (
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      En ligne
                    </span>
                  ) : (
                    <span className="capitalize">{partner.role}</span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#AF0000]/10 to-[#DC2626]/10 flex items-center justify-center shrink-0">
                <ChannelIcon className="w-4 h-4 text-[#AF0000]/70" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-foreground truncate tracking-tight">
                  {channel.name}
                </h3>
                {channel.description && (
                  <p className="text-[11px] text-muted-foreground truncate">
                    {channel.description}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleSearch}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
              showSearch
                ? "text-[#AF0000] bg-[#AF0000]/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
            )}
          >
            <Search className="w-4 h-4" />
          </button>
          {onToggleBookmarks && (
            <button
              onClick={onToggleBookmarks}
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                showBookmarks
                  ? "text-[#AF0000] bg-[#AF0000]/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/80",
              )}
              title="Favoris"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onOpenMembers}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="px-5 py-2.5 border-t border-[#AF0000]/[0.06] flex items-center gap-2.5 bg-[#AF0000]/[0.02] animate-fade-in">
          <Search className="w-4 h-4 text-[#AF0000]/40 shrink-0" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher dans les messages..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
          />
          {searchQuery && searchResultCount !== undefined && (
            <span className="text-xs text-muted-foreground shrink-0 font-medium">
              {searchResultCount} resultat{searchResultCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => {
              onSearchChange("");
              onToggleSearch();
            }}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
