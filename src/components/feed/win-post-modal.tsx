"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Confetti } from "./confetti";
import type { WinPostMeta } from "@/types/feed";

interface WinPostModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (content: string, winData: WinPostMeta) => void;
  isSubmitting: boolean;
}

const WIN_FIELDS = [
  {
    key: "result" as const,
    label: "Resultat",
    placeholder: "Ex: J'ai signe mon premier client a 2000EUR/mois !",
    emoji: "🎯",
    required: true,
  },
  {
    key: "context" as const,
    label: "Contexte",
    placeholder: "Ex: Apres 3 semaines de prospection sur Instagram...",
    emoji: "📋",
    required: false,
  },
  {
    key: "actions" as const,
    label: "Actions prises",
    placeholder:
      "Ex: 50 DMs/jour, 2 calls de decouverte, une offre sur mesure...",
    emoji: "⚡",
    required: false,
  },
  {
    key: "lesson" as const,
    label: "Lecon apprise",
    placeholder:
      "Ex: La cle c'etait de qualifier rapidement pour ne pas perdre de temps...",
    emoji: "💡",
    required: false,
  },
];

export function WinPostModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: WinPostModalProps) {
  const [fields, setFields] = useState<WinPostMeta>({
    result: "",
    context: "",
    actions: "",
    lesson: "",
  });
  const [showConfetti, setShowConfetti] = useState(false);

  const updateField = (key: keyof WinPostMeta, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = fields.result.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Build content from structured fields
    const parts: string[] = [];
    parts.push(`🎯 ${fields.result.trim()}`);
    if (fields.context.trim()) parts.push(`📋 ${fields.context.trim()}`);
    if (fields.actions.trim()) parts.push(`⚡ ${fields.actions.trim()}`);
    if (fields.lesson.trim()) parts.push(`💡 ${fields.lesson.trim()}`);
    const content = parts.join("\n\n");

    // Trigger confetti
    setShowConfetti(true);

    onSubmit(content, fields);

    // Reset after submission
    setTimeout(() => {
      setFields({ result: "", context: "", actions: "", lesson: "" });
    }, 500);
  };

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  if (!open) return null;

  return (
    <>
      <Confetti active={showConfetti} onComplete={handleConfettiComplete} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          className="relative bg-surface rounded-2xl w-full max-w-lg overflow-hidden"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-transparent p-5 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    Partager une victoire
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Remplis le template pour inspirer la communaute
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            {WIN_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-1.5">
                  <span>{field.emoji}</span>
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
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
          <div className="px-5 pb-5 flex items-center justify-between border-t border-border/50 pt-4">
            <p className="text-[10px] text-muted-foreground">
              * Seul le resultat est obligatoire
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="h-9 px-4 border border-border rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="h-9 px-5 bg-emerald-500 text-white rounded-xl text-xs font-medium hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSubmitting ? "Publication..." : "Publier la victoire"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
