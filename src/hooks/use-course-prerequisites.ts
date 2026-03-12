"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useLessonProgress, useCourses } from "./use-courses";
import { useMemo } from "react";
import type { Course, Module, Lesson } from "@/types/database";

// ─── Types ─────────────────────────────────────────────────────

interface CoursePrerequisite {
  id: string;
  course_id: string;
  prerequisite_course_id: string;
  created_at: string;
}

interface PrerequisiteWithCourse extends CoursePrerequisite {
  prerequisite: { id: string; title: string; cover_image_url: string | null } | null;
}

// ─── Fetch prerequisites for a course ──────────────────────────

export function useCoursePrerequisites(courseId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["course-prerequisites", courseId],
    enabled: !!courseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_prerequisites" as never)
        .select("*, prerequisite:courses!course_prerequisites_prerequisite_course_id_fkey(id, title, cover_image_url)")
        .eq("course_id", courseId!);
      if (error) throw error;
      return data as unknown as PrerequisiteWithCourse[];
    },
  });
}

// ─── Fetch all prerequisites (for checking completion) ─────────

export function useAllCoursePrerequisites() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["course-prerequisites-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_prerequisites" as never)
        .select("course_id, prerequisite_course_id");
      if (error) throw error;
      return data as { course_id: string; prerequisite_course_id: string }[];
    },
  });
}

// ─── Check which courses are unlocked for current user ─────────

export function useCourseUnlockStatus() {
  const { data: allPrereqs } = useAllCoursePrerequisites();
  const { data: progress } = useLessonProgress();
  const { data: courses } = useCourses("published");

  // Build set of completed course IDs
  const completedCourseIds = useMemo(() => {
    if (!courses || !progress) return new Set<string>();

    const completedLessonIds = new Set(
      progress.filter((p) => p.status === "completed").map((p) => p.lesson_id)
    );

    const completed = new Set<string>();
    for (const course of courses) {
      const allLessons = (course as Course & { modules: (Module & { lessons: Lesson[] })[] })
        .modules?.flatMap((m) => m.lessons ?? []) ?? [];
      if (allLessons.length > 0 && allLessons.every((l) => completedLessonIds.has(l.id))) {
        completed.add(course.id);
      }
    }
    return completed;
  }, [courses, progress]);

  // Build map: courseId -> { isUnlocked, missingPrereqs }
  const unlockMap = useMemo(() => {
    const map = new Map<string, { isUnlocked: boolean; missingPrereqs: string[] }>();

    if (!allPrereqs || !courses) return map;

    // Group prerequisites by course
    const prereqsByCourse = new Map<string, string[]>();
    for (const p of allPrereqs) {
      if (!prereqsByCourse.has(p.course_id)) prereqsByCourse.set(p.course_id, []);
      prereqsByCourse.get(p.course_id)!.push(p.prerequisite_course_id);
    }

    for (const course of courses) {
      const prereqs = prereqsByCourse.get(course.id) ?? [];
      if (prereqs.length === 0) {
        map.set(course.id, { isUnlocked: true, missingPrereqs: [] });
      } else {
        const missing = prereqs.filter((pid) => !completedCourseIds.has(pid));
        map.set(course.id, { isUnlocked: missing.length === 0, missingPrereqs: missing });
      }
    }

    return map;
  }, [allPrereqs, courses, completedCourseIds]);

  // Helper to get course title by ID
  const getCourseTitle = useMemo(() => {
    const titleMap = new Map<string, string>();
    for (const c of courses ?? []) {
      titleMap.set(c.id, c.title);
    }
    return (id: string) => titleMap.get(id) ?? "Formation";
  }, [courses]);

  return { unlockMap, completedCourseIds, getCourseTitle };
}

// ─── Mutations (admin/coach) ───────────────────────────────────

export function usePrerequisiteMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["course-prerequisites"] });
    queryClient.invalidateQueries({ queryKey: ["course-prerequisites-all"] });
  };

  const addPrerequisite = useMutation({
    mutationFn: async ({ courseId, prerequisiteCourseId }: { courseId: string; prerequisiteCourseId: string }) => {
      const { error } = await supabase
        .from("course_prerequisites" as never)
        .insert({ course_id: courseId, prerequisite_course_id: prerequisiteCourseId } as never);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removePrerequisite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("course_prerequisites" as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { addPrerequisite, removePrerequisite };
}
