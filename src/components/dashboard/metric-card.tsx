"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-md p-3 hover:border-border-hover hover:-translate-y-px transition-all duration-150",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-lg font-bold text-foreground mt-0.5">{value}</p>
        </div>
        {Icon && <Icon className="size-4 text-muted-foreground shrink-0" />}
      </div>
    </div>
  );
}
