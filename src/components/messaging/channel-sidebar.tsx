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
} from "lucide-react";
import type { ChannelWithMeta } from "@/types/messaging";

interface ChannelSidebarProps {
  publicChannels: ChannelWithMeta[];
  dmChannels: ChannelWithMeta[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onCreateChannel: (name: string) => Promise<unknown>;
  onCreateDM: (userId: string) => Promise<unknown>;
  isLoading: boolean;
  isOnline?: (userId: string) => boolean;
}

export function ChannelSidebar({
  publicChannels,
  dmChannels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onCreateDM,
  isLoading,
  isOnline,
}: ChannelSidebarProps) {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [dmSearch, setDmSearch] = useState("");
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
      return data ?? [];
    },
    enabled: !!user,
  });

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    await onCreateChannel(newChannelName.trim());
    setNewChannelName("");
    setShowNewChannel(false);
  };

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
      <div className="h-14 border-b border-border/40 flex items-center px-4">
        <MessageSquare className="w-5 h-5 text-primary mr-2.5" />
        <h2 className="text-sm font-semibold text-foreground">Messagerie</h2>
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
                className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1">
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
                    setShowNewChannel(!showNewChannel);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {showNewChannel && (
                <div className="px-3 mb-2">
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="Nom du canal"
                      className="flex-1 h-8 px-2.5 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateChannel();
                        if (e.key === "Escape") setShowNewChannel(false);
                      }}
                    />
                    <button
                      onClick={handleCreateChannel}
                      className="h-8 px-2.5 bg-primary text-white rounded-lg text-xs font-medium"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}

              {channelsOpen && (
                <div className="px-2 space-y-0.5">
                  {publicChannels.map((ch) => {
                    const isActive = ch.id === activeChannelId;
                    const Icon = ch.type === "private" ? Lock : Hash;
                    return (
                      <button
                        key={ch.id}
                        onClick={() => onSelectChannel(ch.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] transition-all duration-150",
                          isActive
                            ? "bg-primary/10 text-primary font-medium shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.98]",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-opacity",
                            isActive ? "opacity-100" : "opacity-50",
                          )}
                        />
                        <span className="truncate flex-1 text-left">
                          {ch.name}
                        </span>
                        {ch.unreadCount > 0 && (
                          <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                            {ch.unreadCount > 99 ? "99+" : ch.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Messages section */}
            <div className="mt-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setDmsOpen(!dmsOpen)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setDmsOpen(!dmsOpen);
                }}
                className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  {dmsOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  Messages directs
                </div>
              </div>

              {dmsOpen && (
                <>
                  {/* Barre de recherche DM */}
                  <div className="px-3 mb-1.5">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        value={dmSearch}
                        onChange={(e) => setDmSearch(e.target.value)}
                        placeholder="Rechercher..."
                        className="w-full h-7 pl-7 pr-2.5 bg-surface border border-border/60 rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="px-2 space-y-0.5">
                    {/* Conversations DM existantes */}
                    {filteredDmChannels.map((ch) => {
                      const isActive = ch.id === activeChannelId;
                      const partner = ch.dmPartner;
                      const online = partner
                        ? (isOnline?.(partner.id) ?? false)
                        : false;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => onSelectChannel(ch.id)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-[13px] transition-all duration-150",
                            isActive
                              ? "bg-primary/10 text-primary font-medium shadow-sm"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.98]",
                          )}
                        >
                          <div className="relative shrink-0">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {partner?.avatar_url ? (
                                <img
                                  src={partner.avatar_url}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-medium text-primary">
                                  {partner
                                    ? getInitials(partner.full_name)
                                    : "?"}
                                </span>
                              )}
                            </div>
                            {online && (
                              <div className="absolute -bottom-px -right-px w-2.5 h-2.5 bg-emerald-500 border-[1.5px] border-surface rounded-full" />
                            )}
                          </div>
                          <span className="truncate flex-1 text-left">
                            {partner?.full_name ?? ch.name}
                          </span>
                          {ch.unreadCount > 0 && (
                            <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
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
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
