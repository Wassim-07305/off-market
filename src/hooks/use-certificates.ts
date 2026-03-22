"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Certificate } from "@/types/database";

export function useCertificates(studentId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const effectiveId = studentId ?? user?.id;

  return useQuery({
    queryKey: ["certificates", effectiveId],
    enabled: !!effectiveId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", effectiveId!)
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data as Certificate[];
    },
  });
}

export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      courseId,
      courseTitle,
      studentName,
      totalLessons,
      totalModules,
      quizAverage,
    }: {
      studentId: string;
      courseId: string;
      courseTitle: string;
      studentName: string;
      totalLessons: number;
      totalModules: number;
      quizAverage?: number | null;
    }) => {
      const res = await fetch("/api/certificates/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          courseId,
          courseTitle,
          studentName,
          totalLessons,
          totalModules,
          quizAverage: quizAverage ?? null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Erreur ${res.status}`);
      }
      return (await res.json()) as Certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["xp"] });
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
      queryClient.invalidateQueries({ queryKey: ["my-rank"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

/** Hook to compute course-level progress for the current user */
export function useCourseProgress(courseId: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["course-progress", courseId, user?.id],
    enabled: !!user && !!courseId,
    queryFn: async () => {
      // Get all lessons for this course
      const { data: modules, error: modErr } = await supabase
        .from("modules")
        .select("id, lessons(id)")
        .eq("course_id", courseId);
      if (modErr) throw modErr;

      const allLessonIds = (modules ?? []).flatMap(
        (m: { lessons: { id: string }[] }) => m.lessons.map((l) => l.id),
      );
      const totalLessons = allLessonIds.length;

      if (totalLessons === 0) {
        return {
          totalLessons: 0,
          completedLessons: 0,
          percent: 0,
          isComplete: false,
        };
      }

      // Get completed lessons
      const { data: progress, error: progErr } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("student_id", user!.id)
        .eq("status", "completed")
        .in("lesson_id", allLessonIds);
      if (progErr) throw progErr;

      const completedLessons = progress?.length ?? 0;
      const percent = Math.round((completedLessons / totalLessons) * 100);

      return {
        totalLessons,
        completedLessons,
        percent,
        isComplete: completedLessons >= totalLessons,
      };
    },
  });
}

/** Get quiz average for a student across all quiz lessons in a course */
export function useCourseQuizAverage(courseId: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["course-quiz-avg", courseId, user?.id],
    enabled: !!user && !!courseId,
    queryFn: async () => {
      // Get quiz lesson IDs for this course
      const { data: modules, error: modErr } = await supabase
        .from("modules")
        .select("lessons(id, content_type)")
        .eq("course_id", courseId);
      if (modErr) throw modErr;

      const quizLessonIds = (modules ?? []).flatMap(
        (m: { lessons: { id: string; content_type: string }[] }) =>
          m.lessons.filter((l) => l.content_type === "quiz").map((l) => l.id),
      );

      if (quizLessonIds.length === 0) return null;

      // Get best attempt per quiz
      const { data: attempts, error: attErr } = await (supabase as any)
        .from("quiz_attempts")
        .select("lesson_id, score")
        .eq("student_id", user!.id)
        .in("lesson_id", quizLessonIds);
      if (attErr) throw attErr;

      if (!attempts || attempts.length === 0) return null;

      // Best score per lesson
      const bestByLesson = new Map<string, number>();
      for (const a of attempts) {
        const current = bestByLesson.get(a.lesson_id) ?? 0;
        if (a.score > current) bestByLesson.set(a.lesson_id, a.score);
      }

      const scores = Array.from(bestByLesson.values());
      return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    },
  });
}
