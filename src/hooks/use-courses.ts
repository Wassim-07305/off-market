"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Course, Module, Lesson } from "@/types/database";

export function useCourses(status?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["courses", status],
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select("*, modules(*, lessons(*))")
        .order("sort_order", { ascending: true });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Course & { modules: (Module & { lessons: Lesson[] })[] })[];
    },
  });
}

export function useCourse(courseId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, modules(*, lessons(*))")
        .eq("id", courseId)
        .single();
      if (error) throw error;
      return data as Course & { modules: (Module & { lessons: Lesson[] })[] };
    },
    enabled: !!courseId,
  });
}

export function useCourseMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const createCourse = useMutation({
    mutationFn: async (course: { title: string; description?: string; status?: string }) => {
      const { data, error } = await supabase
        .from("courses")
        .insert(course)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Course>) => {
      const { error } = await supabase.from("courses").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const createModule = useMutation({
    mutationFn: async (mod: { course_id: string; title: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from("modules")
        .insert(mod)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  const createLesson = useMutation({
    mutationFn: async (lesson: {
      module_id: string;
      title: string;
      content_type: string;
      content?: Record<string, unknown>;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("lessons")
        .insert(lesson)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
  });

  return { createCourse, updateCourse, createModule, createLesson };
}
