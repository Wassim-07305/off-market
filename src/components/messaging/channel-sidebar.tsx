"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useQuery } from "@tanstack/react-query";
import { getInitials, cn } from "@/lib/utils";
import {
  Hash,
  Lock,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  BellOff,
  Archive,
  LayoutGrid,
  List,
} from "lucide-react";
import type { ChannelWithMeta } from "@/types/messaging";
import { CreateChannelModal } from "./create-channel-modal";

interface ChannelSidebarProps {
  publicChannels: ChannelWithMeta[];
  archivedChannels: ChannelWithMeta[];
  dmChannels: ChannelWithMeta[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (data: {
    name: string;
    description?: string;
    type: "public" | "private";
    memberIds: string[];
  }) => Promise<unknown>;
  onCreateDM: (userId: string) => Promise<unknown>;
  isLoading: boolean;
  isOnline?: (userId: string) => boolean;
  showArchived: boolean;
  onToggleShowArchived: () => void;
}

export function ChannelSidebar({
  publicChannels,
  archivedChannels,
  dmChannels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onCreateDM,
  isLoading,
  isOnline,
  showArchived,
  onToggleShowArchived,
}: ChannelSidebarProps) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dmSearch, setDmSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "mosaic">("list");
  const { user } = useAuth();
  const supabase = useSupabase();

  // Toujours charger tous les profils pour les afficher directement
  const { data: allProfiles } = useQuery({
    queryKey: ["all-profiles-dm"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .neq("id", user?.id ?? "")
        .order("full_name");
      return (data ?? []) as Array<{
        id: string;
        full_name: string;
        avatar_url: string | null;
        role: string;
      }>;
    },
    enabled: !!user,
  });

  // IDs des users qui ont deja un DM
  const dmPartnerIds = useMemo(() => {
    return new Set(dmChannels.map((ch) => ch.dmPartner?.id).filter(Boolean));
  }, [dmChannels]);

  // Users sans conversation DM existante
  const usersWithoutDM = useMemo(() => {
    return (allProfiles ?? []).filter((p) => !dmPartnerIds.has(p.id));
  }, [allProfiles, dmPartnerIds]);

  // Filtre de recherche pour les DMs
  const filteredDmChannels = useMemo(() => {
    if (!dmSearch.trim()) return dmChannels;
    const q = dmSearch.toLowerCase();
    return dmChannels.filter((ch) =>
      ch.dmPartner?.full_name?.toLowerCase().includes(q),
    );
  }, [dmChannels, dmSearch]);

