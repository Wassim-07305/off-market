"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";
import { Search, Hash, Lock, Check } from "lucide-react";

interface ProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

interface CreateChannelModalProps {
  open: boolean;
  onClose: () => void;
  onCreateChannel: (data: {
    name: string;
    description?: string;
    type: "public" | "private";
    memberIds: string[];
  }) => Promise<unknown>;
}

export function CreateChannelModal({
  open,
  onClose,
  onCreateChannel,
}: CreateChannelModalProps) {
  const { user } = useAuth();
  const supabase = useSupabase();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"public" | "private">("public");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(),
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: allProfiles } = useQuery({
    queryKey: ["all-profiles-create-channel"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role")
        .neq("id", user?.id ?? "")
        .order("full_name");
      return (data ?? []) as ProfileRow[];
    },
    enabled: !!user && open,
  });

  // Pré-sélectionner tout le monde quand les profils chargent en mode public
  useEffect(() => {
    if (
      type === "public" &&
      allProfiles?.length &&
      selectedMembers.size === 0
    ) {
      setSelectedMembers(new Set(allProfiles.map((p) => p.id)));
    }
  }, [allProfiles, type, selectedMembers.size]);

  const filteredProfiles = useMemo(() => {
    if (!memberSearch.trim()) return allProfiles ?? [];
    const q = memberSearch.toLowerCase();
    return (allProfiles ?? []).filter((p) =>
      p.full_name.toLowerCase().includes(q),
    );
  }, [allProfiles, memberSearch]);

  const toggleMember = (profileId: string) => {
    setSelectedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(profileId)) {
        next.delete(profileId);
      } else {
        next.add(profileId);
      }
      return next;
    });
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setType("public");
    setSelectedMembers(new Set());
    setMemberSearch("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateChannel({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        memberIds: Array.from(selectedMembers),
      });
      handleClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    coach: "Coach",
    prospect: "Prospect",
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Creer un canal"
      description="Creez un canal pour discuter avec votre équipe"
      size="lg"
    >
      <div className="space-y-5">
        {/* Nom du canal */}
        <Input
          label="Nom du canal"
          placeholder="ex: general, projet-alpha..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
        />

        {/* Description */}
        <Textarea
          label="Description"
          placeholder="De quoi parle ce canal ? (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[60px]"
          rows={2}
        />

        {/* Type toggle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("public");
                // Sélectionner tout le monde automatiquement
                setSelectedMembers(
                  new Set((allProfiles ?? []).map((p) => p.id)),
                );
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer",
                type === "public"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-surface text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Hash className="w-4 h-4" />
              Public
            </button>
            <button
              type="button"
              onClick={() => {
                setType("private");
                // Vider la sélection pour choisir manuellement
                setSelectedMembers(new Set());
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer",
                type === "private"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border bg-surface text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Lock className="w-4 h-4" />
              Prive
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {type === "public"
              ? "Tout le monde peut voir et rejoindre ce canal."
              : "Seuls les membres invites peuvent voir ce canal."}
          </p>
        </div>

        {/* Membres */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Membres{" "}
            {selectedMembers.size > 0 && (
              <span className="text-muted-foreground font-normal">
                ({selectedMembers.size} selectionne
                {selectedMembers.size > 1 ? "s" : ""})
              </span>
            )}
          </label>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Rechercher un membre..."
              className={cn(
                "flex h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-3.5 py-2 text-sm text-foreground",
                "shadow-sm transition-all duration-200",
                "placeholder:text-muted-foreground/60",
                "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
              )}
            />
          </div>

          {/* Creator info */}
          <p className="text-xs text-muted-foreground">
            Vous serez automatiquement ajoute en tant qu&apos;administrateur.
          </p>

          {/* Profile list */}
          <div className="max-h-[200px] overflow-y-auto rounded-lg border border-border/60 divide-y divide-border/40">
            {filteredProfiles.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Aucun membre trouve
              </div>
            ) : (
              filteredProfiles.map((profile) => {
                const isSelected = selectedMembers.has(profile.id);
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => toggleMember(profile.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer",
                      isSelected ? "bg-primary/5" : "hover:bg-muted/40",
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border",
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt=""
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium text-primary">
                          {getInitials(profile.full_name)}
                        </span>
                      )}
                    </div>

                    {/* Name + role */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {profile.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {roleLabels[profile.role] ?? profile.role}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!name.trim()}
          >
            Creer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
