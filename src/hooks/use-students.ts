"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Profile, StudentDetail } from "@/types/database";
import { useEffect } from "react";

export type StudentWithDetails = Profile & {
  student_details: StudentDetail[];
};

interface UseStudentsOptions {
  search?: string;
  tag?: string;
  limit?: number;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { search, tag, limit = 50 } = options;

  const studentsQuery = useQuery({
    queryKey: ["students", search, tag, limit],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*, student_details(*)")
        .eq("role", "student")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = data as StudentWithDetails[];

      if (tag && tag !== "all") {
        results = results.filter(
          (s) => s.student_details?.[0]?.tag === tag
        );
      }

      return results;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("students-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["students"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_details" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["students"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  const updateStudentTag = useMutation({
    mutationFn: async ({
      profileId,
      tag,
    }: {
      profileId: string;
      tag: string;
    }) => {
      const { error } = await supabase
        .from("student_details")
        .update({ tag })
        .eq("profile_id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  const updateStudentDetails = useMutation({
    mutationFn: async ({
      profileId,
      updates,
    }: {
      profileId: string;
      updates: Partial<StudentDetail>;
    }) => {
      const { error } = await supabase
        .from("student_details")
        .update(updates)
        .eq("profile_id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });

  return {
    students: studentsQuery.data ?? [],
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    updateStudentTag,
    updateStudentDetails,
  };
}

export function useStudent(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, student_details(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as StudentWithDetails;
    },
    enabled: !!id,
  });
}

export function useStudentActivities(studentId: string, limit = 20) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["student-activities", studentId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_activities")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });
}

export function useStudentNotes(studentId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ["student-notes", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_notes")
        .select("*, author:profiles!student_notes_author_id_fkey(full_name, avatar_url)")
        .eq("student_id", studentId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  const addNote = useMutation({
    mutationFn: async ({
      content,
      authorId,
    }: {
      content: string;
      authorId: string;
    }) => {
      const { error } = await supabase.from("student_notes").insert({
        student_id: studentId,
        author_id: authorId,
        content,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-notes", studentId],
      });
    },
  });

  const togglePin = useMutation({
    mutationFn: async ({
      noteId,
      isPinned,
    }: {
      noteId: string;
      isPinned: boolean;
    }) => {
      const { error } = await supabase
        .from("student_notes")
        .update({ is_pinned: !isPinned })
        .eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-notes", studentId],
      });
    },
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    addNote,
    togglePin,
  };
}

export function useStudentTasks(studentId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["student-tasks", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_tasks")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!studentId,
  });

  const addTask = useMutation({
    mutationFn: async (task: {
      title: string;
      description?: string;
      due_date?: string;
      priority?: string;
      assigned_by: string;
    }) => {
      const { error } = await supabase.from("student_tasks").insert({
        student_id: studentId,
        ...task,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-tasks", studentId],
      });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({
      taskId,
      status,
    }: {
      taskId: string;
      status: string;
    }) => {
      const updates: Record<string, unknown> = { status };
      if (status === "done") updates.completed_at = new Date().toISOString();
      const { error } = await supabase
        .from("student_tasks")
        .update(updates)
        .eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["student-tasks", studentId],
      });
    },
  });

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading,
    addTask,
    updateTaskStatus,
  };
}
