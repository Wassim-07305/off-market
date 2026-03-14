"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { getInitials, cn } from "@/lib/utils";
import { X, Search, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AddMembersModalProps {
  open: boolean;
  onClose: () => void;
  channelId: string;
  existingMemberIds: string[];
}

interface ProfileItem {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
}

export function AddMembersModal({
  open,
  onClose,
  channelId,
  existingMemberIds,
}: AddMembersModalProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .order("full_name")
      .then(({ data }) => {
        setProfiles((data as ProfileItem[] | null) ?? []);
        setLoading(false);
      });
  }, [open, supabase]);

  if (!open) return null;

  const filtered = profiles.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = async (profileId: string) => {
    const isMember = existingMemberIds.includes(profileId);
    setAdding(profileId);

    try {
      if (isMember) {
        await supabase
          .from("channel_members")
          .delete()
          .eq("channel_id", channelId)
          .eq("profile_id", profileId);
        toast.success("Membre retire");
      } else {
        await (supabase.from("channel_members") as any).insert({
          channel_id: channelId,
          profile_id: profileId,
          role: "member",
        });
        toast.success("Membre ajoute");
      }
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({
        queryKey: ["channel-members", channelId],
      });
    } catch {
      toast.error("Erreur");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full mx-4 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Gerer les membres
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full h-9 pl-9 pr-4 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun resultat
            </p>
          ) : (
            filtered.map((profile) => {
              const isMember = existingMemberIds.includes(profile.id);
              return (
                <button
                  key={profile.id}
                  onClick={() => handleToggle(profile.id)}
                  disabled={adding === profile.id}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                    isMember ? "bg-primary/5" : "hover:bg-muted",
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                    {getInitials(profile.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {profile.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {profile.email}
                    </p>
                  </div>
                  {adding === profile.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : isMember ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-border" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
