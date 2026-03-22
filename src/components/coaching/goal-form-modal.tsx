"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Target, Info } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CoachingGoal } from "@/types/coaching";

// ─── Schema ──────────────────────────────────────────────────

const goalSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  description: z.string().optional(),
  target_value: z.string().optional(),
  unit: z.string().optional(),
  deadline: z.string().optional(),
  difficulty: z.string().optional(),
  coach_notes: z.string().optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

// ─── Difficulty labels ──────────────────────────────────────

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Tres facile", color: "bg-emerald-500" },
  2: { label: "Facile", color: "bg-green-500" },
  3: { label: "Moyen", color: "bg-amber-500" },
  4: { label: "Difficile", color: "bg-orange-500" },
  5: { label: "Tres difficile", color: "bg-red-500" },
};

// ─── Unit presets ────────────────────────────────────────────

const UNIT_PRESETS = [
  { value: "clients", label: "Clients" },
  { value: "EUR", label: "EUR" },
  { value: "appels", label: "Appels" },
  { value: "ventes", label: "Ventes" },
  { value: "%", label: "%" },
  { value: "sessions", label: "Sessions" },
  { value: "leads", label: "Leads" },
  { value: "contenus", label: "Contenus" },
];

// ─── Component ──────────────────────────────────────────────

export interface GoalFormSubmitData {
  title: string;
  description?: string;
  target_value?: number;
  unit?: string;
  deadline?: string;
  difficulty?: number;
  coach_notes?: string;
}

interface GoalFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormSubmitData) => Promise<void>;
  editGoal?: CoachingGoal | null;
  isSubmitting?: boolean;
}

const inputClass = cn(
  "w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm",
  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
  "placeholder:text-muted-foreground/60",
  "transition-all duration-200",
);

const labelClass = "block text-xs font-semibold text-foreground mb-1.5";

export function GoalFormModal({
  open,
  onClose,
  onSubmit,
  editGoal,
  isSubmitting = false,
}: GoalFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      target_value: "",
      unit: "",
      deadline: "",
      difficulty: "",
      coach_notes: "",
    },
  });

  const selectedUnit = watch("unit");
  const selectedDifficulty = watch("difficulty");

  useEffect(() => {
    if (open) {
      if (editGoal) {
        reset({
          title: editGoal.title,
          description: editGoal.description ?? "",
          target_value:
            editGoal.target_value != null ? String(editGoal.target_value) : "",
          unit: editGoal.unit ?? "",
          deadline: editGoal.deadline?.split("T")[0] ?? "",
          difficulty: editGoal.difficulty != null ? String(editGoal.difficulty) : "",
          coach_notes: editGoal.coach_notes ?? "",
        });
      } else {
        reset({
          title: "",
          description: "",
          target_value: "",
          unit: "",
          deadline: "",
          difficulty: "",
          coach_notes: "",
        });
      }
    }
  }, [open, editGoal, reset]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const parsed: GoalFormSubmitData = {
      title: data.title,
      description: data.description,
      target_value: data.target_value ? Number(data.target_value) : undefined,
      unit: data.unit,
      deadline: data.deadline,
      difficulty: data.difficulty ? Number(data.difficulty) : undefined,
      coach_notes: data.coach_notes || undefined,
    };
    await onSubmit(parsed);
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editGoal ? "Modifier l'objectif" : "Nouvel objectif"}
      description={
        editGoal
          ? "Modifie les details de l'objectif"
          : "Definis un nouvel objectif mesurable pour le suivi coaching"
      }
      size="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className={labelClass}>Titre *</label>
          <input
            {...register("title")}
            placeholder="Ex: Atteindre 10 clients actifs"
            className={cn(
              inputClass,
              errors.title && "border-red-300 focus:ring-red-200",
            )}
          />
          {errors.title && (
            <p className="text-[11px] text-red-500 mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            {...register("description")}
            placeholder="Details et contexte de l'objectif..."
            rows={3}
            className={cn(inputClass, "h-auto py-2.5 resize-none")}
          />
        </div>

        {/* Target value + Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Valeur cible</label>
            <input
              type="number"
              {...register("target_value")}
              placeholder="10"
              min={0}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Unite</label>
            <select
              {...register("unit")}
              className={cn(inputClass, "appearance-none cursor-pointer")}
            >
              <option value="">Choisir...</option>
              {UNIT_PRESETS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unit quick select pills */}
        <div className="flex flex-wrap gap-1.5">
          {UNIT_PRESETS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => setValue("unit", u.value)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150",
                selectedUnit === u.value
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-zinc-50 text-muted-foreground border-border/40 hover:border-border hover:bg-zinc-100",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>

        {/* ─── SMART Section ─── */}
        <div className="border-t border-border/50 pt-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Criteres SMART
            </span>
          </div>

          {/* Atteignable - Difficulty slider */}
          <div className="mb-4">
            <label className={labelClass}>
              Difficulte (Atteignable)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const config = DIFFICULTY_LABELS[level];
                const isSelected = Number(selectedDifficulty) === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setValue("difficulty", String(level))}
                    className={cn(
                      "flex-1 h-9 rounded-xl text-xs font-medium border transition-all duration-150 flex items-center justify-center gap-1",
                      isSelected
                        ? `${config.color} text-white border-transparent shadow-sm`
                        : "bg-zinc-50 dark:bg-muted text-muted-foreground border-border/40 hover:border-border",
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
            {selectedDifficulty && DIFFICULTY_LABELS[Number(selectedDifficulty)] && (
              <p className="text-[11px] text-muted-foreground mt-1">
                {DIFFICULTY_LABELS[Number(selectedDifficulty)].label}
              </p>
            )}
          </div>

          {/* Realiste - Coach notes */}
          <div className="mb-4">
            <label className={labelClass}>
              Notes du coach (Realiste)
            </label>
            <textarea
              {...register("coach_notes")}
              placeholder="Pourquoi cet objectif est realiste pour ce client..."
              rows={2}
              className={cn(inputClass, "h-auto py-2.5 resize-none")}
            />
          </div>
        </div>

        {/* Deadline (Temporel) */}
        <div>
          <label className={labelClass}>Echeance (Temporel)</label>
          <input
            type="date"
            {...register("deadline")}
            className={inputClass}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            size="sm"
            loading={isSubmitting}
            icon={<Target className="w-3.5 h-3.5" />}
          >
            {editGoal ? "Enregistrer" : "Creer l'objectif"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
