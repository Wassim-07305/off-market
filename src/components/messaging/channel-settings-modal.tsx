"use client";

import { useState } from "react";
import { useChannelMembers } from "@/hooks/use-channels";
import { useAuth } from "@/hooks/use-auth";
import { getInitials, cn } from "@/lib/utils";
import {
  X,
  Hash,
  Lock,
  Settings,
  Users,
  Crown,
  Shield,
  UserCircle,
  BellOff,
  Bell,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import type { ChannelWithMeta } from "@/types/messaging";

interface ChannelSettingsModalProps {
  channel: ChannelWithMeta;
  open: boolean;
  onClose: () => void;
  isOnline?: (userId: string) => boolean;
  onMute?: () => void;
  onUnmute?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  userRole?: string;
}

const ROLE_ICONS: Record<string, typeof Crown> = {
  admin: Crown,
  coach: Shield,
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  coach: "Coach",
  sales: "Commercial",
  setter: "Setter",
  closer: "Closer",
  client: "Client",
};

export function ChannelSettingsModal({
  channel,
  open,
  onClose,
  isOnline,
  onMute,
  onUnmute,
  onArchive,
  onUnarchive,
  userRole,
}: ChannelSettingsModalProps) {
  const { user } = useAuth();
  const { data: members, isLoading } = useChannelMembers(
    open ? channel.id : null,
  );
  const [tab, setTab] = useState<"info" | "members">("info");

  if (!open) return null;

  const isDM = channel.type === "dm";
  const ChannelIcon = channel.type === "private" ? Lock : Hash;
  const isStaff = userRole === "admin" || userRole === "coach";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative bg-surface border border-border/60 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-3 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            {isDM ? (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {channel.dmPartner?.avatar_url ? (
                  <img
                    src={channel.dmPartner.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-primary">
                    {channel.dmPartner
                      ? getInitials(channel.dmPartner.full_name)
                      : "?"}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <ChannelIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {isDM
                  ? (channel.dmPartner?.full_name ?? channel.name)
                  : channel.name}
              </h3>
              {channel.description && (
                <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                  {channel.description}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        {!isDM && (
          <div className="flex border-b border-border/40">
            <button
              onClick={() => setTab("info")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors",
                tab === "info"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Settings className="w-3.5 h-3.5" />
              Infos
            </button>
            <button
              onClick={() => setTab("members")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors",
                tab === "members"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Membres {members ? `(${members.length})` : ""}
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {tab === "info" && !isDM && (
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Nom du canal
                </label>
                <p className="mt-1 text-sm text-foreground">{channel.name}</p>
              </div>
              {channel.description && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Description
                  </label>
                  <p className="mt-1 text-sm text-foreground">
                    {channel.description}
                  </p>
                </div>
              )}
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <ChannelIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground capitalize">
                    {channel.type}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Cree le
                </label>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(channel.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border/40 space-y-2">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </label>

                {/* Mute toggle */}
                {channel.isMuted ? (
                  <button
                    onClick={() => {
                      onUnmute?.();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    Reactiver les notifications
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onMute?.();
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                    Mettre en sourdine
                  </button>
                )}

                {/* Archive toggle — staff only */}
                {isStaff && (
                  <>
                    {channel.is_archived ? (
                      <button
                        onClick={() => {
                          onUnarchive?.();
                          onClose();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <ArchiveRestore className="w-4 h-4 text-muted-foreground" />
                        Desarchiver le canal
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onArchive?.();
                          onClose();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        Archiver le canal
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* DM-specific actions (mute) */}
          {isDM && (
            <div className="px-5 py-3 border-b border-border/40">
              {channel.isMuted ? (
                <button
                  onClick={() => {
                    onUnmute?.();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  Reactiver les notifications
                </button>
              ) : (
                <button
                  onClick={() => {
                    onMute?.();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                  Mettre en sourdine
                </button>
              )}
            </div>
          )}

          {(tab === "members" || isDM) && (
            <div className="py-2">
              {isLoading ? (
                <div className="space-y-2 px-4 py-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-2.5 w-16 bg-muted/60 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                (members ?? []).map((m) => {
                  const profile = m.profile as unknown as {
                    id: string;
                    full_name: string;
                    avatar_url: string | null;
                    role: string;
                    email: string;
                  };
                  if (!profile) return null;
                  const RoleIcon = ROLE_ICONS[profile.role] ?? UserCircle;
                  const online = isOnline?.(profile.id) ?? false;

                  return (
                    <div
                      key={m.id ?? profile.id}
                      className="flex items-center gap-3 px-5 py-2 hover:bg-muted/30 transition-colors"
                    >
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-semibold text-primary">
                              {getInitials(profile.full_name)}
                            </span>
                          )}
                        </div>
                        {online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-foreground truncate">
                            {profile.full_name}
                          </span>
                          {profile.id === user?.id && (
                            <span className="text-[10px] text-muted-foreground">
                              (toi)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RoleIcon className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">
                            {ROLE_LABELS[profile.role] ?? profile.role}
                          </span>
                        </div>
                      </div>
                      {online ? (
                        <span className="text-[10px] text-emerald-500 font-medium">
                          En ligne
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          Hors ligne
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
