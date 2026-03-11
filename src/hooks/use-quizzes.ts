"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type {
  QuizAttempt,
  ExerciseSubmission,
  SubmissionStatus,
} from "@/types/quiz";

// ─── QUIZ ATTEMPTS ──────────────────────

export function useQuizAttempts(lessonId: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["quiz-attempts", lessonId],
    enabled: !!user && !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("lesson_id", lessonId)
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as QuizAttempt[];
    },
  });
}

export function useSubmitQuiz() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (attempt: {
      lesson_id: string;
      answers: QuizAttempt["answers"];
      score: number;
      total_questions: number;
      correct_answers: number;
      passed: boolean;
      time_spent: number;
    }) => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .insert({ ...attempt, student_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as QuizAttempt;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempts", data.lesson_id],
      });
    },
  });
}

// ─── QUIZ STATS (for coach/admin) ───────

export function useQuizStats(lessonId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["quiz-stats", lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("score, passed, student_id")
        .eq("lesson_id", lessonId);
      if (error) throw error;

      const attempts = data as {
        score: number;
        passed: boolean;
        student_id: string;
      }[];
      const uniqueStudents = new Set(attempts.map((a) => a.student_id)).size;
      const passCount = attempts.filter((a) => a.passed).length;
      const avgScore =
        attempts.length > 0
          ? attempts.reduce((sum, a) => sum + Number(a.score), 0) /
            attempts.length
          : 0;

      return {
        totalAttempts: attempts.length,
        uniqueStudents,
        passRate: attempts.length > 0 ? (passCount / attempts.length) * 100 : 0,
        averageScore: Math.round(avgScore * 10) / 10,
      };
    },
  });
}

// ─── EXERCISE SUBMISSIONS ───────────────

export function useExerciseSubmissions(lessonId: string, studentId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["exercise-submissions", lessonId, studentId],
    enabled: !!user && !!lessonId,
    queryFn: async () => {
      let query = supabase
        .from("exercise_submissions")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false });

      if (studentId) {
        query = query.eq("student_id", studentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ExerciseSubmission[];
    },
  });
}

export function useSubmitExercise() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (submission: {
      lesson_id: string;
      content: string;
      attachments?: { name: string; url: string }[];
    }) => {
      const { data, error } = await supabase
        .from("exercise_submissions")
        .insert({
          ...submission,
          student_id: user!.id,
          status: "submitted",
          attachments: submission.attachments ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      return data as ExerciseSubmission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-submissions", data.lesson_id],
      });
    },
  });
}

export function useReviewExercise() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (review: {
      id: string;
      lesson_id: string;
      status: SubmissionStatus;
      coach_feedback?: string;
      grade?: number;
    }) => {
      const { error } = await supabase
        .from("exercise_submissions")
        .update({
          status: review.status,
          coach_feedback: review.coach_feedback ?? null,
          grade: review.grade ?? null,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", review.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-submissions", variables.lesson_id],
      });
    },
  });
}
