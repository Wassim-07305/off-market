"use client";

import { useState, useEffect } from "react";
import { useCallNote } from "@/hooks/use-pipeline";
import {
  CALL_MOOD_CONFIG,
  CALL_OUTCOME_CONFIG,
  type CallNoteMood,
  type CallNoteOutcome,
  type CallNoteActionItem,
} from "@/types/pipeline";
import { cn } from "@/lib/utils";
import {
  FileText,
  Save,
  Loader2,
  Plus,
  CheckCircle,
  Circle,
  Trash2,
} from "lucide-react";

interface CallNotesFormProps {
  callId: string;
}

export function CallNotesForm({ callId }: CallNotesFormProps) {
  const { note, isLoading, saveNote } = useCallNote(callId);

  const [summary, setSummary] = useState("");
  const [mood, setMood] = useState<CallNoteMood | "">("");
  const [outcome, setOutcome] = useState<CallNoteOutcome | "">("");
  const [nextSteps, setNextSteps] = useState("");
  const [actionItems, setActionItems] = useState<CallNoteActionItem[]>([]);
  const [newAction, setNewAction] = useState("");

  // Populate from existing note
  useEffect(() => {
    if (note) {
      setSummary(note.summary ?? "");
      setMood(note.client_mood ?? "");
      setOutcome(note.outcome ?? "");
      setNextSteps(note.next_steps ?? "");
      setActionItems(note.action_items ?? []);
    }
  }, [note]);

  const handleSave = () => {
    saveNote.mutate({
      summary: summary || undefined,
      client_mood: mood || undefined,
      outcome: outcome || undefined,
      next_steps: nextSteps || undefined,
      action_items: actionItems,
    });
  };

  const addActionItem = () => {
    if (!newAction.trim()) return;
    setActionItems([...actionItems, { title: newAction, done: false }]);
    setNewAction("");
  };

  const toggleAction = (index: number) => {
    setActionItems(
      actionItems.map((a, i) =>
        i === index ? { ...a, done: !a.done } : a
      )
    );
  };

  const removeAction = (index: number) => {
    setActionItems(actionItems.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-shimmer rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <FileText className="w-4 h-4" />
        Notes post-appel
      </h3>

      {/* Summary */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Resume de l&apos;appel
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Points cles discutes, decisions prises..."
          rows={3}
          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Mood */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Humeur du client
        </label>
        <div className="flex gap-1.5">
          {(Object.entries(CALL_MOOD_CONFIG) as [CallNoteMood, { label: string; emoji: string }][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setMood(mood === key ? "" : key)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 p-2 rounded-lg border transition-colors",
                  mood === key
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <span className="text-lg">{config.emoji}</span>
                <span className="text-[9px] text-muted-foreground">{config.label}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Outcome */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Resultat
        </label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(CALL_OUTCOME_CONFIG) as [CallNoteOutcome, { label: string; color: string }][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setOutcome(outcome === key ? "" : key)}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-xs font-medium transition-colors border",
                  outcome === key
                    ? cn(config.color, "border-current/20")
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {config.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Next steps */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">
          Prochaines etapes
        </label>
        <textarea
          value={nextSteps}
          onChange={(e) => setNextSteps(e.target.value)}
          placeholder="Actions a mener, relances prevues..."
          rows={2}
          className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Action items */}
      <div>
        <label className="block text-xs font-medium text-foreground mb-1.5">
          Actions a faire
        </label>
        <div className="space-y-1.5">
          {actionItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <button
                onClick={() => toggleAction(i)}
                className="shrink-0"
              >
                {item.done ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.done ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {item.title}
              </span>
              <button
                onClick={() => removeAction(i)}
                className="p-0.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Ajouter une action..."
              className="flex-1 h-8 px-3 bg-muted/50 border border-border rounded-lg text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              onKeyDown={(e) => e.key === "Enter" && addActionItem()}
            />
            <button
              onClick={addActionItem}
              disabled={!newAction.trim()}
              className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saveNote.isPending}
        className="w-full h-9 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saveNote.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saveNote.isPending ? "Sauvegarde..." : note ? "Mettre a jour" : "Sauvegarder"}
      </button>
    </div>
  );
}