  const filteredUsersWithoutDM = useMemo(() => {
    if (!dmSearch.trim()) return usersWithoutDM;
    const q = dmSearch.toLowerCase();
    return usersWithoutDM.filter((p) => p.full_name.toLowerCase().includes(q));
  }, [usersWithoutDM, dmSearch]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-border/30 flex items-center px-4 bg-white/60 backdrop-blur-sm">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center mr-3 shadow-sm shadow-[#AF0000]/20">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-bold text-foreground tracking-tight">Messagerie</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {isLoading ? (
          <div className="space-y-1 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-9 bg-muted/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Channels section */}
            <div className="mb-1">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setChannelsOpen(!channelsOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setChannelsOpen(!channelsOpen);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-[#AF0000]/70 uppercase tracking-[0.12em] hover:text-[#AF0000] transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  {channelsOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  Canaux
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCreateModal(true);
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-[#AF0000]/10 text-[#AF0000]/50 hover:text-[#AF0000] transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <CreateChannelModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreateChannel={onCreateChannel}
              />

              {channelsOpen && (
                <div className="px-2 space-y-0.5">
                  {publicChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    const Icon = ch.type === "private" ? Lock : Hash;
                    const hasUrgent = ch.urgentUnreadCount > 0;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => onSelectChannel(ch.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 h-9 rounded-xl text-[13px] transition-all duration-200",
                          isActive
                            ? "bg-[#AF0000]/[0.08] text-[#AF0000] font-semibold shadow-sm shadow-[#AF0000]/5 ring-1 ring-[#AF0000]/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] active:scale-[0.98]",
                          ch.isMuted && !isActive && "opacity-40",
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                          isActive
                            ? "bg-[#AF0000]/15"
                            : "bg-muted/60",
                        )}>
                          <Icon
                            className={cn(
                              "w-3.5 h-3.5 shrink-0 transition-colors duration-200",
                              isActive ? "text-[#AF0000]" : "text-muted-foreground/70",
                            )}
                          />
                        </div>
                        <span className="truncate flex-1 text-left">
                          {ch.name}
                        </span>
                        {ch.isMuted && (
                          <BellOff className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                        )}
                        {ch.unreadCount > 0 && !ch.isMuted && (
                          <span
                            className={cn(
                              "min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-sm",
                              hasUrgent
                                ? "bg-red-500 shadow-red-500/25 animate-pulse"
                                : "bg-[#AF0000] shadow-[#AF0000]/20",
                            )}
                          >
                            {ch.unreadCount > 99 ? "99+" : ch.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Archived channels section */}
            {archivedChannels.length > 0 && (
              <div className="mt-2 mb-1">
                <button
                  onClick={onToggleShowArchived}
                  className="w-full flex items-center gap-1.5 px-4 py-2 text-[10px] text-muted-foreground/70 hover:text-foreground transition-all duration-200"
                >
                  <Archive className="w-3 h-3" />
                  <span className="font-medium">
                    {showArchived
                      ? "Masquer les archives"
                      : "Voir les archives"}
                  </span>
                  <span className="text-[10px] opacity-60">
                    ({archivedChannels.length})
                  </span>
                </button>

                {showArchived && (
                  <div className="px-2 space-y-0.5 mt-0.5">
                    {archivedChannels.map((ch) => {
                      const isActive = ch.id === activeChannelId;
                      const Icon =
                        ch.type === "private"
                          ? Lock
                          : ch.type === "dm"
                            ? MessageSquare
                            : Hash;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => onSelectChannel(ch.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] transition-all duration-150 opacity-50",
                            isActive
                              ? "bg-primary/10 text-primary font-medium shadow-sm opacity-100"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:opacity-75 active:scale-[0.98]",
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0 opacity-50" />
                          <span className="truncate flex-1 text-left">
                            {ch.name}
                          </span>
                          <Archive className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Direct Messages section */}
            <div className="mt-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setDmsOpen(!dmsOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setDmsOpen(!dmsOpen);
                }}
                className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-[#AF0000]/70 uppercase tracking-[0.12em] hover:text-[#AF0000] transition-colors duration-200 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  {dmsOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  Messages directs
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode(viewMode === "list" ? "mosaic" : "list");
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-[#AF0000]/10 text-[#AF0000]/50 hover:text-[#AF0000] transition-all duration-200"
                  title={viewMode === "list" ? "Vue mosaïque" : "Vue liste"}
                >
                  {viewMode === "list" ? (
                    <LayoutGrid className="w-3.5 h-3.5" />
                  ) : (
                    <List className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {dmsOpen && (
                <>
                  {/* Barre de recherche DM */}
                  <div className="px-3 mb-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                      <input
                        value={dmSearch}
                        onChange={(e) => setDmSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full h-8 pl-8 pr-3 bg-white border border-border/40 rounded-xl text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#AF0000]/15 focus:border-[#AF0000]/20 transition-all duration-200 shadow-sm shadow-black/[0.02]"
                      />
                    </div>
                  </div>

                  {viewMode === "mosaic" ? (
                    /* ── Mosaic view ── */
                    <div className="px-2 grid grid-cols-3 gap-2">
                      {filteredDmChannels.map((ch) => {
                        const isActive = ch.id === activeChannelId;
                        const partner = ch.dmPartner;
                        const online = partner
                          ? (isOnline?.(partner.id) ?? false)
                          : false;
                        const hasUrgent = ch.urgentUnreadCount > 0;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => onSelectChannel(ch.id)}
                            className={cn(
                              "flex flex-col items-center gap-1.5 p-2.5 rounded-2xl text-[11px] transition-all duration-200",
                              isActive
                                ? "bg-[#AF0000]/[0.08] text-[#AF0000] font-semibold ring-1 ring-[#AF0000]/15 shadow-sm shadow-[#AF0000]/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] active:scale-[0.96]",
                              ch.isMuted && !isActive && "opacity-40",
                            )}
                          >
                            <div className="relative">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ring-2 transition-all duration-200",
                                online
                                  ? "ring-emerald-400/60"
                                  : isActive ? "ring-[#AF0000]/20" : "ring-transparent",
                                !partner?.avatar_url && (isActive ? "bg-[#AF0000]/10" : "bg-muted/80"),
                              )}>
                                {partner?.avatar_url ? (
                                  <img
                                    src={partner.avatar_url}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className={cn(
                                    "text-xs font-semibold",
                                    isActive ? "text-[#AF0000]" : "text-muted-foreground",
                                  )}>
                                    {partner
                                      ? getInitials(partner.full_name)
                                      : "?"}
                                  </span>
                                )}
                              </div>
                              {online && (
                                <div className="absolute -bottom-px -right-px w-3 h-3 bg-emerald-500 border-2 border-[#F5F5F5] rounded-full shadow-sm shadow-emerald-500/30" />
                              )}
                              {ch.unreadCount > 0 && !ch.isMuted && (
                                <span
                                  className={cn(
                                    "absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-sm",
                                    hasUrgent
                                      ? "bg-red-500 shadow-red-500/25 animate-pulse"
                                      : "bg-[#AF0000] shadow-[#AF0000]/20",
                                  )}
                                >
                                  {ch.unreadCount > 99 ? "99+" : ch.unreadCount}
                                </span>
                              )}
                            </div>
                            <span className="truncate w-full text-center leading-tight font-medium">
                              {partner?.full_name?.split(" ")[0] ?? ch.name}
                            </span>
                          </button>
                        );
                      })}

                      {filteredUsersWithoutDM.map((p) => (
                        <button
                          key={`new-dm-${p.id}`}
                          onClick={async () => {
                            await onCreateDM(p.id);
                          }}
                          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.96] transition-all duration-150"
                        >
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {p.avatar_url ? (
                                <img
                                  src={p.avatar_url}
                                  alt=""
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-medium text-muted-foreground">
                                  {getInitials(p.full_name)}
                                </span>
                              )}
                            </div>
                            {isOnline?.(p.id) && (
                              <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-emerald-500 border-[1.5px] border-surface rounded-full" />
                            )}
                          </div>
                          <span className="truncate w-full text-center leading-tight">
                            {p.full_name.split(" ")[0]}
                          </span>
                        </button>
                      ))}

                      {filteredDmChannels.length === 0 &&
                        filteredUsersWithoutDM.length === 0 && (
                          <p className="text-xs text-muted-foreground col-span-3 px-2.5 py-2 text-center">
                            Aucun resultat
                          </p>
                        )}
                    </div>
                  ) : (
                    /* ── List view (default) ── */
                    <div className="px-2 space-y-0.5">
                      {/* Conversations DM existantes */}
                      {filteredDmChannels.map((ch) => {
                        const isActive = ch.id === activeChannelId;
                        const partner = ch.dmPartner;
                        const online = partner
                          ? (isOnline?.(partner.id) ?? false)
                          : false;
                        const hasUrgent = ch.urgentUnreadCount > 0;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => onSelectChannel(ch.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-2.5 h-10 rounded-xl text-[13px] transition-all duration-200",
                              isActive
                                ? "bg-[#AF0000]/[0.08] text-[#AF0000] font-semibold shadow-sm shadow-[#AF0000]/5 ring-1 ring-[#AF0000]/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-black/[0.04] active:scale-[0.98]",
                              ch.isMuted && !isActive && "opacity-40",
                            )}
                          >
                            <div className="relative shrink-0">
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center overflow-hidden ring-2 transition-all duration-200",
                                online
                                  ? "ring-emerald-400/60"
                                  : isActive ? "ring-[#AF0000]/20" : "ring-transparent",
                                !partner?.avatar_url && (isActive ? "bg-[#AF0000]/10" : "bg-muted/80"),
                              )}>
                                {partner?.avatar_url ? (
                                  <img
                                    src={partner.avatar_url}
                                    alt=""
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className={cn(
                                    "text-[10px] font-semibold",
                                    isActive ? "text-[#AF0000]" : "text-muted-foreground",
                                  )}>
                                    {partner
                                      ? getInitials(partner.full_name)
                                      : "?"}
                                  </span>
                                )}
                              </div>
                              {online && (
                                <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-emerald-500 border-2 border-[#F5F5F5] rounded-full shadow-sm shadow-emerald-500/30" />
                              )}
                            </div>
                            <span className="truncate flex-1 text-left">
                              {partner?.full_name ?? ch.name}
                            </span>
                            {ch.isMuted && (
                              <BellOff className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                            )}
                            {ch.unreadCount > 0 && !ch.isMuted && (
                              <span
                                className={cn(
                                  "min-w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1.5 shadow-sm",
                                  hasUrgent
                                    ? "bg-red-500 shadow-red-500/25 animate-pulse"
                                    : "bg-[#AF0000] shadow-[#AF0000]/20",
                                )}
                              >
                                {ch.unreadCount > 99 ? "99+" : ch.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {/* Users sans conversation — affichés directement */}
                      {filteredUsersWithoutDM.map((p) => (
                        <button
                          key={`new-dm-${p.id}`}
                          onClick={async () => {
                            await onCreateDM(p.id);
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.98] transition-all duration-150"
                        >
                          <div className="relative shrink-0">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                              {p.avatar_url ? (
                                <img
                                  src={p.avatar_url}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-medium text-muted-foreground">
                                  {getInitials(p.full_name)}
                                </span>
                              )}
                            </div>
                            {isOnline?.(p.id) && (
                              <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-emerald-500 border-[1.5px] border-surface rounded-full" />
                            )}
                          </div>
                          <span className="truncate flex-1 text-left">
                            {p.full_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 capitalize">
                            {p.role}
                          </span>
                        </button>
                      ))}

                      {filteredDmChannels.length === 0 &&
                        filteredUsersWithoutDM.length === 0 && (
                          <p className="text-xs text-muted-foreground px-2.5 py-2">
                            Aucun resultat
                          </p>
                        )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
