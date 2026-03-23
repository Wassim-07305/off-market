"use client";

import { useState } from "react";
import { useAvailableProspectProfiles, usePipelineContacts } from "@/hooks/use-pipeline";
import { cn } from "@/lib/utils";
import { X, Search, UserPlus, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface AddProspectModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddProspectModal({ open, onClose }: AddProspectModalProps) {
  const [search, setSearch] = useState("");
  const { data: prospects, isLoading } = useAvailableProspectProfiles();
  const { createContact } = usePipelineContacts(undefined, "signup");
  const queryClient = useQueryClient();

  const filtered = (prospects ?? []).filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  });

  const handleAdd = (profile: { id: string; full_name: string; email: string }) => {
    createContact.mutate(
      {
        full_name: profile.full_name,
        email: profile.email,
        source: "website",
        stage: "prospect",
        converted_profile_id: profile.id,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["available-prospect-profiles"] });
          onClose();
        },
      },
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">
            Ajouter un prospect inscrit
          </h3>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/60 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <UserPlus className="size-8 opacity-30 mb-2" />
              <p className="text-sm">
                {prospects?.length === 0
                  ? "Aucun prospect disponible"
                  : "Aucun résultat"}
              </p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                {prospects?.length === 0
                  ? "Tous les prospects inscrits sont deja dans le pipeline"
                  : "Essayez un autre terme de recherche"}
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAdd(p)}
                disabled={createContact.isPending}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                  "hover:bg-muted/80 disabled:opacity-50",
                )}
              >
                <div className="size-9 rounded-full bg-gradient-to-br from-blue-600/20 to-blue-500/10 flex items-center justify-center text-xs font-semibold text-blue-300 shrink-0">
                  {p.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.email}
                  </p>
                </div>
                <Plus className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
