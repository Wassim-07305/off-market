"use client";

import { useState } from "react";
import { useAvailableClosers, useAssignToCloser } from "@/hooks/use-pipeline";
import { cn } from "@/lib/utils";
import { X, Search, UserCheck } from "lucide-react";

interface AssignCloserModalProps {
  open: boolean;
  contactId: string | null;
  contactName: string;
  onClose: () => void;
}

export function AssignCloserModal({
  open,
  contactId,
  contactName,
  onClose,
}: AssignCloserModalProps) {
  const [search, setSearch] = useState("");
  const { data: closers, isLoading } = useAvailableClosers();
  const assignToCloser = useAssignToCloser();

  const filtered = (closers ?? []).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const handleAssign = (closerId: string) => {
    if (!contactId) return;
    assignToCloser.mutate(
      { contactId, closerId },
      { onSuccess: onClose },
    );
  };

  if (!open || !contactId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Assigner un closer
            </h3>
            <button
              onClick={onClose}
              className="size-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Choisir le closer pour <span className="font-medium text-foreground">{contactName}</span>
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              placeholder="Rechercher un closer..."
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
              <UserCheck className="size-8 opacity-30 mb-2" />
              <p className="text-sm">Aucun closer disponible</p>
            </div>
          ) : (
            filtered.map((closer) => (
              <button
                key={closer.id}
                onClick={() => handleAssign(closer.id)}
                disabled={assignToCloser.isPending}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                  "hover:bg-muted/80 disabled:opacity-50",
                )}
              >
                <div className="size-9 rounded-full bg-gradient-to-br from-red-600/20 to-red-500/10 flex items-center justify-center text-xs font-semibold text-red-300 shrink-0">
                  {closer.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {closer.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {closer.email}
                  </p>
                </div>
                <UserCheck className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
