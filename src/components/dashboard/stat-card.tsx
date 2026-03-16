"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "bg-white border border-zinc-200 rounded-[14px] p-5 transition-shadow duration-200 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="size-8 rounded-lg bg-primary/5 flex items-center justify-center">
          <Icon className="size-4 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {title}
        </span>
      </div>
      <div className="text-2xl font-semibold text-foreground tracking-tight">
        {value}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-1.5">
          {isPositive ? (
            <TrendingUp className="size-3.5 text-emerald-600" />
          ) : (
            <TrendingDown className="size-3.5 text-red-600" />
          )}
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              isPositive ? "text-emerald-600" : "text-red-600",
            )}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
