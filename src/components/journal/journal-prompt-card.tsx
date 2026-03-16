"use client";

import { motion } from "framer-motion";
import { Lightbulb, RefreshCw } from "lucide-react";
import {
  useDailyPrompt,
  useJournalPrompts,
  PROMPT_CATEGORIES,
} from "@/hooks/use-journal-prompts";
import type { PromptCategory } from "@/hooks/use-journal-prompts";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface JournalPromptCardProps {
  onUsePrompt: (promptText: string, promptId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  gratitude: "from-pink-500/20 to-pink-600/10 border-pink-500/20",
  reflection: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
  goal: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  mindset: "from-purple-500/20 to-purple-600/10 border-purple-500/20",
  business: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
  wins: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
  goals: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20",
  habits: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/20",
  learning: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20",
  general: "from-primary/20 to-primary/10 border-primary/20",
};

export function JournalPromptCard({ onUsePrompt }: JournalPromptCardProps) {
  const { prompt, isLoading } = useDailyPrompt();
  const { prompts } = useJournalPrompts();
  const [customIndex, setCustomIndex] = useState<number | null>(null);

  const displayPrompt = customIndex !== null ? prompts[customIndex] : prompt;

  const handleShuffle = () => {
    if (prompts.length <= 1) return;
    let newIndex: number;
    do {
      newIndex = Math.floor(Math.random() * prompts.length);
    } while (prompts[newIndex]?.id === displayPrompt?.id);
    setCustomIndex(newIndex);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 animate-pulse">
        <div className="h-4 w-32 bg-muted rounded mb-3" />
        <div className="h-5 w-full bg-muted rounded" />
      </div>
    );
  }

  if (!displayPrompt) return null;

  const colorClass =
    CATEGORY_COLORS[displayPrompt.category] ?? CATEGORY_COLORS.general;

  const categoryConfig =
    PROMPT_CATEGORIES[displayPrompt.category as PromptCategory];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("rounded-2xl border bg-gradient-to-br p-5", colorClass)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Prompt du jour
          </span>
          {categoryConfig && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium",
                categoryConfig.color,
              )}
            >
              {categoryConfig.label}
            </span>
          )}
          {!categoryConfig && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {displayPrompt.category}
            </span>
          )}
        </div>
        <button
          onClick={handleShuffle}
          className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          title="Nouveau prompt"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Prompt text */}
      <p className="text-base font-medium text-foreground leading-relaxed mb-4">
        {displayPrompt.text}
      </p>

      {/* CTA */}
      <button
        onClick={() => onUsePrompt(displayPrompt.text, displayPrompt.id)}
        className="h-9 px-4 rounded-xl bg-[#DC2626] text-white text-sm font-medium hover:bg-[#DC2626]/90 transition-all active:scale-[0.98]"
      >
        Utiliser ce prompt
      </button>
    </motion.div>
  );
}
