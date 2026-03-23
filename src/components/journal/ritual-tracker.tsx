"use client";

import { useState } from "react";
import { Flame, Plus, Trash2, X } from "lucide-react";
import {
  useTodayRituals,
  useCreateRitual,
  useCompleteRitual,
  useDeleteRitual,
  isCompletedToday,
} from "@/hooks/use-rituals";
import type { Ritual } from "@/hooks/use-rituals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Frequency options ─────────────────────────────────────────

const frequencyOptions = [
  { value: "quotidien", label: "Quotidien" },
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
];

const frequencyLabels: Record<string, string> = {
  quotidien: "Quotidien",
  hebdomadaire: "Hebdomadaire",
  mensuel: "Mensuel",
};

// ─── Ritual item ───────────────────────────────────────────────

function RitualItem({
  ritual,
  onComplete,
  onDelete,
  isCompleting,
}: {
  ritual: Ritual;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  isCompleting: boolean;
}) {
  const completed = isCompletedToday(ritual);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-all duration-200",
        completed && "border-green-200 bg-green-50/50 opacity-75",
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => !completed && onComplete(ritual.id)}
        disabled={completed || isCompleting}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-300 hover:border-primary cursor-pointer",
          isCompleting && "animate-pulse",
        )}
      >
        {completed && (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Title & frequency */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            completed && "line-through text-muted-foreground",
          )}
        >
          {ritual.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {frequencyLabels[ritual.frequency] ?? ritual.frequency}
        </p>
      </div>

      {/* Streak badge */}
      {ritual.streak_count > 0 && (
        <Badge
          variant={ritual.streak_count >= 7 ? "success" : "warning"}
          className="gap-1 shrink-0"
        >
          <Flame className="h-3 w-3" />
          {ritual.streak_count}
        </Badge>
      )}

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onDelete(ritual.id)}
        className="shrink-0 rounded-lg p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive cursor-pointer"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Add ritual form ───────────────────────────────────────────

function AddRitualForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("quotidien");
  const createRitual = useCreateRitual();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    createRitual.mutate(
      {
        title: title.trim(),
        frequency: frequency as "quotidien" | "hebdomadaire" | "mensuel",
      },
      {
        onSuccess: () => {
          setTitle("");
          setFrequency("quotidien");
          onClose();
        },
      },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-dashed border-border p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Nouveau rituel</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Input
        placeholder="Nom du rituel..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />

      <Select
        options={frequencyOptions}
        value={frequency}
        onChange={setFrequency}
        label="Fréquence"
      />

      <Button
        type="submit"
        size="sm"
        loading={createRitual.isPending}
        disabled={!title.trim()}
        className="w-full"
      >
        Ajouter
      </Button>
    </form>
  );
}

// ─── Main component ────────────────────────────────────────────

export function RitualTracker() {
  const [showForm, setShowForm] = useState(false);
  const { data: rituals, isLoading } = useTodayRituals();
  const completeRitual = useCompleteRitual();
  const deleteRitual = useDeleteRitual();

  const completedCount =
    rituals?.filter((r) => isCompletedToday(r)).length ?? 0;
  const totalCount = rituals?.length ?? 0;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Rituels du jour</CardTitle>
          {totalCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {completedCount}/{totalCount} completes
            </p>
          )}
        </div>
        {!showForm && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowForm(true)}
          >
            Ajouter
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-muted/50"
              />
            ))}
          </div>
        ) : rituals && rituals.length > 0 ? (
          rituals.map((ritual) => (
            <RitualItem
              key={ritual.id}
              ritual={ritual}
              onComplete={(id) => completeRitual.mutate(id)}
              onDelete={(id) => deleteRitual.mutate(id)}
              isCompleting={completeRitual.isPending}
            />
          ))
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun rituel pour aujourd&apos;hui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajoutez des rituels pour structurer votre journee
            </p>
          </div>
        )}

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="pt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{
                  width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {showForm && <AddRitualForm onClose={() => setShowForm(false)} />}
      </CardContent>
    </Card>
  );
}
