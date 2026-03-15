"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────

export interface LessonComment {
  id: string;
  lesson_id: string;
  profile_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
  } | null;
  replies?: LessonComment[];
}

// ─── Hooks ─────────────────────────────────────────────────────

export function useLessonComments(lessonId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["lesson-comments", lessonId],
    enabled: !!lessonId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("lesson_comments")
        .select("*, profile:profiles!lesson_comments_profile_id_fkey(id, full_name, avatar_url, role)")
        .eq("lesson_id", lessonId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const comments = data as LessonComment[];

      // Build threaded structure: top-level + nested replies (one level)
      const topLevel: LessonComment[] = [];
      const repliesByParent = new Map<string, LessonComment[]>();

      for (const comment of comments) {
        if (comment.parent_id) {
          if (!repliesByParent.has(comment.parent_id)) {
            repliesByParent.set(comment.parent_id, []);
          }
          repliesByParent.get(comment.parent_id)!.push(comment);
        } else {
          topLevel.push(comment);
        }
      }

      // Attach replies to their parents
      for (const comment of topLevel) {
        comment.replies = repliesByParent.get(comment.id) ?? [];
      }

      return topLevel;
    },
  });
}

export function useCreateComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      lessonId,
      content,
      parentId,
    }: {
      lessonId: string;
      content: string;
      parentId?: string | null;
    }) => {
      if (!user) throw new Error("Non connecte");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("lesson_comments")
        .insert({
          lesson_id: lessonId,
          profile_id: user.id,
          content,
          parent_id: parentId ?? null,
        })
        .select("*, profile:profiles!lesson_comments_profile_id_fkey(id, full_name, avatar_url, role)")
        .single();
      if (error) throw error;
      return data as LessonComment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-comments", variables.lessonId],
      });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du commentaire");
    },
  });
}

export function useDeleteComment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      lessonId,
    }: {
      commentId: string;
      lessonId: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("lesson_comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
      return { lessonId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-comments", variables.lessonId],
      });
      toast.success("Commentaire supprime");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du commentaire");
    },
  });
}
