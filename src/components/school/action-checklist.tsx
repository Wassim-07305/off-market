"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Loader2,
  ListChecks,
  GripVertical,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  text: string;
  sort_order: number;
}

interface ChecklistCompletion {
  item_id: string;
  completed_at: string;
}

// ─── Hooks ──────────────────────────────────────────────────────

function useLessonChecklist(lessonId: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  // Fetch checklist items from lesson content
  const itemsQuery = useQuery({
    queryKey: ["lesson-checklist", lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lessons")
        .select("content")
        .eq("id", lessonId)
        .single() as { data: { content: unknown } | null; error: any };
      if (error) throw error;
      const content = data?.content as Record<string, unknown> | null;
      return ((content?.checklist as ChecklistItem[]) ?? []).sort(
        (a, b) => a.sort_order - b.sort_order,
      );
    },
  });

  // Fetch student completions
  const completionsQuery = useQuery({
    queryKey: ["lesson-checklist-completions", lessonId, user?.id],
    enabled: !!user && !!lessonId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("lesson_progress")
        .select("id, checklist_completions")
        .eq("lesson_id", lessonId)
        .eq("student_id", user!.id)
        .maybeSingle() as { data: { id: string; checklist_completions: unknown } | null; error: any };
      if (error) throw error;
      return (
        (data?.checklist_completions as ChecklistCompletion[] | null) ?? []
      );
    },
  });

  return {
    items: itemsQuery.data ?? [],
    completions: completionsQuery.data ?? [],
    isLoading: itemsQuery.isLoading || completionsQuery.isLoading,
  };
}

// ─── Student Checklist (read + check) ──────────────────────────

interface ActionChecklistProps {
  lessonId: string;
  className?: string;
}

export function ActionChecklist({ lessonId, className }: ActionChecklistProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { items, completions, isLoading } = useLessonChecklist(lessonId);

  const completedIds = new Set(completions.map((c) => c.item_id));
  const allComplete =
    items.length > 0 && items.every((it) => completedIds.has(it.id));
  const progress =
    items.length > 0 ? Math.round((completedIds.size / items.length) * 100) : 0;

  const toggleItem = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user) throw new Error("Non connecte");

      const isCompleted = completedIds.has(itemId);
      let updated: ChecklistCompletion[];

      if (isCompleted) {
        updated = completions.filter((c) => c.item_id !== itemId);
      } else {
        updated = [
          ...completions,
          { item_id: itemId, completed_at: new Date().toISOString() },
        ];
      }

      // Upsert into lesson_progress
      const { error } = await (supabase as any).from("lesson_progress").upsert(
        {
          student_id: user.id,
          lesson_id: lessonId,
          checklist_completions: updated,
          status: updated.length === items.length ? "completed" : "in_progress",
          progress_percent:
            items.length > 0
              ? Math.round((updated.length / items.length) * 100)
              : 0,
          ...(updated.length === items.length
            ? { completed_at: new Date().toISOString() }
            : {}),
        },
        { onConflict: "lesson_id,student_id" },
      ) as { error: any };
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-checklist-completions", lessonId],
      });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  if (items.length === 0) return null;

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-muted animate-shimmer rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl border border-border overflow-hidden",
        className,
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Actions a realiser
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {completedIds.size}/{items.length}
          </span>
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                allComplete ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-border/30">
        {items.map((item) => {
          const checked = completedIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleItem.mutate(item.id)}
              disabled={toggleItem.isPending}
              className={cn(
                "w-full flex items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/30",
                checked && "bg-emerald-500/5",
              )}
            >
              {checked ? (
                <CheckSquare className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4.5 h-4.5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <span
                className={cn(
                  "text-sm transition-colors",
                  checked
                    ? "text-muted-foreground line-through"
                    : "text-foreground",
                )}
              >
                {item.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completion message */}
      {allComplete && (
        <div className="px-5 py-3 bg-emerald-500/10 border-t border-emerald-500/20">
          <p className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            Toutes les actions sont completees !
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Builder (for admin/coach in lesson editor) ────────────────

interface ChecklistBuilderProps {
  lessonId: string;
  initialItems?: ChecklistItem[];
  onSave: (items: ChecklistItem[]) => void;
  isSaving?: boolean;
}

export function ChecklistBuilder({
  initialItems,
  onSave,
  isSaving,
}: ChecklistBuilderProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems ?? []);
  const [newText, setNewText] = useState("");

  useEffect(() => {
    setItems(initialItems ?? []);
  }, [initialItems]);

  const addItem = useCallback(() => {
    if (!newText.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: newText.trim(),
        sort_order: prev.length,
      },
    ]);
    setNewText("");
  }, [newText]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, text: string) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, text } : it)));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ListChecks className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">
          Checklist d&apos;actions
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {items.length} action{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
              {index + 1}
            </span>
            <input
              value={item.text}
              onChange={(e) => updateItem(item.id, e.target.value)}
              className="flex-1 h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="Decrire l'action..."
            />
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <div className="flex items-center gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder="Nouvelle action..."
          className="flex-1 h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
        <button
          onClick={addItem}
          disabled={!newText.trim()}
          className="h-9 px-3 rounded-lg bg-muted hover:bg-muted/80 text-sm text-foreground transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter
        </button>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={() => onSave(items)}
          disabled={isSaving}
          className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Enregistrer la checklist
        </button>
      </div>
    </div>
  );
}
