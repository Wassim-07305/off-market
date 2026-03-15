"use client";

import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Trophy,
  Flame,
  Star,
  Target,
  type LucideIcon,
} from "lucide-react";

interface ProgressItem {
  label: string;
  current: number;
  target: number;
  icon: LucideIcon;
  color: string;
  unit?: string;
}

interface ProgressWidgetProps {
  title?: string;
  items: ProgressItem[];
  className?: string;
  isLoading?: boolean;
}

export function ProgressWidget({
  title = "Ma progression",
  items,
  className,
  isLoading,
}: ProgressWidgetProps) {
  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-5">
        <Target className="w-4 h-4 text-muted-foreground" />
        {title}
      </h3>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 animate-shimmer rounded-lg" />
              <div className="h-2 w-full animate-shimmer rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = item.icon;
            const percent =
              item.target > 0
                ? Math.min(Math.round((item.current / item.target) * 100), 100)
                : 0;

            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-3.5 h-3.5", item.color)} />
                    <span className="text-[12px] font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {item.current}
                    {item.unit ?? ""} / {item.target}
                    {item.unit ?? ""}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      percent >= 100
                        ? "bg-emerald-500"
                        : percent >= 50
                          ? "bg-primary"
                          : "bg-amber-400",
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Preset: Client Gamification Summary ────
interface GamificationSummaryProps {
  totalXp: number;
  rank: number;
  badges: number;
  streak: number;
  className?: string;
}

export function GamificationSummary({
  totalXp,
  rank,
  badges,
  streak,
  className,
}: GamificationSummaryProps) {
  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-5">
        <Trophy className="w-4 h-4 text-amber-500" />
        Gamification
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <GamificationStat
          icon={Star}
          label="XP total"
          value={totalXp.toLocaleString("fr-FR")}
          color="text-amber-500"
          bgColor="bg-amber-500/10"
        />
        <GamificationStat
          icon={Trophy}
          label="Classement"
          value={rank > 0 ? `#${rank}` : "-"}
          color="text-violet-500"
          bgColor="bg-violet-500/10"
        />
        <GamificationStat
          icon={Star}
          label="Badges"
          value={String(badges)}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <GamificationStat
          icon={Flame}
          label="Streak"
          value={`${streak}j`}
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
      </div>
    </div>
  );
}

function GamificationStat({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-muted/30">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          bgColor,
        )}
      >
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
