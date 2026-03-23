"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Sparkles,
  X,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WinPostMeta } from "@/types/feed";

interface WinComposerProps {
  onSubmit: (content: string, meta: WinPostMeta) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const WIN_FIELDS = [
  {
    key: "result" as const,
    label: "Résultat",
    placeholder: "Ex: J'ai signe mon premier client a 2000EUR/mois !",
    emoji: "🎯",
  },
  {
    key: "context" as const,
    label: "Contexte",
    placeholder: "Ex: Apres 3 semaines de prospection sur Instagram...",
    emoji: "📋",
  },
  {
    key: "actions" as const,
    label: "Actions prises",
    placeholder:
      "Ex: 50 DMs/jour, 2 calls de decouverte, une offre sur mesure...",
    emoji: "⚡",
  },
  {
    key: "lesson" as const,
    label: "Leçon apprise",
    placeholder:
      "Ex: La cle c'etait de qualifier rapidement pour ne pas perdre de temps...",
    emoji: "💡",
  },
];

export function WinComposer({
  onSubmit,
  isSubmitting,
  onCancel,
}: WinComposerProps) {
  const [fields, setFields] = useState<WinPostMeta>({
    result: "",
    context: "",
    actions: "",
    lesson: "",
  });

  const updateField = (key: keyof WinPostMeta, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = fields.result.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Build content from the structured fields
    const parts: string[] = [];
    parts.push(`🎯 ${fields.result.trim()}`);
    if (fields.context.trim()) parts.push(`📋 ${fields.context.trim()}`);
    if (fields.actions.trim()) parts.push(`⚡ ${fields.actions.trim()}`);
    if (fields.lesson.trim()) parts.push(`💡 ${fields.lesson.trim()}`);

    const content = parts.join("\n\n");
    onSubmit(content, fields);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Partager une victoire
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Remplis le template pour inspirer la communaute
        </p>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-4">
        {WIN_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
              <span>{field.emoji}</span>
              {field.label}
              {field.key === "result" && <span className="text-error">*</span>}
            </label>
            <textarea
              value={fields[field.key]}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={2}
              className="w-full px-3 py-2.5 bg-muted/30 border border-border/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 resize-none transition-all"
            />
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          * Seul le résultat est obligatoire
        </p>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="h-9 px-5 bg-emerald-500 text-white rounded-xl text-xs font-medium hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {isSubmitting ? "Publication..." : "Publier la victoire"}
        </button>
      </div>
    </motion.div>
  );
}
