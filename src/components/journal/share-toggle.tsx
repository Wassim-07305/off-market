"use client";

import { useState } from "react";
import { Share2, Lock, Loader2 } from "lucide-react";
import { useJournal } from "@/hooks/use-journal";
import { cn } from "@/lib/utils";

interface ShareToggleProps {
  entryId: string;
  initialShared: boolean;
}

export function ShareToggle({ entryId, initialShared }: ShareToggleProps) {
  const { toggleShare } = useJournal();
  const [shared, setShared] = useState(initialShared);

  const handleToggle = () => {
    const newValue = !shared;
    setShared(newValue);
    toggleShare.mutate(
      { id: entryId, shared: newValue },
      {
        onError: () => {
          // Revert on error
          setShared(shared);
        },
      },
    );
  };

  return (
    <button
      onClick={handleToggle}
      disabled={toggleShare.isPending}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all",
        shared
          ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          : "bg-muted text-muted-foreground border border-border hover:bg-muted/80",
      )}
    >
      {toggleShare.isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : shared ? (
        <Share2 className="w-3.5 h-3.5" />
      ) : (
        <Lock className="w-3.5 h-3.5" />
      )}
      {shared ? "Partage avec coach" : "Prive"}
    </button>
  );
}

// ─── Inline toggle for use in forms (not yet persisted) ──────────
interface ShareToggleInlineProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ShareToggleInline({ value, onChange }: ShareToggleInlineProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all",
        value
          ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
          : "bg-muted text-muted-foreground border border-border hover:bg-muted/80",
      )}
    >
      {value ? <Share2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
      {value ? "Visible par ton coach" : "Entree privee"}
    </button>
  );
}
