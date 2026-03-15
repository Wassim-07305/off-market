"use client";

import { cn, formatDate } from "@/lib/utils";
import { Trophy, Sparkles } from "lucide-react";

interface CommunityWin {
  full_name: string;
  action: string;
  created_at: string;
}

interface CommunityWinsProps {
  wins: CommunityWin[];
  className?: string;
  isLoading?: boolean;
}

export function CommunityWins({
  wins,
  className,
  isLoading,
}: CommunityWinsProps) {
  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        Dernieres victoires
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-40 animate-shimmer rounded-lg" />
                <div className="h-2.5 w-16 animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : wins.length === 0 ? (
        <div className="py-8 text-center">
          <Trophy className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Aucune victoire recente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {wins.map((win, i) => (
            <div
              key={`${win.full_name}-${i}`}
              className="flex items-start gap-3 group"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-foreground">
                  <span className="font-medium">{win.full_name}</span>{" "}
                  <span className="text-muted-foreground">{win.action}</span>
                </p>
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                  {formatDate(win.created_at, "relative")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
