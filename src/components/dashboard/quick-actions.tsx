"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  bgColor?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  className?: string;
}

export function QuickActions({
  actions,
  title = "Actions rapides",
  className,
}: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground mb-4">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                  action.bgColor ?? "bg-primary/10",
                )}
              >
                <Icon
                  className={cn("w-4 h-4", action.color ?? "text-primary")}
                />
              </div>
              <span className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
