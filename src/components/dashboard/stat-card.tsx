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
  gradient?: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  className,
  gradient,
  iconBg,
  iconColor,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-zinc-200/80 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        gradient ?? "bg-surface",
        className,
      )}
    >
      {/* Subtle shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/60 via-transparent to-transparent" />

      <div className="relative flex items-start justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-semibold">
          {title}
        </span>
        <div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
            iconBg ?? "bg-primary/8",
          )}
        >
          <Icon className={cn("size-[18px]", iconColor ?? "text-primary")} />
        </div>
      </div>

      <div className="relative text-[28px] font-bold text-foreground tracking-tight leading-none">
        {value}
      </div>

      {change !== undefined && (
        <div className="relative flex items-center gap-1.5 mt-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            )}
          >
            {isPositive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            )}
            {isPositive ? "+" : ""}
            {change}%
          </span>
          {changeLabel && (
            <span className="text-[11px] text-muted-foreground/70">
              {changeLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
