"use client";

import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useMyRedemptions } from "@/hooks/use-rewards";
import {
  REWARD_TYPE_CONFIG,
  REDEMPTION_STATUS_CONFIG,
} from "@/types/gamification";
import type { RewardType, RedemptionStatus } from "@/types/gamification";
import { Clock, CheckCircle, XCircle, Coins, History } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_ICONS: Record<RedemptionStatus, React.ElementType> = {
  pending: Clock,
  fulfilled: CheckCircle,
  cancelled: XCircle,
};

export function RedemptionHistory() {
  const { redemptions, isLoading } = useMyRedemptions();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-12 text-center">
        <History className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Aucun echange effectue pour le moment
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Echange tes XP contre des récompenses dans le catalogue
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      transition={defaultTransition}
      className="bg-surface border border-border rounded-xl divide-y divide-border"
    >
      {redemptions.map((redemption) => {
        const reward = redemption.reward;
        const status = redemption.status as RedemptionStatus;
        const statusConfig = REDEMPTION_STATUS_CONFIG[status];
        const StatusIcon = STATUS_ICONS[status];
        const typeConfig = reward
          ? REWARD_TYPE_CONFIG[reward.type as RewardType]
          : null;

        return (
          <div
            key={redemption.id}
            className="flex items-center gap-3 px-4 py-3"
          >
            {/* Status icon */}
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                statusConfig.bg,
              )}
            >
              <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {reward?.title ?? "Récompense supprimee"}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {typeConfig && (
                  <span
                    className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      typeConfig.color,
                      typeConfig.bg,
                    )}
                  >
                    {typeConfig.label}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                    statusConfig.color,
                    statusConfig.bg,
                  )}
                >
                  {statusConfig.label}
                </span>
              </div>
            </div>

            {/* XP cost + date */}
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <Coins className="w-3 h-3 text-amber-500" />
                <span className="text-sm font-semibold text-foreground font-serif">
                  -{redemption.xp_spent}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {new Date(redemption.redeemed_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
