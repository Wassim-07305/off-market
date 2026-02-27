"use client";

import { cn } from "@/lib/utils";
import { CALL_TYPE_COLORS, type CallType } from "@/types/calls";

interface CallTypeBadgeProps {
  type: CallType;
  className?: string;
}

export function CallTypeBadge({ type, className }: CallTypeBadgeProps) {
  const labels: Record<CallType, string> = {
    manuel: "Manuel",
    iclosed: "iClosed",
    calendly: "Calendly",
    booking: "Booking",
    autre: "Autre",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
        CALL_TYPE_COLORS[type],
        className
      )}
    >
      {type === "iclosed" && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      {labels[type]}
    </span>
  );
}
