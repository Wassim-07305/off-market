"use client";

import { cn } from "@/lib/utils";
import { PERIOD_PRESETS, type PeriodPreset } from "@/types/analytics";

interface PeriodSelectorProps {
  value: PeriodPreset;
  onChange: (period: PeriodPreset) => void;
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-xl p-1 bg-muted/50">
      {PERIOD_PRESETS.map((preset) => (
        <button
          key={preset.value}
          onClick={() => onChange(preset.value)}
          className={cn(
            "h-7 px-3 rounded-lg text-xs font-medium transition-all duration-200",
            value === preset.value
              ? "bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
