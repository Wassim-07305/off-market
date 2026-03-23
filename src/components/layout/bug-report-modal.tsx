"use client";

import { useState } from "react";
import { Bug, Send, AlertTriangle, HelpCircle, Lightbulb } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useCreateTicket } from "@/hooks/use-support-tickets";
import { cn } from "@/lib/utils";

const catégories = [
  { value: "bug" as const, label: "Bug", icon: Bug, color: "text-red-400" },
  {
    value: "feature" as const,
    label: "Suggestion",
    icon: Lightbulb,
    color: "text-amber-400",
  },
  {
    value: "question" as const,
    label: "Question",
    icon: HelpCircle,
    color: "text-blue-400",
  },
  {
    value: "autre" as const,
    label: "Autre",
    icon: AlertTriangle,
    color: "text-slate-400",
  },
];

const priorities = [
  { value: "low" as const, label: "Faible", color: "bg-slate-500" },
  { value: "medium" as const, label: "Moyen", color: "bg-amber-500" },
  { value: "high" as const, label: "Eleve", color: "bg-orange-500" },
  { value: "critical" as const, label: "Critique", color: "bg-red-500" },
];

interface BugReportModalProps {
  open: boolean;
  onClose: () => void;
}

export function BugReportModal({ open, onClose }: BugReportModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"bug" | "feature" | "question" | "autre">("bug");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  const { mutate: createTicket, isPending } = useCreateTicket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createTicket(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setCategory("bug");
          setPriority("medium");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Signaler un problème"
      description="Decrivez le problème rencontre et nous le traiterons rapidement."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {catégories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-all",
                  category === cat.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/50",
                )}
              >
                <cat.icon className={cn("h-4 w-4", cat.color)} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            htmlFor="ticket-title"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Titre
          </label>
          <input
            id="ticket-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resume du problème..."
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="ticket-desc"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="ticket-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Decrivez les étapes pour reproduire le problème, ce que vous attendiez, et ce qui s'est passe..."
            required
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Priorite
          </label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  priority === p.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50",
                )}
              >
                <span
                  className={cn("h-2 w-2 rounded-full", p.color)}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          La page actuelle et votre navigateur seront automatiquement inclus dans le rapport.
        </p>

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isPending || !title.trim() || !description.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            {isPending ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
