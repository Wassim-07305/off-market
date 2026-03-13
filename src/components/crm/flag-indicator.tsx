"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { STUDENT_FLAGS } from "@/lib/constants";
import type { StudentFlag } from "@/types/database";
import { Flag, X } from "lucide-react";

// ─── Flag Dot ────────────────────────────────────────────────
// Small colored circle showing current flag status
interface FlagDotProps {
  flag: StudentFlag;
  size?: "sm" | "md" | "lg";
  className?: string;
  pulse?: boolean;
}

export function FlagDot({
  flag,
  size = "md",
  className,
  pulse = false,
}: FlagDotProps) {
  const config = STUDENT_FLAGS.find((f) => f.value === flag);
  if (!config) return null;

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        className={cn("rounded-full", sizeClasses[size], config.dotColor)}
      />
      {pulse && flag !== "green" && (
        <span
          className={cn(
            "absolute inset-0 rounded-full animate-ping opacity-40",
            config.dotColor,
          )}
        />
      )}
    </span>
  );
}

// ─── Flag Badge ──────────────────────────────────────────────
// Larger badge with label
interface FlagBadgeProps {
  flag: StudentFlag;
  className?: string;
}

export function FlagBadge({ flag, className }: FlagBadgeProps) {
  const config = STUDENT_FLAGS.find((f) => f.value === flag);
  if (!config) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-medium border",
        config.bgColor,
        config.textColor,
        config.borderColor,
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}

// ─── Flag Selector ───────────────────────────────────────────
// Dropdown to pick a flag with optional reason
interface FlagSelectorProps {
  currentFlag: StudentFlag;
  onSelect: (flag: StudentFlag, reason?: string) => void;
  isPending?: boolean;
  className?: string;
}

export function FlagSelector({
  currentFlag,
  onSelect,
  isPending = false,
  className,
}: FlagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<StudentFlag | null>(null);
  const [reason, setReason] = useState("");

  const handleSelect = (flag: StudentFlag) => {
    if (flag === currentFlag) {
      setOpen(false);
      return;
    }
    setSelectedFlag(flag);
  };

  const handleConfirm = () => {
    if (!selectedFlag) return;
    onSelect(selectedFlag, reason || undefined);
    setOpen(false);
    setSelectedFlag(null);
    setReason("");
  };

  const handleCancel = () => {
    setSelectedFlag(null);
    setReason("");
    setOpen(false);
  };

  const currentConfig = STUDENT_FLAGS.find((f) => f.value === currentFlag);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={cn(
          "h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5",
          "hover:shadow-sm disabled:opacity-50",
          currentConfig?.bgColor,
          currentConfig?.textColor,
          currentConfig?.borderColor,
        )}
      >
        <Flag className="w-3 h-3" />
        {currentConfig?.label ?? "Drapeau"}
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 bg-surface border border-border rounded-xl shadow-lg z-50 w-72 overflow-hidden">
          {!selectedFlag ? (
            <div className="py-1">
              {STUDENT_FLAGS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => handleSelect(f.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left",
                    f.value === currentFlag && "bg-muted/50",
                  )}
                >
                  <span
                    className={cn("w-3 h-3 rounded-full shrink-0", f.dotColor)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{f.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                  {f.value === currentFlag && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      Actuel
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span
                    className={cn(
                      "w-3 h-3 rounded-full",
                      STUDENT_FLAGS.find((f) => f.value === selectedFlag)
                        ?.dotColor,
                    )}
                  />
                  Changer en{" "}
                  {STUDENT_FLAGS.find((f) => f.value === selectedFlag)?.label}
                </p>
                <button
                  onClick={handleCancel}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Raison du changement (optionnel)..."
                rows={2}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 h-8 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 h-8 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
