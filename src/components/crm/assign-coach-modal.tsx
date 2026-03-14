"use client";

import { useState } from "react";
import { X, UserCheck, Loader2, Users, Zap } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import {
  useCoaches,
  useCoachAssignments,
  useAssignClient,
  useAutoAssignCoach,
} from "@/hooks/use-coach-assignments";

interface AssignCoachModalProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

export function AssignCoachModal({
  open,
  onClose,
  clientId,
  clientName,
}: AssignCoachModalProps) {
  const [selectedCoachId, setSelectedCoachId] = useState<string | null>(null);
  const { data: coaches, isLoading: coachesLoading } = useCoaches();
  const { data: assignments } = useCoachAssignments();
  const assignClient = useAssignClient();
  const autoAssign = useAutoAssignCoach();

  if (!open) return null;

  // Count active clients per coach
  const loadPerCoach = new Map<string, number>();
  for (const a of assignments ?? []) {
    loadPerCoach.set(a.coach_id, (loadPerCoach.get(a.coach_id) ?? 0) + 1);
  }

  const handleAssign = async () => {
    if (!selectedCoachId) return;
    await assignClient.mutateAsync({ clientId, coachId: selectedCoachId });
    onClose();
  };

  const handleAutoAssign = async () => {
    await autoAssign.mutateAsync({ clientId });
    onClose();
  };

  const isLoading = assignClient.isPending || autoAssign.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Assigner un coach</h3>
              <p className="text-xs text-muted-foreground">{clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-assign button */}
        <button
          onClick={handleAutoAssign}
          disabled={isLoading}
          className="w-full mb-4 h-10 rounded-xl border-2 border-dashed border-primary/30 text-sm font-medium text-primary hover:bg-primary/5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {autoAssign.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Assignation automatique (equilibrage de charge)
        </button>

        <div className="text-xs text-muted-foreground text-center mb-4">ou choisir manuellement</div>

        {/* Coach list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {coachesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            (coaches ?? []).map((coach) => {
              const load = loadPerCoach.get(coach.id) ?? 0;
              const isSelected = selectedCoachId === coach.id;

              return (
                <button
                  key={coach.id}
                  onClick={() => setSelectedCoachId(coach.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left",
                    isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-muted/30",
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                    {coach.avatar_url ? (
                      <img
                        src={coach.avatar_url}
                        alt={coach.full_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(coach.full_name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {coach.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {coach.role === "admin" ? "Admin" : "Coach"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{load}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedCoachId || isLoading}
            className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {assignClient.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}
