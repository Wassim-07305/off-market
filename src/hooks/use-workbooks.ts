"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  Workbook,
  WorkbookField,
  WorkbookModuleType,
  WorkbookSubmission,
} from "@/types/database";

// ---------------------------------------------------------------------------
// List workbooks (optional filter by course)
// ---------------------------------------------------------------------------

export function useWorkbooks(courseId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workbooks", courseId],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("workbooks")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Workbook[];
    },
  });
}

// ---------------------------------------------------------------------------
// Single workbook
// ---------------------------------------------------------------------------

export function useWorkbook(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["workbook", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workbooks")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Workbook;
    },
  });
}

// ---------------------------------------------------------------------------
// Workbook submission for a client
// ---------------------------------------------------------------------------

export function useWorkbookSubmission(
  workbookId: string | null,
  clientId?: string,
) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const resolvedClientId = clientId ?? user?.id;

  return useQuery({
    queryKey: ["workbook-submission", workbookId, resolvedClientId],
    enabled: !!workbookId && !!resolvedClientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workbook_submissions")
        .select("*")
        .eq("workbook_id", workbookId!)
        .eq("client_id", resolvedClientId!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as WorkbookSubmission | null;
    },
  });
}

// ---------------------------------------------------------------------------
// Submit / save workbook answers
// ---------------------------------------------------------------------------

export function useSubmitWorkbook() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workbookId,
      clientId,
      answers,
      status,
      callId,
    }: {
      workbookId: string;
      clientId: string;
      answers: Record<string, unknown>;
      status: "draft" | "submitted";
      callId?: string;
    }) => {
      // Check for existing draft
      const { data: existing } = await supabase
        .from("workbook_submissions")
        .select("id")
        .eq("workbook_id", workbookId)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const payload = {
        workbook_id: workbookId,
        client_id: clientId,
        answers,
        status,
        call_id: callId ?? null,
        submitted_at: status === "submitted" ? new Date().toISOString() : null,
      };

      let submission: WorkbookSubmission;

      if (existing) {
        const { data, error } = await supabase
          .from("workbook_submissions")
          .update(payload as never)
          .eq("id", (existing as any).id)
          .select()
          .single();
        if (error) throw error;
        submission = data as WorkbookSubmission;
      } else {
        const { data, error } = await supabase
          .from("workbook_submissions")
          .insert(payload as never)
          .select()
          .single();
        if (error) throw error;
        submission = data as WorkbookSubmission;
      }

      // Notify admin users when workbook is submitted
      if (status === "submitted") {
        try {
          // Fetch client name and workbook title for the notification
          const [clientRes, workbookRes, adminsRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name")
              .eq("id", clientId)
              .single(),
            supabase
              .from("workbooks")
              .select("title")
              .eq("id", workbookId)
              .single(),
            supabase.from("user_roles").select("user_id").eq("role", "admin"),
          ]);

          const clientName =
            (clientRes.data as { full_name: string } | null)?.full_name ??
            "Un client";
          const workbookTitle =
            (workbookRes.data as { title: string } | null)?.title ??
            "un workbook";
          const adminIds = (
            (adminsRes.data ?? []) as Array<{ user_id: string }>
          ).map((r) => r.user_id);

          if (adminIds.length > 0) {
            const notifications = adminIds.map((adminId) => ({
              user_id: adminId,
              type: "workbook_completed",
              title: "Workbook complete",
              message: `Le client ${clientName} a complete le workbook ${workbookTitle}`,
              data: {
                workbook_id: workbookId,
                submission_id: submission.id,
                client_id: clientId,
              },
            }));

            await supabase
              .from("notifications")
              .insert(notifications as never[]);
          }
        } catch (notifError) {
          // Don't fail the submission if notification fails
          console.error(
            "Error sending workbook completion notifications:",
            notifError,
          );
        }
      }

      return submission;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workbook-submission", variables.workbookId],
      });
      if (variables.status === "submitted") {
        toast.success("Workbook soumis avec succes");
      } else {
        toast.success("Brouillon enregistre");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    },
  });
}

// ---------------------------------------------------------------------------
// Coach review
// ---------------------------------------------------------------------------

export function useReviewWorkbook() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      submissionId,
      reviewerNotes,
    }: {
      submissionId: string;
      reviewerNotes: string;
    }) => {
      const { data, error } = await supabase
        .from("workbook_submissions")
        .update({
          status: "reviewed",
          reviewer_notes: reviewerNotes,
          reviewed_by: user?.id ?? null,
        } as never)
        .eq("id", submissionId)
        .select()
        .single();
      if (error) throw error;
      return data as WorkbookSubmission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbook-submission"] });
      toast.success("Revue enregistree");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la revue");
    },
  });
}

// ---------------------------------------------------------------------------
// Admin/coach mutations for workbook templates
// ---------------------------------------------------------------------------

export function useWorkbookMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const createWorkbook = useMutation({
    mutationFn: async (workbook: {
      title: string;
      description?: string;
      course_id?: string;
      module_type?: WorkbookModuleType;
      fields: WorkbookField[];
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("workbooks")
        .insert(workbook as never)
        .select()
        .single();
      if (error) throw error;
      return data as Workbook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbooks"] });
      toast.success("Workbook cree");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la creation");
    },
  });

  const updateWorkbook = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Workbook>) => {
      const { data, error } = await supabase
        .from("workbooks")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Workbook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbooks"] });
      queryClient.invalidateQueries({ queryKey: ["workbook"] });
      toast.success("Workbook mis a jour");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise a jour");
    },
  });

  const deleteWorkbook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workbooks")
        .update({ is_active: false } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbooks"] });
      toast.success("Workbook supprime");
    },
  });

  return { createWorkbook, updateWorkbook, deleteWorkbook };
}
