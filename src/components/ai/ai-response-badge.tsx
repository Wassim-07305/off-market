"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiResponseBadgeProps {
  className?: string;
}

/**
 * Badge "Généré par IA" affiche sous les messages generes par l'IA.
 * Style subtil, petit texte gris avec icone Sparkles.
 */
export function AiResponseBadge({ className }: AiResponseBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 mt-1",
        "text-[10px] text-muted-foreground/70 select-none",
        className,
      )}
    >
      <Sparkles className="w-2.5 h-2.5" />
      Généré par IA
    </span>
  );
}
