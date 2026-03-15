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
  Save,
} from "lucide-react";
interface LessonAction {
  id: string;
  lesson_id: string;
  title: string;
  sort_order: number;
}

interface LessonActionCompletion {
  id: string;
  action_id: string;
  user_id: string;
  completed_at: string;
}

// ─── Hooks ──────────────────────────────────────────────────────

function useLessonActions(lessonId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["lesson-actions", lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_actions")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[] as LessonAction[];
    },
  });
}

function useLessonActionCompletions(lessonId: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lesson-action-completions", lessonId, user?.id],
    enabled: !!user && !!lessonId,
    queryFn: async () => {
      // Get action IDs for this lesson
      const { data: actions, error: actError } = await supabase
        .from("lesson_actions")
        .select("id")
        .eq("lesson_id", lessonId);
      if (actError) throw actError;

      const actionIds = ((actions ?? []) as any[]).map((a) => a.id);
      if (actionIds.length === 0) return [];

      const { data, error } = await supabase
        .from("lesson_action_completions")
        .select("*")
        .eq("user_id", user!.id)
        .in("action_id", actionIds);
      if (error) throw error;
      return data as LessonActionCompletion[];
    },
  });
}

// ─── Student Checklist ──────────────────────────────────────────

interface LessonChecklistProps {
  lessonId: string;
  className?: string;
}

export function LessonChecklist({ lessonId, className }: LessonChecklistProps) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: actions, isLoading: actionsLoading } =
    useLessonActions(lessonId);
  const { data: completions, isLoading: completionsLoading } =
    useLessonActionCompletions(lessonId);

  const completedActionIds = new Set(
    (completions ?? []).map((c) => c.action_id),
  );
  const items = actions ?? [];
  const allComplete =
    items.length > 0 && items.every((it) => completedActionIds.has(it.id));
  const progress =
    items.length > 0
      ? Math.round((completedActionIds.size / items.length) * 100)
      : 0;

  const toggleAction = useMutation({
    mutationFn: async (actionId: string) => {
      if (!user) throw new Error("Non connecte");

      const isCompleted = completedActionIds.has(actionId);

      if (isCompleted) {
        const { error } = await supabase
          .from("lesson_action_completions")
          .delete()
          .eq("action_id", actionId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("lesson_action_completions")
          .insert({ action_id: actionId, user_id: user.id } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-action-completions", lessonId],
      });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  if (items.length === 0) return null;

  if (actionsLoading || completionsLoading) {
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
            {completedActionIds.size}/{items.length}
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
          const checked = completedActionIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleAction.mutate(item.id)}
              disabled={toggleAction.isPending}
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
                {item.title}
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

// ─── Admin Builder ──────────────────────────────────────────────

interface LessonChecklistBuilderProps {
  lessonId: string;
  className?: string;
}

export function LessonChecklistBuilder({
  lessonId,
  className,
}: LessonChecklistBuilderProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: existingActions } = useLessonActions(lessonId);

  const [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [newText, setNewText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingActions) {
      setItems(existingActions.map((a) => ({ id: a.id, title: a.title })));
    }
  }, [existingActions]);

  const addItem = useCallback(() => {
    if (!newText.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: newText.trim() },
    ]);
    setNewText("");
  }, [newText]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const updateItem = (id: string, title: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, title } : it)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Delete existing actions for this lesson
      const { error: delError } = await supabase
        .from("lesson_actions")
        .delete()
        .eq("lesson_id", lessonId);
      if (delError) throw delError;

      // Insert new actions
      if (items.length > 0) {
        const { error: insError } = await supabase
          .from("lesson_actions")
          .insert(
            items.map((it, i) => ({
              lesson_id: lessonId,
              title: it.title,
              sort_order: i,
            })) as any,
          );
        if (insError) throw insError;
      }

      queryClient.invalidateQueries({
        queryKey: ["lesson-actions", lessonId],
      });
      toast.success("Checklist sauvegardee");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
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
              value={item.title}
              onChange={(e) => updateItem(item.id, e.target.value)}
              className="flex-1 h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              placeholder="Decrire l'action..."
            />
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
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
          onClick={handleSave}
          disabled={isSaving}
          className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Enregistrer la checklist
        </button>
      </div>
    </div>
  );
}
