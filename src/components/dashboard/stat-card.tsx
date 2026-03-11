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
        "bg-surface rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px] group",
        className,
      )}
      style={{
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-card)";
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-[13px] text-muted-foreground font-medium">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
      </div>
      <div className="text-3xl font-display font-bold text-foreground tracking-tight">
        {value}
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          {isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-error" />
          )}
          <span
            className={cn(
              "text-xs font-mono font-medium",
              isPositive ? "text-success" : "text-error",
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
