"use client";

import { useState } from "react";
import { useAvailabilitySlots, useAvailabilityOverrides } from "@/hooks/use-booking";
import { DAY_LABELS } from "@/types/streaks";
import { Plus, Trash2, Calendar, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function AvailabilityManager() {
  const { slots, isLoading, createSlot, deleteSlot, toggleSlot } = useAvailabilitySlots();
  const { overrides, addOverride, removeOverride } = useAvailabilityOverrides();

  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newDay, setNewDay] = useState(1); // Monday
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("12:00");
  const [newDuration, setNewDuration] = useState(30);

  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const handleAddSlot = () => {
    createSlot.mutate(
      {
        day_of_week: newDay,
        start_time: newStart,
        end_time: newEnd,
        slot_duration_minutes: newDuration,
      },
      { onSuccess: () => setShowAddSlot(false) }
    );
  };

  const handleAddBlock = () => {
    if (!blockDate) return;
    addOverride.mutate(
      { override_date: blockDate, is_blocked: true, reason: blockReason || undefined },
      {
        onSuccess: () => {
          setShowAddBlock(false);
          setBlockDate("");
          setBlockReason("");
        },
      }
    );
  };

  // Group slots by day
  const slotsByDay = new Map<number, typeof slots>();
  slots.forEach((s) => {
    if (!slotsByDay.has(s.day_of_week)) slotsByDay.set(s.day_of_week, []);
    slotsByDay.get(s.day_of_week)!.push(s);
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly slots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Creneaux recurrents
          </h3>
          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </button>
        </div>

        {/* Add slot form */}
        {showAddSlot && (
          <div className="bg-muted/30 rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Jour</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm"
                >
                  {DAY_LABELS.map((label, i) => (
                    <option key={i} value={i}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Duree (min)</label>
                <select
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Debut</label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Fin</label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddSlot(false)}
                className="h-8 px-3 rounded-lg text-xs text-muted-foreground hover:text-foreground"
              >
                Annuler
              </button>
              <button
                onClick={handleAddSlot}
                disabled={createSlot.isPending}
                className="h-8 px-4 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {createSlot.isPending ? "..." : "Confirmer"}
              </button>
            </div>
          </div>
        )}

        {/* Slots list by day */}
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Aucun creneau configure. Ajoutez vos disponibilites pour que les clients puissent reserver.
          </p>
        ) : (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => {
              const daySlots = slotsByDay.get(day);
              if (!daySlots || daySlots.length === 0) return null;
              return (
                <div key={day} className="bg-surface border border-border rounded-xl p-3">
                  <span className="text-xs font-semibold text-foreground">{DAY_LABELS[day]}</span>
                  <div className="mt-2 space-y-1.5">
                    {daySlots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between">
                        <span className={cn("text-sm font-mono", !slot.is_active && "text-muted-foreground line-through")}>
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({slot.slot_duration_minutes} min)
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleSlot.mutate({ id: slot.id, is_active: !slot.is_active })}
                            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                            title={slot.is_active ? "Desactiver" : "Activer"}
                          >
                            {slot.is_active ? (
                              <ToggleRight className="w-5 h-5 text-primary" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => deleteSlot.mutate(slot.id)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Blocked dates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Indisponibilites
          </h3>
          <button
            onClick={() => setShowAddBlock(!showAddBlock)}
            className="h-8 px-3 rounded-lg bg-surface border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Bloquer un jour
          </button>
        </div>

        {showAddBlock && (
          <div className="bg-muted/30 rounded-xl p-4 mb-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Date</label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Raison (optionnel)</label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Vacances, Formation..."
                className="w-full h-9 px-3 bg-surface border border-border rounded-lg text-sm placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddBlock(false)}
                className="h-8 px-3 rounded-lg text-xs text-muted-foreground"
              >
                Annuler
              </button>
              <button
                onClick={handleAddBlock}
                disabled={!blockDate || addOverride.isPending}
                className="h-8 px-4 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-50"
              >
                Bloquer
              </button>
            </div>
          </div>
        )}

        {overrides.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aucune indisponibilite planifiee</p>
        ) : (
          <div className="space-y-1.5">
            {overrides.map((o) => (
              <div key={o.id} className="flex items-center justify-between bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm font-mono text-foreground">
                    {new Date(o.override_date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  {o.reason && (
                    <span className="text-xs text-muted-foreground ml-2">{o.reason}</span>
                  )}
                </div>
                <button
                  onClick={() => removeOverride.mutate(o.id)}
                  className="p-1 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
