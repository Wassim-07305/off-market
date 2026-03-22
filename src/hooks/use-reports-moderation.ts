"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { FeedReport, ReportStatus, ReportAction } from "@/types/feed";

export function useFeedReports(status?: ReportStatus) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: ["feed-reports", status],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("feed_reports")
        .select(
          `
          *,
          reporter:profiles!feed_reports_reporter_id_fkey(id, full_name, avatar_url),
          post:feed_posts(id, content, post_type, author_id),
          comment:feed_comments(id, content, author_id),
          reviewer:profiles!feed_reports_reviewed_by_fkey(id, full_name)
        `,
        )
        .order("created_at", { ascending: false });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data as FeedReport[];
    },
  });

  const createReport = useMutation({
    mutationFn: async (report: {
      post_id?: string;
      comment_id?: string;
      reason: string;
      details?: string;
    }) => {
      const { data, error } = await supabase
        .from("feed_reports")
        .insert({
          ...report,
          reporter_id: user!.id,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-reports"] });
    },
  });

  const reviewReport = useMutation({
    mutationFn: async ({
      id,
      status,
      action_taken,
    }: {
      id: string;
      status: ReportStatus;
      action_taken?: ReportAction;
    }) => {
      const { error } = await supabase
        .from("feed_reports")
        .update({
          status,
          action_taken: action_taken ?? null,
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-reports"] });
    },
  });

  const deleteReportedContent = useMutation({
    mutationFn: async ({
      reportId,
      postId,
      commentId,
    }: {
      reportId: string;
      postId?: string | null;
      commentId?: string | null;
    }) => {
      // Delete the content
      if (postId) {
        const { error } = await supabase
          .from("feed_posts")
          .delete()
          .eq("id", postId);
        if (error) throw error;
      }
      if (commentId) {
        const { error } = await supabase
          .from("feed_comments")
          .delete()
          .eq("id", commentId);
        if (error) throw error;
      }

      // Mark report as actioned
      const { error } = await supabase
        .from("feed_reports")
        .update({
          status: "actioned",
          action_taken: "content_removed",
          reviewed_by: user!.id,
          reviewed_at: new Date().toISOString(),
        } as never)
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed-reports"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });

  return {
    reports: reportsQuery.data ?? [],
    isLoading: reportsQuery.isLoading,
    createReport,
    reviewReport,
    deleteReportedContent,
  };
}

export function usePendingReportsCount() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["feed-reports-count"],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("feed_reports")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
  });
}
