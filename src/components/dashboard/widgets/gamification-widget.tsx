"use client";

import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { Trophy, Flame, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function GamificationWidgetBase() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["gamification-summary", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [xpRes, badgesRes] = await Promise.all([
        supabase
          .from("xp_transactions")
          .select("xp_amount")
          .eq("profile_id", user!.id),
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user!.id),
      ]);

      if (xpRes.error) throw xpRes.error;

      const totalPoints = (xpRes.data ?? []).reduce(
        (sum, e) => sum + (e.xp_amount ?? 0),
        0,
      );
      const badgeCount = badgesRes.count ?? 0;
      const actionCount = xpRes.data?.length ?? 0;

      return { totalPoints, badgeCount, actionCount };
    },
  });

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="h-4 w-32 bg-muted rounded-lg mb-4 animate-shimmer" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: Zap,
      label: "Points XP",
      value: data?.totalPoints ?? 0,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: Trophy,
      label: "Badges",
      value: data?.badgeCount ?? 0,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: Star,
      label: "Actions",
      value: data?.actionCount ?? 0,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <h3 className="text-[13px] font-semibold text-foreground">
          Gamification
        </h3>
      </div>

      {data?.totalPoints === 0 && data?.badgeCount === 0 ? (
        <div className="py-6 text-center">
          <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Aucune donnee de gamification
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                  stat.bgColor,
                )}
              >
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-display font-bold text-foreground tracking-tight">
                  {stat.value.toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const GamificationWidget = memo(GamificationWidgetBase);
