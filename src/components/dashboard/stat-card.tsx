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
        "bg-surface border border-border rounded-xl p-6 transition-all duration-150 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-muted-foreground font-medium">
          {title}
        </span>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
      </div>
      <div
        className="text-3xl font-semibold text-foreground mb-1 font-bold"
      >
        {value}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-error" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              isPositive ? "text-success" : "text-error"
            )}
          >
            {isPositive ? "+" : ""}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-xs text-muted-foreground">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
