"use client";

import { cn } from "@/lib/utils";
import { formatResetTime } from "@/lib/rate-limiter";
import { Tooltip } from "@/components/ui/tooltip";
import { Shield } from "lucide-react";

interface RateLimitBadgeProps {
  remaining: number;
  limit: number;
  resetAt: string;
  isLimited: boolean;
  className?: string;
}

export function RateLimitBadge({
  remaining,
  limit,
  resetAt,
  isLimited,
  className,
}: RateLimitBadgeProps) {
  // Don't show if no real limit info
  if (limit >= 999) return null;

  const percentage = limit > 0 ? remaining / limit : 0;

  const colorClasses = isLimited
    ? "bg-red-500/10 text-red-600 border-red-500/20"
    : percentage > 0.5
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      : percentage > 0.2
        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
        : "bg-red-500/10 text-red-600 border-red-500/20";

  const tooltipContent = isLimited
    ? `Limite atteinte. Reinitialisation a ${formatResetTime(resetAt)}`
    : `${remaining} restants sur ${limit}. Reinitialisation a ${formatResetTime(resetAt)}`;

  return (
    <Tooltip content={tooltipContent} side="bottom">
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors",
          colorClasses,
          isLimited && "animate-pulse",
          className,
        )}
      >
        <Shield className="w-3 h-3" />
        {remaining}/{limit}
      </span>
    </Tooltip>
  );
}
