"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Course, Module, Lesson, LessonAttachment } from "@/types/database";

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

export function useCourses(status?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["courses", status],
    enabled: !!user,
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

// ---------------------------------------------------------------------------
// Course mutations
// ---------------------------------------------------------------------------

export function useCourseMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["course"] });
  };

  const createCourse = useMutation({
    mutationFn: async (course: { title: string; description?: string; status?: string; cover_image_url?: string }) => {
      const { data, error } = await supabase
        .from("courses")
        .insert(course)
        .select()
        .single();
      if (error) throw error;
      return data as Course;
    },
    onSuccess: invalidate,
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Course>) => {
      const { error } = await supabase.from("courses").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorderCourses = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("courses")
          .update({ sort_order: i })
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  // -------------------------------------------------------------------------
  // Module mutations
  // -------------------------------------------------------------------------

  const createModule = useMutation({
    mutationFn: async (mod: { course_id: string; title: string; description?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from("modules")
        .insert(mod)
        .select()
        .single();
      if (error) throw error;
      return data as Module;
    },
    onSuccess: invalidate,
  });

  const updateModule = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Module>) => {
      const { error } = await supabase.from("modules").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorderModules = useMutation({
    mutationFn: async ({ courseId, orderedIds }: { courseId: string; orderedIds: string[] }) => {
      void courseId; // used contextually
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("modules")
          .update({ sort_order: i })
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  // -------------------------------------------------------------------------
  // Lesson mutations
  // -------------------------------------------------------------------------

  const createLesson = useMutation({
    mutationFn: async (lesson: {
      module_id: string;
      title: string;
      description?: string;
      content_type?: string;
      content?: Record<string, unknown>;
      video_url?: string;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("lessons")
        .insert({ content_type: "video", ...lesson })
        .select()
        .single();
      if (error) throw error;
      return data as Lesson;
    },
    onSuccess: invalidate,
  });

  const updateLesson = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Lesson>) => {
      const { error } = await supabase.from("lessons").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const reorderLessons = useMutation({
    mutationFn: async ({ moduleId, orderedIds }: { moduleId: string; orderedIds: string[] }) => {
      void moduleId;
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("lessons")
          .update({ sort_order: i })
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const addAttachment = useMutation({
    mutationFn: async ({ lessonId, attachment }: { lessonId: string; attachment: LessonAttachment }) => {
      // Fetch current attachments
      const { data: lesson, error: fetchError } = await supabase
        .from("lessons")
        .select("attachments")
        .eq("id", lessonId)
        .single();
      if (fetchError) throw fetchError;

      const current = (lesson?.attachments as LessonAttachment[]) ?? [];
      const { error } = await supabase
        .from("lessons")
        .update({ attachments: [...current, attachment] })
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const removeAttachment = useMutation({
    mutationFn: async ({ lessonId, attachmentUrl }: { lessonId: string; attachmentUrl: string }) => {
      const { data: lesson, error: fetchError } = await supabase
        .from("lessons")
        .select("attachments")
        .eq("id", lessonId)
        .single();
      if (fetchError) throw fetchError;

      const current = (lesson?.attachments as LessonAttachment[]) ?? [];
      const updated = current.filter((a) => a.url !== attachmentUrl);
      const { error } = await supabase
        .from("lessons")
        .update({ attachments: updated })
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return {
    createCourse,
    updateCourse,
    deleteCourse,
    reorderCourses,
    createModule,
    updateModule,
    deleteModule,
    reorderModules,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons,
    addAttachment,
    removeAttachment,
  };
}

// ---------------------------------------------------------------------------
// Progress hooks
// ---------------------------------------------------------------------------

export function useLessonProgress() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lesson-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, completed_at")
        .eq("student_id", user!.id);
      if (error) throw error;
      return data as { lesson_id: string; status: string; completed_at: string | null }[];
    },
    enabled: !!user,
  });
}

export function useMarkLessonComplete() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error("Non connecte");
      const { error } = await supabase
        .from("lesson_progress")
        .upsert(
          {
            student_id: user.id,
            lesson_id: lessonId,
            status: "completed",
            completed_at: new Date().toISOString(),
            progress_percent: 100,
          },
          { onConflict: "lesson_id,student_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
    },
  });
}
