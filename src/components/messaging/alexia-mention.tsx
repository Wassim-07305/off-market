"use client";

import { cn } from "@/lib/utils";
import { Bot, Sparkles } from "lucide-react";

interface AlexiaMentionProps {
  className?: string;
}

/**
 * Badge visuel affiche quand un message contient @AlexIA.
 * Pour l'instant, c'est uniquement du UI, pas de backend RAG.
 */
export function AlexiaMentionBadge({ className }: AlexiaMentionProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
        "bg-gradient-to-r from-violet-500/10 to-purple-500/10",
        "border border-violet-500/20",
        "text-[11px] font-semibold text-violet-600",
        className,
      )}
    >
      <Bot className="w-3 h-3" />
      AlexIA
      <Sparkles className="w-2.5 h-2.5 text-violet-400" />
    </span>
  );
}

/**
 * Detecte si un texte contient une mention @AlexIA.
 */
export function containsAlexiaMention(text: string): boolean {
  return /@alexia\b/i.test(text);
}

/**
 * Remplace @AlexIA dans le texte par un placeholder pour le rendu.
 * Retourne les segments avec les mentions marquees.
 */
export function parseAlexiaMentions(
  text: string,
): Array<{ type: "text" | "alexia"; content: string }> {
  const parts: Array<{ type: "text" | "alexia"; content: string }> = [];
  const regex = /@alexia\b/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: "alexia", content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

/**
 * Suggestion d'autocompletion dans le champ mention.
 */
export const ALEXIA_MEMBER_OPTION = {
  id: "alexia-bot",
  full_name: "AlexIA",
  avatar_url: null,
  role: "bot" as const,
};
