"use client";

import { useState } from "react";
import { useChannelMembers } from "@/hooks/use-channels";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
  UserPlus,
  Search,
  Loader2,
  Pin,
  Trash2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  onPin?: (channelId: string, pinned: boolean) => void;
  onDelete?: () => void;
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
  onPin,
  onDelete,
  userRole,
}: ChannelSettingsModalProps) {
  const { user } = useAuth();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: members, isLoading } = useChannelMembers(
    open ? channel.id : null,
  );
  const [tab, setTab] = useState<"info" | "members">("info");
  const [editName, setEditName] = useState(channel.name);
  const [editDescription, setEditDescription] = useState(
    channel.description ?? "",
  );
  const [editType, setEditType] = useState<"public" | "private">(
    channel.type === "private" ? "private" : "public",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [addingMember, setAddingMember] = useState<string | null>(null);

  // Sync state when channel changes
  const [prevChannelId, setPrevChannelId] = useState(channel.id);
  if (channel.id !== prevChannelId) {
    setPrevChannelId(channel.id);
    setEditName(channel.name);
    setEditDescription(channel.description ?? "");
    setEditType(channel.type === "private" ? "private" : "public");
  }

  const isStaffUser = userRole === "admin" || userRole === "coach";
  const isCreator = channel.created_by === user?.id;
  const canEdit = isStaffUser || isCreator;

  const handleSaveInfo = async () => {
    if (!editName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("channels")
        .update({
          name: editName.trim(),
          description: editDescription.trim() || null,
          type: editType,
        })
        .eq("id", channel.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Canal mis a jour");
    } catch {
      toast.error("Erreur lors de la mise a jour");
    } finally {
      setIsSaving(false);
    }
  };

  const isDM = channel.type === "dm";
  const ChannelIcon = channel.type === "private" ? Lock : Hash;

  // Profiles for adding members
  const memberIds = new Set(
    (members ?? [])
      .map((m) => {
        const p = m.profile as unknown as { id: string };
        return p?.id;
      })
      .filter(Boolean),
  );

  const { data: allProfiles } = useQuery({
    queryKey: ["all-profiles-channel-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .order("full_name");
      return (data ?? []) as Array<{
        id: string;
        full_name: string;
        avatar_url: string | null;
        role: string;
      }>;
    },
    enabled: !!open && canEdit && !isDM,
  });

  const availableProfiles = (allProfiles ?? []).filter(
    (p) =>
      !memberIds.has(p.id) &&
      p.full_name.toLowerCase().includes(memberSearch.toLowerCase()),
  );

  const handleRemoveMember = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from("channel_members")
        .delete()
        .eq("channel_id", channel.id)
        .eq("profile_id", profileId);
      if (error) throw error;
      queryClient.invalidateQueries({
        queryKey: ["channel-members", channel.id],
      });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Membre retire");
    } catch {
      toast.error("Erreur lors du retrait");
    }
  };

  const handleAddMember = async (profileId: string) => {
    setAddingMember(profileId);
    try {
      const { error } = await supabase
        .from("channel_members")
        .insert({ channel_id: channel.id, profile_id: profileId });
      if (error) throw error;
      queryClient.invalidateQueries({
        queryKey: ["channel-members", channel.id],
      });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      toast.success("Membre ajoute");
    } catch {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setAddingMember(null);
    }
  };

  if (!open) return null;

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
              {canEdit ? (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Nom du canal
                    </label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex h-9 w-full rounded-lg border border-transparent bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 focus:bg-surface hover:bg-muted/70 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      placeholder="Description du canal (optionnel)"
                      className="flex min-h-[60px] w-full rounded-lg border border-transparent bg-muted/50 px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 focus:bg-surface hover:bg-muted/70 transition-all resize-none"
                    />
                  </div>
                  {/* Type toggle */}
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditType("public")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border text-xs font-medium transition-all",
                          editType === "public"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-surface text-muted-foreground hover:bg-muted/50",
                        )}
                      >
                        <Hash className="w-3.5 h-3.5" />
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType("private")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border text-xs font-medium transition-all",
                          editType === "private"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-surface text-muted-foreground hover:bg-muted/50",
                        )}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Prive
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveInfo}
                    disabled={isSaving || !editName.trim()}
                    className="w-full h-9 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Nom du canal
                    </label>
                    <p className="mt-1 text-sm text-foreground">
                      {channel.name}
                    </p>
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
                </>
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

              {/* Supprimer le canal */}
              {canEdit && (
                <div className="pt-3 border-t border-border/40">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Supprimer le canal "${channel.name}" ? Cette action est irreversible.`,
                        )
                      ) {
                        onDelete?.();
                        onClose();
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer le canal
                  </button>
                </div>
              )}
            </div>
          )}

          {(tab === "members" || isDM) && (
            <div className="py-2">
              {/* Ajouter un membre — en haut */}
              {canEdit && !isDM && (
                <div className="px-4 pb-3 mb-2 border-b border-border/40">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserPlus className="w-3 h-3" />
                    Ajouter un membre
                  </label>
                  <div className="relative mb-2">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Rechercher..."
                      className="flex h-8 w-full rounded-lg border border-transparent bg-muted/50 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {availableProfiles.length > 0 ? (
                    <div className="max-h-32 overflow-y-auto space-y-0.5">
                      {availableProfiles.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleAddMember(p.id)}
                          disabled={addingMember === p.id}
                          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left hover:bg-muted/40 transition-colors disabled:opacity-50"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {p.avatar_url ? (
                              <img
                                src={p.avatar_url}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-[9px] font-semibold text-primary">
                                {getInitials(p.full_name)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-foreground truncate flex-1">
                            {p.full_name}
                          </span>
                          {addingMember === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                          ) : (
                            <UserPlus className="w-3 h-3 text-muted-foreground" />
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      {memberSearch
                        ? "Aucun resultat"
                        : "Tous les membres sont deja dans ce canal"}
                    </p>
                  )}
                </div>
              )}

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
                      className="group/member relative flex items-center gap-3 px-5 py-2 hover:bg-muted/30 transition-colors"
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
                      {canEdit && profile.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(profile.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover/member:opacity-100"
                          title="Retirer du canal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
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
