"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface LessonFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => void;
  isPending?: boolean;
}

export function LessonFormDialog({
  open,
  onClose,
  onSave,
  isPending,
}: LessonFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() });
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md bg-surface rounded-2xl p-6 space-y-5"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            Nouvelle lecon
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Titre *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nom de la lecon"
              className={inputClass}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              rows={2}
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            La video et les ressources pourront etre ajoutees apres la creation.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isPending}
              className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isPending ? "..." : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
