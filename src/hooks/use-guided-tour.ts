"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { getTourStepsForRole, type TourStep } from "@/lib/tour-steps";
import type { RoleVariant } from "@/lib/navigation";

const TOUR_STORAGE_KEY = "off-market-tour-completed";

function getStorageKey(userId: string): string {
  return `${TOUR_STORAGE_KEY}-${userId}`;
}

export function useGuidedTour(variant: RoleVariant) {
  const { user, profile } = useAuth();
  const supabase = useSupabase();

  const steps = getTourStepsForRole(variant);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasCheckedAutoStart, setHasCheckedAutoStart] = useState(false);

  const currentStep: TourStep | null = isActive ? (steps[currentStepIndex] ?? null) : null;
  const totalSteps = steps.length;

  // Check if tour was already completed (localStorage + profile flag)
  const isTourCompleted = useCallback((): boolean => {
    if (!user) return true;
    // Check localStorage first (fast)
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(getStorageKey(user.id));
      if (stored === "true") return true;
    }
    // Check profile flag
    if (profile?.onboarding_completed) return true;
    return false;
  }, [user, profile]);

  // Mark tour as completed
  const markCompleted = useCallback(async () => {
    if (!user) return;
    // localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(getStorageKey(user.id), "true");
    }
    // Update profile in Supabase (best-effort)
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true } as never)
        .eq("id", user.id);
    } catch {
      // Non-critical
    }
  }, [user, supabase]);

  // Auto-start for new users
  useEffect(() => {
    if (hasCheckedAutoStart) return;
    if (!user || !profile) return;

    setHasCheckedAutoStart(true);

    // Small delay to let the DOM render navigation elements
    const timer = setTimeout(() => {
      if (!isTourCompleted()) {
        setIsActive(true);
        setCurrentStepIndex(0);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [user, profile, hasCheckedAutoStart, isTourCompleted]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((i) => i + 1);
    } else {
      // Tour finished
      setIsActive(false);
      markCompleted();
    }
  }, [currentStepIndex, totalSteps, markCompleted]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    markCompleted();
  }, [markCompleted]);

  return {
    isActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    steps,
  };
}
