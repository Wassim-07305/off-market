"use client";

import { cn } from "@/lib/utils";
import { CLIENT_FLAG_CONFIG, type ClientFlagValue } from "@/types/roadmap";

interface ClientFlagBadgeProps {
  flag: ClientFlagValue;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  pulse?: boolean;
  className?: string;
}

export function ClientFlagBadge({
  flag,
  size = "md",
  showLabel = false,
  pulse = false,
  className,
}: ClientFlagBadgeProps) {
  const config = CLIENT_FLAG_CONFIG[flag];
  if (!config) return null;

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  if (!showLabel) {
    return (
      <span className={cn("relative inline-flex", className)}>
        <span className={cn("rounded-full", dotSizes[size], config.dotColor)} />
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
