"use client";

import { getInitials, cn } from "@/lib/utils";
import { Hash, Lock, Search, Settings, X, Menu } from "lucide-react";
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
}: ChatHeaderProps) {
  const isDM = channel.type === "dm";
  const partner = channel.dmPartner;
  const ChannelIcon = channel.type === "private" ? Lock : Hash;
  const partnerOnline = partner ? isOnline?.(partner.id) ?? false : false;

  return (
    <div className="shrink-0 border-b border-border/40">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          {isDM && partner ? (
            <>
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {partner.avatar_url ? (
                    <img src={partner.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-primary">{getInitials(partner.full_name)}</span>
                  )}
                </div>
                {partnerOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{partner.full_name}</h3>
                <p className="text-[10px] text-muted-foreground">
                  {partnerOnline ? (
                    <span className="text-emerald-500 font-medium">En ligne</span>
                  ) : (
                    <span className="capitalize">{partner.role}</span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <ChannelIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{channel.name}</h3>
                {channel.description && (
                  <p className="text-[10px] text-muted-foreground truncate">{channel.description}</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleSearch}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
              showSearch ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenMembers}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="px-4 py-2 border-t border-border/30 flex items-center gap-2 bg-muted/20">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher dans les messages..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && searchResultCount !== undefined && (
            <span className="text-xs text-muted-foreground shrink-0">
              {searchResultCount} resultat{searchResultCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => { onSearchChange(""); onToggleSearch(); }}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
