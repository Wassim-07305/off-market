"use client";

import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiResponseBadgeProps {
  className?: string;
}

/**
 * Badge "Reponse IA" affiche sur les messages generes par l'IA (F46.1).
 * Distingue visuellement les reponses IA des messages humains.
 */
export function AiResponseBadge({ className }: AiResponseBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
        "bg-gradient-to-r from-violet-500/10 to-purple-500/10",
        "border border-violet-500/20",
        "text-[10px] font-semibold text-violet-600 dark:text-violet-400",
        "select-none",
        className,
      )}
    >
      <Bot className="w-2.5 h-2.5" />
      Reponse IA
    </span>
  );
}
