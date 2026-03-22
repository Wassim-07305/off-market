"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type {
  Profile,
  StudentDetail,
  StudentFlag,
  StudentPipelineStage,
} from "@/types/database";
import { useEffect } from "react";

export type StudentWithDetails = Profile & {
  student_details: StudentDetail[] | StudentDetail | null;
};

/** Extract the first StudentDetail whether Supabase returns an array or object */
export function getStudentDetail(
  s: StudentWithDetails,
): StudentDetail | undefined {
  if (!s.student_details) return undefined;
  if (Array.isArray(s.student_details)) return s.student_details[0];
  return s.student_details;
}

interface UseStudentsOptions {
  search?: string;
  tag?: string;
  flag?: string;
  limit?: number;
  page?: number;
}

export function useStudents(options: UseStudentsOptions = {}) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();
  const { search, tag, flag, limit = 10, page = 0 } = options;

  const studentsQuery = useQuery({
    queryKey: ["students", search, tag, flag, limit, page, user?.id, isAdmin],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    queryFn: async () => {
      // For coaches: only show their assigned clients
      // For admins: show all clients
      let clientIds: string[] | null = null;

      if (!isAdmin) {
        const { data: assignments } = await supabase
          .from("coach_assignments")
          .select("client_id")
          .eq("coach_id", user!.id)
          .eq("status", "active")
          .returns<{ client_id: string }[]>();

        clientIds = (assignments ?? []).map(
          (a) => a.client_id,
        );

        // No assignments → return empty
        if (clientIds.length === 0) return { results: [] as StudentWithDetails[], totalCount: 0 };
      }

      const from = page * limit;
      const to = from + limit - 1;

      let query = supabase
        .from("profiles")
        .select("*, student_details!student_details_profile_id_fkey(*)", { count: "exact" })
        .in("role", ["client", "prospect"])
        .order("created_at", { ascending: false })
        .range(from, to);

      // Filter by assigned clients for non-admin
      if (clientIds) {
        query = query.in("id", clientIds);
      }

      // Filter by flag — get matching profile_ids from student_details first
      if (flag && flag !== "all") {
        const { data: flagged } = await supabase
          .from("student_details")
          .select("profile_id")
          .eq("flag", flag)
          .returns<{ profile_id: string }[]>();
        const flaggedIds = (flagged ?? []).map((f) => f.profile_id);
        if (flaggedIds.length === 0) return { results: [] as StudentWithDetails[], totalCount: 0 };
        query = query.in("id", flaggedIds);
      }

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%`,
        );
      }

      const { data, error, count } = await query.returns<StudentWithDetails[]>();
      if (error) throw error;

      let results = (data ?? []) as StudentWithDetails[];

      if (tag && tag !== "all") {
        results = results.filter((s) => getStudentDetail(s)?.tag === tag);
      }

      return { results, totalCount: count ?? results.length };
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
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_details" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["students"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  /** Upsert student_details row — single round trip instead of SELECT + INSERT */
  const ensureStudentDetails = async (profileId: string) => {
    const { error } = await supabase
      .from("student_details")
      .upsert({ profile_id: profileId } as never, { onConflict: "profile_id" })
      .select("id")
      .single();
    if (error) throw error;
  };

  const updateStudentTag = useMutation({
    mutationFn: async ({
      profileId,
      tag,
    }: {
      profileId: string;
      tag: string;
    }) => {
      // Single upsert: creates row if missing, updates tag if exists
      const { error } = await supabase
        .from("student_details")
        .upsert({ profile_id: profileId, tag } as never, { onConflict: "profile_id" });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({
        queryKey: ["student", variables.profileId],
      });
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
      // Single upsert: creates row if missing, applies updates if exists
      const { error } = await supabase
        .from("student_details")
        .upsert(
          { profile_id: profileId, ...updates } as never,
          { onConflict: "profile_id" },
        );
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({
        queryKey: ["student", variables.profileId],
      });
    },
  });

  const updateStudentFlag = useMutation({
    mutationFn: async ({
      profileId,
      flag,
      reason,
    }: {
      profileId: string;
      flag: StudentFlag;
      reason?: string;
    }) => {
      // Upsert to ensure row exists, then read back old flag in one go
      const { data: upserted, error: upsertError } = await supabase
        .from("student_details")
        .upsert({ profile_id: profileId } as never, { onConflict: "profile_id" })
        .select("flag")
        .returns<{ flag: string }[]>()
        .single();
      if (upsertError) throw upsertError;

      const oldFlag = (upserted as { flag: string } | null)?.flag ?? null;

      // Update the flag
      const {
        error,
        data: updated,
        count,
      } = await supabase
        .from("student_details")
        .update({ flag } as never)
        .eq("profile_id", profileId)
        .select();
      console.log("[updateStudentFlag]", {
        profileId,
        flag,
        error,
        updated,
        count,
      });
      if (error) throw error;

      // Log the change in history
      if (user) {
        await supabase.from("student_flag_history").insert({
          student_id: profileId,
          old_flag: oldFlag,
          new_flag: flag,
          reason: reason ?? null,
          changed_by: user.id,
        } as never);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.refetchQueries({ queryKey: ["students"] });
      queryClient.refetchQueries({
        queryKey: ["student", variables.profileId],
      });
      queryClient.refetchQueries({
        queryKey: ["student-flag-history", variables.profileId],
      });
    },
  });

  const updateStudentPipelineStage = useMutation({
    mutationFn: async ({
      profileId,
      stage,
    }: {
      profileId: string;
      stage: StudentPipelineStage;
    }) => {
      // Single upsert: creates row if missing, updates pipeline_stage if exists
      const { error } = await supabase
        .from("student_details")
        .upsert(
          { profile_id: profileId, pipeline_stage: stage } as never,
          { onConflict: "profile_id" },
        );
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({
        queryKey: ["student", variables.profileId],
      });
    },
  });

  return {
    students: ((studentsQuery.data as { results?: StudentWithDetails[] } | undefined)?.results ?? []) as StudentWithDetails[],
    totalCount: ((studentsQuery.data as { totalCount?: number } | undefined)?.totalCount ?? 0),
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    updateStudentTag,
    updateStudentFlag,
    updateStudentDetails,
    updateStudentPipelineStage,
  };
}

export function useStudent(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, student_details!student_details_profile_id_fkey(*)")
        .eq("id", id)
        .returns<StudentWithDetails[]>()
        .single();
      if (error) throw error;
      return data as unknown as StudentWithDetails;
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
        .select(
          "*, author:profiles!student_notes_author_id_fkey(full_name, avatar_url)",
        )
        .eq("student_id", studentId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .returns<Array<Record<string, unknown>>>();
      if (error) throw error;
      return data ?? [];
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
      } as never);
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
        .update({ is_pinned: !isPinned } as never)
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
      } as never);
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
        .update(updates as never)
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

export function useStudentFlagHistory(studentId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["student-flag-history", studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_flag_history")
        .select(
          "*, author:profiles!student_flag_history_changed_by_fkey(full_name, avatar_url)",
        )
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .returns<Array<{
          id: string;
          student_id: string;
          previous_flag: StudentFlag | null;
          new_flag: StudentFlag;
          reason: string | null;
          created_at: string;
          author: { full_name: string; avatar_url: string | null } | null;
        }>>();
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        student_id: string;
        previous_flag: StudentFlag | null;
        new_flag: StudentFlag;
        reason: string | null;
        created_at: string;
        author: { full_name: string; avatar_url: string | null } | null;
      }>;
    },
    enabled: !!studentId,
  });
}
