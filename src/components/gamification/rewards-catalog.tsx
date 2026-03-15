"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useRewards, useRedeemReward, useXpBalance } from "@/hooks/use-rewards";
import { REWARD_TYPE_CONFIG } from "@/types/gamification";
import type { Reward, RewardType } from "@/types/gamification";
import {
  Gift,
  Coins,
  Video,
  FolderOpen,
  Award,
  Sparkles,
  Loader2,
  Package,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<RewardType, React.ElementType> = {
  session_bonus: Video,
  resource_unlock: FolderOpen,
  badge_exclusive: Award,
  custom: Sparkles,
};

const TYPE_FILTERS: { value: RewardType | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "session_bonus", label: "Sessions" },
  { value: "resource_unlock", label: "Ressources" },
  { value: "badge_exclusive", label: "Badges" },
  { value: "custom", label: "Special" },
];

export function RewardsCatalog() {
  const { rewards, isLoading } = useRewards();
  const { balance, isLoading: balanceLoading } = useXpBalance();
  const redeemReward = useRedeemReward();
  const [typeFilter, setTypeFilter] = useState<RewardType | "all">("all");
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);

  const filtered =
    typeFilter === "all"
      ? rewards
      : rewards.filter((r) => r.type === typeFilter);

  const getStockRemaining = (reward: Reward) => {
    if (reward.stock === null) return null;
    return reward.stock; // Server-side stock tracking via redemption count
  };

  const handleRedeem = (reward: Reward) => {
    setConfirmReward(reward);
  };

  const handleConfirmRedeem = () => {
    if (!confirmReward) return;
    redeemReward.mutate(confirmReward.id, {
      onSuccess: () => setConfirmReward(null),
      onError: () => setConfirmReward(null),
    });
  };

  return (
    <div className="space-y-5">
      {/* XP Balance header */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="bg-surface border border-primary/20 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Coins className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Solde XP disponible
              </p>
              <p className="text-xs text-muted-foreground">
                Echange tes XP contre des recompenses
              </p>
            </div>
          </div>
          <div className="text-right">
            {balanceLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <p className="text-3xl font-semibold text-foreground font-serif">
                  {balance}
                </p>
                <p className="text-xs text-muted-foreground">XP</p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Type filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-all shrink-0",
              typeFilter === f.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Gift className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucune recompense disponible pour le moment
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((reward) => {
            const typeConfig = REWARD_TYPE_CONFIG[reward.type];
            const Icon = TYPE_ICONS[reward.type];
            const stock = getStockRemaining(reward);
            const canAfford = balance >= reward.cost_xp;
            const outOfStock = stock !== null && stock <= 0;

            return (
              <motion.div
                key={reward.id}
                variants={fadeInUp}
                transition={defaultTransition}
                className="bg-surface border border-border rounded-xl p-4 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      typeConfig.bg,
                    )}
                  >
                    <Icon className={cn("w-5 h-5", typeConfig.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground truncate">
                      {reward.title}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        typeConfig.color,
                        typeConfig.bg,
                      )}
                    >
                      {typeConfig.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {reward.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-1">
                    {reward.description}
                  </p>
                )}

                {/* Stock */}
                {stock !== null && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Package className="w-3 h-3 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-xs",
                        outOfStock
                          ? "text-error font-medium"
                          : "text-muted-foreground",
                      )}
                    >
                      {outOfStock
                        ? "Rupture de stock"
                        : `${stock} restant${stock > 1 ? "s" : ""}`}
                    </span>
                  </div>
                )}

                {/* Footer: price + button */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold text-foreground font-serif">
                      {reward.cost_xp} XP
                    </span>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={
                      !canAfford || outOfStock || redeemReward.isPending
                    }
                    className={cn(
                      "h-8 px-3 rounded-lg text-xs font-medium transition-all",
                      canAfford && !outOfStock
                        ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                        : "bg-muted text-muted-foreground cursor-not-allowed",
                    )}
                  >
                    {redeemReward.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Echanger"
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmReward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setConfirmReward(null)}
        >
          <div
            className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Confirmer l&apos;echange
                </h3>
                <p className="text-xs text-muted-foreground">
                  Cette action est irreversible
                </p>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-3">
              <p className="text-sm font-medium text-foreground">
                {confirmReward.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm text-foreground font-serif font-medium">
                  {confirmReward.cost_xp} XP
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Ton solde apres echange :{" "}
              <span className="font-medium text-foreground">
                {balance - confirmReward.cost_xp} XP
              </span>
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmReward(null)}
                className="h-9 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={redeemReward.isPending}
                className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
              >
                {redeemReward.isPending && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
