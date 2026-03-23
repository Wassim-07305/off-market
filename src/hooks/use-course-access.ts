"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────

interface PrerequisiteStatus {
  course: string;
  courseId: string;
  required: number;
  current: number;
}

interface CourseAccessResult {
  canAccess: boolean;
  lockedReason?: string;
  prerequisites: PrerequisiteStatus[];
  isLoading: boolean;
}

// ─── Hook ──────────────────────────────────────────────────────

export function useCourseAccess(courseId: string | null): CourseAccessResult {
  const supabase = useSupabase();
  const { user } = useAuth();

  // Fetch prerequisites for this course
  const { data: prerequisites, isLoading: loadingPrereqs } = useQuery({
    queryKey: ["course-access-prereqs", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("course_prerequisites")
        .select(
          "id, course_id, prerequisite_course_id, min_progress, prerequisite:courses!course_prerequisites_prerequisite_course_id_fkey(id, title, modules(id, lessons(id)))",
        )
        .eq("course_id", courseId!);
      if (error) throw error;
      return data as {
        id: string;
        course_id: string;
        prerequisite_course_id: string;
        min_progress: number | null;
        prerequisite: {
          id: string;
          title: string;
          modules: { id: string; lessons: { id: string }[] }[];
        } | null;
      }[];
    },
  });

  // Fetch user's lesson progress
  const { data: progress, isLoading: loadingProgress } = useQuery({
    queryKey: ["lesson-progress", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status")
        .eq("student_id", user!.id);
      if (error) throw error;
      return data as { lesson_id: string; status: string }[];
    },
  });

  const result = useMemo(() => {
    if (!courseId || loadingPrereqs || loadingProgress) {
      return {
        canAccess: true,
        prerequisites: [],
        isLoading: true,
      };
    }

    if (!prerequisites || prerequisites.length === 0) {
      return {
        canAccess: true,
        prerequisites: [],
        isLoading: false,
      };
    }

    const completedLessonIds = new Set(
      (progress ?? [])
        .filter((p) => p.status === "completed")
        .map((p) => p.lesson_id),
    );

    const prereqStatuses: PrerequisiteStatus[] = prerequisites.map((prereq) => {
      const course = prereq.prerequisite;
      const courseName = course?.title ?? "Formation";
      const courseId = prereq.prerequisite_course_id;

      // Count total and completed lessons for the prerequisite course
      const allLessons = course?.modules?.flatMap((m) => m.lessons ?? []) ?? [];
      const totalLessons = allLessons.length;
      const completedLessons =
        totalLessons > 0
          ? allLessons.filter((l) => completedLessonIds.has(l.id)).length
          : 0;

      const currentProgress =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      // min_progress defaults to 100 if not set (full completion required)
      const requiredProgress = prereq.min_progress ?? 100;

      return {
        course: courseName,
        courseId,
        required: requiredProgress,
        current: currentProgress,
      };
    });

    const canAccess = prereqStatuses.every((p) => p.current >= p.required);

    const failedPrereqs = prereqStatuses.filter((p) => p.current < p.required);
    const lockedReason =
      failedPrereqs.length > 0
        ? failedPrereqs
            .map(
              (p) =>
                `Vous devez terminér le cours ${p.course} (${p.required}% requis, ${p.current}% actuel)`,
            )
            .join(". ")
        : undefined;

    return {
      canAccess,
      lockedReason,
      prerequisites: prereqStatuses,
      isLoading: false,
    };
  }, [courseId, prerequisites, progress, loadingPrereqs, loadingProgress]);

  return result;
}
