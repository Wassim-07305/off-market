"use client";

import { cn } from "@/lib/utils";
import type { Challenge, ChallengeType } from "@/types/gamification";
import { CHALLENGE_TYPE_CONFIG } from "@/types/gamification";
import {
  Clock,
  Users,
  Trophy,
  Zap,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

function daysLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Termine";
  if (days === 1) return "1 jour restant";
  return `${days} jours restants`;
}

interface ChallengeCardProps {
  challenge: Challenge;
  progress?: number;
  isJoined?: boolean;
  isCompleted?: boolean;
  participantCount?: number;
  onJoin?: () => void;
  onViewDetails?: () => void;
  isJoining?: boolean;
  className?: string;
}

export function ChallengeCard({
  challenge,
  progress = 0,
  isJoined = false,
  isCompleted = false,
  participantCount,
  onJoin,
  onViewDetails,
  isJoining = false,
  className,
}: ChallengeCardProps) {
  const typeConfig =
    CHALLENGE_TYPE_CONFIG[challenge.challenge_type as ChallengeType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface border rounded-2xl overflow-hidden transition-all hover:shadow-md",
        isCompleted
          ? "border-emerald-500/20 opacity-75"
          : isJoined
            ? "border-primary/20"
            : "border-border hover:border-border/80",
        className,
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Type color bar */}
      <div
        className={cn(
          "h-1",
          challenge.challenge_type === "weekly"
            ? "bg-gradient-to-r from-blue-400 to-blue-600"
            : challenge.challenge_type === "monthly"
              ? "bg-gradient-to-r from-purple-400 to-purple-600"
              : "bg-gradient-to-r from-amber-400 to-amber-600",
        )}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeConfig.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {challenge.title}
              </h3>
              {challenge.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {challenge.description}
                </p>
              )}
            </div>
          </div>
          {isCompleted && (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              typeConfig.color,
            )}
          >
            {typeConfig.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {daysLeft(challenge.ends_at)}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="w-3 h-3 text-amber-500" />+{challenge.xp_reward} XP
          </span>
          {participantCount !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {participantCount} participant{participantCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Progress bar (only if joined) */}
        {isJoined && !isCompleted && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">
                Progression
              </span>
              <span className="text-xs font-semibold text-foreground tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isJoined && !isCompleted && onJoin && (
            <Button
              size="sm"
              onClick={onJoin}
              loading={isJoining}
              icon={<Trophy className="w-3.5 h-3.5" />}
            >
              Participer
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              iconRight={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Details
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
