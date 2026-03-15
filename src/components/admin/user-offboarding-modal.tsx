"use client";

import { useState } from "react";
import { X, UserMinus, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserManagement, useCoaches } from "@/hooks/use-user-management";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types/database";

interface UserOffboardingModalProps {
  open: boolean;
  onClose: () => void;
  user: (Profile & { is_archived?: boolean }) | null;
}

export function UserOffboardingModal({
  open,
  onClose,
  user: targetUser,
}: UserOffboardingModalProps) {
  const [reassignCoachId, setReassignCoachId] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const { offboardUser } = useUserManagement();
  const { data: coaches } = useCoaches();

  if (!open || !targetUser) return null;

  const isCoachOrAdmin =
    targetUser.role === "coach" || targetUser.role === "admin";
  const availableCoaches = (coaches ?? []).filter(
    (c) => c.id !== targetUser.id,
  );
  const canSubmit =
    confirmName.toLowerCase() === targetUser.full_name.toLowerCase() &&
    (!isCoachOrAdmin || reassignCoachId);

  const handleSubmit = () => {
    offboardUser.mutate(
      {
        userId: targetUser.id,
        reassignCoachId: reassignCoachId || undefined,
      },
      {
        onSuccess: () => {
          setConfirmName("");
          setReassignCoachId("");
          onClose();
        },
      },
    );
  };

  const handleClose = () => {
    setConfirmName("");
    setReassignCoachId("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-md w-full mx-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Offboarding
              </h3>
              <p className="text-xs text-muted-foreground">
                Archiver et desactiver un utilisateur
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
          {targetUser.avatar_url ? (
            <img
              src={targetUser.avatar_url}
              alt={targetUser.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-semibold">
              {getInitials(targetUser.full_name)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {targetUser.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {targetUser.email} — {targetUser.role}
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-600 dark:text-amber-400">
            <p className="font-medium mb-1">Cette action va :</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Archiver le compte de l&apos;utilisateur</li>
              <li>Desactiver son acces a la plateforme</li>
              {isCoachOrAdmin && (
                <li>Reassigner ses eleves au coach selectionne</li>
              )}
            </ul>
          </div>
        </div>

        {/* Reassign coach */}
        {isCoachOrAdmin && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Reassigner les eleves a *
            </label>
            <select
              value={reassignCoachId}
              onChange={(e) => setReassignCoachId(e.target.value)}
              className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Selectionner un coach</option>
              {availableCoaches.map((coach) => (
                <option key={coach.id} value={coach.id}>
                  {coach.full_name}
                </option>
              ))}
            </select>

            {reassignCoachId && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{targetUser.full_name}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-foreground font-medium">
                  {availableCoaches.find((c) => c.id === reassignCoachId)
                    ?.full_name ?? ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Confirm */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Tapez &laquo; {targetUser.full_name} &raquo; pour confirmer
          </label>
          <input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={targetUser.full_name}
            className={cn(
              "w-full h-10 px-4 bg-muted border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
              confirmName.toLowerCase() === targetUser.full_name.toLowerCase()
                ? "border-emerald-500 focus:ring-emerald-500/30"
                : "border-border focus:ring-primary/30",
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleClose}
            className="flex-1 h-10 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || offboardUser.isPending}
            className="flex-1 h-10 rounded-[10px] bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {offboardUser.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {offboardUser.isPending
              ? "Offboarding..."
              : "Confirmer l'offboarding"}
          </button>
        </div>
      </div>
    </div>
  );
}
