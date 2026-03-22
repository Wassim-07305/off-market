"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useAwardXp } from "./use-auto-xp";
import { toast } from "sonner";
import type {
  Course,
  Module,
  Lesson,
  LessonAttachment,
} from "@/types/database";

// ---------------------------------------------------------------------------
// Read hooks
// ---------------------------------------------------------------------------

export function useCourses(status?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["courses", status],
    enabled: !!user,
    staleTime: 30 * 60 * 1000, // 30 min — les formations changent rarement
    gcTime: 60 * 60 * 1000,
    queryFn: async () => {
      let query = supabase
        .from("courses")
        .select("*, modules(*, lessons(*))")
        .order("sort_order", { ascending: true });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query.returns<(Course & { modules: (Module & { lessons: Lesson[] })[] })[]>();
      if (error) throw error;
      return (data ?? []) as (Course & {
        modules: (Module & { lessons: Lesson[] })[];
      })[];
    },
  });
}

export function useCourse(courseId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["course", courseId],
    staleTime: 30 * 60 * 1000, // 30 min — donnees de reference
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, modules(*, lessons(*))")
        .eq("id", courseId)
        .returns<(Course & { modules: (Module & { lessons: Lesson[] })[] })[]>()
        .single();
      if (error) throw error;
      return data as unknown as Course & { modules: (Module & { lessons: Lesson[] })[] };
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
    mutationFn: async (course: {
      title: string;
      description?: string;
      status?: string;
      cover_image_url?: string;
    }) => {
      const { data, error } = await supabase
        .from("courses")
        .insert(course as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Course;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la création de la formation");
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Course>) => {
      const { data, error } = await supabase
        .from("courses")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Course;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la formation");
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la suppression de la formation");
    },
  });

  const reorderCourses = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("courses")
          .update({ sort_order: i } as never)
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors du réordonnancement des formations");
    },
  });

  // -------------------------------------------------------------------------
  // Module mutations
  // -------------------------------------------------------------------------

  const createModule = useMutation({
    mutationFn: async (mod: {
      course_id: string;
      title: string;
      description?: string;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("modules")
        .insert(mod as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Module;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la création du module");
    },
  });

  const updateModule = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Module>) => {
      const { error } = await supabase
        .from("modules")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la mise à jour du module");
    },
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la suppression du module");
    },
  });

  const reorderModules = useMutation({
    mutationFn: async ({
      courseId,
      orderedIds,
    }: {
      courseId: string;
      orderedIds: string[];
    }) => {
      void courseId; // used contextually
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("modules")
          .update({ sort_order: i } as never)
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors du réordonnancement des modules");
    },
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
        .insert({ content_type: "video", ...lesson } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Lesson;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la création de la leçon");
    },
  });

  const updateLesson = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Lesson>) => {
      const { error } = await supabase
        .from("lessons")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la leçon");
    },
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la suppression de la leçon");
    },
  });

  const reorderLessons = useMutation({
    mutationFn: async ({
      moduleId,
      orderedIds,
    }: {
      moduleId: string;
      orderedIds: string[];
    }) => {
      void moduleId;
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from("lessons")
          .update({ sort_order: i } as never)
          .eq("id", orderedIds[i]);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors du réordonnancement des leçons");
    },
  });

  const addAttachment = useMutation({
    mutationFn: async ({
      lessonId,
      attachment,
    }: {
      lessonId: string;
      attachment: LessonAttachment;
    }) => {
      // Fetch current attachments
      const { data: lesson, error: fetchError } = await supabase
        .from("lessons")
        .select("attachments")
        .eq("id", lessonId)
        .returns<{ attachments: LessonAttachment[] }[]>()
        .single();
      if (fetchError) throw fetchError;

      const current = (lesson?.attachments as LessonAttachment[]) ?? [];
      const { error } = await supabase
        .from("lessons")
        .update({ attachments: [...current, attachment] } as never)
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de l'ajout de la pièce jointe");
    },
  });

  const removeAttachment = useMutation({
    mutationFn: async ({
      lessonId,
      attachmentUrl,
    }: {
      lessonId: string;
      attachmentUrl: string;
    }) => {
      const { data: lesson, error: fetchError } = await supabase
        .from("lessons")
        .select("attachments")
        .eq("id", lessonId)
        .returns<{ attachments: LessonAttachment[] }[]>()
        .single();
      if (fetchError) throw fetchError;

      const current = (lesson?.attachments as LessonAttachment[]) ?? [];
      const updated = current.filter((a) => a.url !== attachmentUrl);
      const { error } = await supabase
        .from("lessons")
        .update({ attachments: updated } as never)
        .eq("id", lessonId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => {
      toast.error("Erreur lors de la suppression de la pièce jointe");
    },
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
    staleTime: 5 * 60 * 1000, // 5 min — progression mise a jour par mutation
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, status, completed_at")
        .eq("student_id", user!.id)
        .returns<{ lesson_id: string; status: string; completed_at: string | null }[]>();
      if (error) throw error;
      return (data ?? []) as {
        lesson_id: string;
        status: string;
        completed_at: string | null;
      }[];
    },
    enabled: !!user,
  });
}

export function useMarkLessonComplete() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const awardXp = useAwardXp();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!user) throw new Error("Non connecte");
      const { error } = await supabase.from("lesson_progress").upsert(
        {
          student_id: user.id,
          lesson_id: lessonId,
          status: "completed",
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        } as never,
        { onConflict: "lesson_id,student_id" },
      );
      if (error) throw error;
      return lessonId;
    },
    onSuccess: (_data, lessonId) => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });

      // Award XP for completing a lesson/module
      awardXp.mutate({
        action: "complete_module",
        metadata: { lesson_id: lessonId },
      });
    },
    onError: () => {
      toast.error("Erreur lors de la validation de la leçon");
    },
  });
}
