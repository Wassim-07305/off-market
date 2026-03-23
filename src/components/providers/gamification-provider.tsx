"use client";

import { useBadgeCheck } from "@/hooks/use-badge-check";

/**
 * Active le systeme de gamification :
 * - Evaluation automatique des badges toutes les 5 minutes
 * - Toast quand un nouveau badge est debloque
 */
export function GamificationProvider() {
  useBadgeCheck();
  return null;
}
