"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to track time spent on a lesson.
 * Starts a timer on mount, saves elapsed seconds to lesson_progress.time_spent
 * when the user navigates away or the component unmounts.
 */
export function useLessonTimer(lessonId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const startTimeRef = useRef<number>(Date.now());
  const savedRef = useRef(false);

  const saveTimeSpent = useCallback(async () => {
    if (!lessonId || !user || savedRef.current) return;
    savedRef.current = true;

    const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    if (elapsedSeconds < 3) return; // ignore very short visits

    try {
      // Get current time_spent
      const { data: existing } = await supabase
        .from("lesson_progress")
        .select("time_spent")
        .eq("lesson_id", lessonId)
        .eq("student_id", user.id)
        .maybeSingle();

      const currentTime = (existing as any)?.time_spent ?? 0;
      const newTime = currentTime + elapsedSeconds;

      await supabase.from("lesson_progress").upsert(
        {
          student_id: user.id,
          lesson_id: lessonId,
          time_spent: newTime,
          last_accessed_at: new Date().toISOString(),
        } as never,
        { onConflict: "lesson_id,student_id" },
      );

      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-time"] });
    } catch {
      // Silently fail - tracking is non-critical
    }
  }, [lessonId, user, supabase, queryClient]);

  useEffect(() => {
    if (!lessonId || !user) return;

    // Reset timer on mount
    startTimeRef.current = Date.now();
    savedRef.current = false;

    // Save on beforeunload (tab close / navigation)
    const handleBeforeUnload = () => {
      if (!savedRef.current && lessonId && user) {
        const elapsedSeconds = Math.round(
          (Date.now() - startTimeRef.current) / 1000,
        );
        if (elapsedSeconds < 3) return;

        // Use sendBeacon for reliable save on page unload
        const payload = JSON.stringify({
          lesson_id: lessonId,
          student_id: user.id,
          elapsed_seconds: elapsedSeconds,
        });
        navigator.sendBeacon?.(
          "/api/lessons/track-time",
          new Blob([payload], { type: "application/json" }),
        );
        savedRef.current = true;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Save on unmount (SPA navigation)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveTimeSpent();
    };
  }, [lessonId, user, saveTimeSpent]);

  return {
    /** Get elapsed seconds since entering the lesson */
    getElapsed: () => Math.round((Date.now() - startTimeRef.current) / 1000),
  };
}

/**
 * Format seconds into a human-readable string (e.g. "12 min", "1h 30min")
 */
export function formatTimeSpent(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMin = minutes % 60;
  if (remainingMin === 0) return `${hours}h`;
  return `${hours}h ${remainingMin}min`;
}
