"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  StickyNote,
  X,
  Save,
  Loader2,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Target,
  MessageSquareText,
  FileText,
  ArrowRight,
} from "lucide-react";

interface ActionItem {
  title: string;
  assignee?: string;
  done: boolean;
}

interface SessionNotesPanelProps {
  callId: string;
  clientName?: string;
  preCallAnswers?: { objective: string; tried_solutions: string } | null;
  onClose: () => void;
}

export function SessionNotesPanel({
  callId,
  clientName,
  preCallAnswers,
  onClose,
}: SessionNotesPanelProps) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newAction, setNewAction] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showPreCall, setShowPreCall] = useState(!!preCallAnswers);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: "coaching",
      label: "Coaching",
      content:
        "## Objectif de la seance\n\n\n## Points discutes\n\n\n## Decisions prises\n\n\n## Prochaines etapes\n\n",
    },
    {
      id: "decouverte",
      label: "Decouverte",
      content:
        "## Situation actuelle\n\n\n## Problemes identifies\n\n\n## Objectifs\n\n\n## Solution proposee\n\n",
    },
    {
      id: "suivi",
      label: "Suivi",
      content:
        "## Progres depuis le dernier appel\n\n\n## Blocages rencontres\n\n\n## Actions a mener\n\n",
    },
  ];

  // Load existing notes
  useEffect(() => {
    async function loadNotes() {
      const { data } = await supabase
        .from("call_session_notes")
        .select("*")
        .eq("call_id", callId)
        .eq("author_id", user?.id ?? "")
        .maybeSingle();

      if (data) {
        const d = data as any;
        setNotes(d.content ?? "");
        setActionItems(d.action_items ?? []);
        setLastSaved(new Date(d.updated_at));
      }
    }
    if (user) loadNotes();
  }, [callId, user, supabase]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (notes.trim() || actionItems.length > 0) {
        handleSave(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [notes, actionItems]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(
    async (silent = false) => {
      if (!user) return;
      setIsSaving(true);

      try {
        const { error } = await (supabase as any).from("call_session_notes").upsert(
          {
            call_id: callId,
            author_id: user.id,
            content: notes,
            action_items: actionItems,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "call_id,author_id" },
        );

        if (error) throw error;
        setLastSaved(new Date());
        if (!silent) toast.success("Notes sauvegardees");
      } catch {
        if (!silent) toast.error("Erreur de sauvegarde");
      } finally {
        setIsSaving(false);
      }
    },
    [user, supabase, callId, notes, actionItems],
  );

  const addAction = () => {
    if (!newAction.trim()) return;
    setActionItems([...actionItems, { title: newAction.trim(), done: false }]);
    setNewAction("");
  };

  const toggleAction = (i: number) => {
    setActionItems(
      actionItems.map((a, idx) => (idx === i ? { ...a, done: !a.done } : a)),
    );
  };

  const removeAction = (i: number) => {
    setActionItems(actionItems.filter((_, idx) => idx !== i));
  };

  const applyTemplate = (templateId: string) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (tpl) {
      setNotes(tpl.content);
      setActiveTemplate(templateId);
    }
  };

  return (
    <div className="w-80 lg:w-96 bg-zinc-900/95 border-l border-white/5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Notes de seance</h3>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-[10px] text-zinc-500">
              {lastSaved.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Pre-call answers (collapsible) */}
        {preCallAnswers && (
          <div className="bg-zinc-800/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPreCall(!showPreCall)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                <MessageSquareText className="w-3.5 h-3.5" />
                Reponses pre-appel
                {clientName && (
                  <span className="text-zinc-500">· {clientName}</span>
                )}
              </span>
              {showPreCall ? (
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              )}
            </button>
            {showPreCall && (
              <div className="px-3 pb-3 space-y-2.5 border-t border-white/5 pt-2.5">
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Objectif
                  </span>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {preCallAnswers.objective}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" /> Deja essaye
                  </span>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {preCallAnswers.tried_solutions}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Template selector */}
        {!notes.trim() && (
          <div>
            <span className="text-[10px] uppercase text-zinc-500 mb-1.5 block">
              Modeles
            </span>
            <div className="flex gap-1.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                  className={cn(
                    "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors",
                    activeTemplate === tpl.id
                      ? "bg-primary/20 text-primary"
                      : "bg-zinc-800 text-zinc-400 hover:text-white",
                  )}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes textarea */}
        <div>
          <label className="text-[10px] uppercase text-zinc-500 mb-1.5 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Prenez vos notes ici..."
            className="w-full h-40 px-3 py-2.5 bg-zinc-800/50 border border-white/5 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none font-mono leading-relaxed"
          />
        </div>

        {/* Action items */}
        <div>
          <label className="text-[10px] uppercase text-zinc-500 mb-1.5 flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />
            Actions a faire
          </label>
          <div className="space-y-1">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <button onClick={() => toggleAction(i)} className="shrink-0">
                  {item.done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-500" />
                  )}
                </button>
                <span
                  className={cn(
                    "flex-1 text-xs",
                    item.done ? "text-zinc-600 line-through" : "text-zinc-300",
                  )}
                >
                  {item.title}
                </span>
                <button
                  onClick={() => removeAction(i)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            <input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder="Ajouter une action..."
              className="flex-1 h-7 px-2.5 bg-zinc-800/50 border border-white/5 rounded-lg text-[11px] text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary/30"
              onKeyDown={(e) => e.key === "Enter" && addAction()}
            />
            <button
              onClick={addAction}
              disabled={!newAction.trim()}
              className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Save footer */}
      <div className="px-4 py-3 border-t border-white/5">
        <button
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="w-full h-9 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {isSaving ? "Sauvegarde..." : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}
