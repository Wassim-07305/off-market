"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { Form, FormField, FormSubmission } from "@/types/database";

export function useForms(status?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["forms", status],
    queryFn: async () => {
      let query = supabase
        .from("forms")
        .select("*, form_fields(*), form_submissions(count)")
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as (Form & { form_fields: FormField[]; form_submissions: Array<{ count: number }> })[];
    },
  });
}

export function useForm(formId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["form", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("*, form_fields(*)")
        .eq("id", formId)
        .single();
      if (error) throw error;
      return data as Form & { form_fields: FormField[] };
    },
    enabled: !!formId,
  });
}

export function useFormSubmissions(formId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["form-submissions", formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("form_submissions")
        .select("*, respondent:profiles!form_submissions_respondent_id_fkey(full_name, email)")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as (FormSubmission & { respondent: { full_name: string; email: string } | null })[];
    },
    enabled: !!formId,
  });
}

export function useFormMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const createForm = useMutation({
    mutationFn: async (form: { title: string; description?: string; created_by: string }) => {
      const { data, error } = await supabase
        .from("forms")
        .insert(form)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forms"] }),
  });

  const updateForm = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Form>) => {
      const { error } = await supabase.from("forms").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forms"] }),
  });

  const saveFields = useMutation({
    mutationFn: async ({
      formId,
      fields,
    }: {
      formId: string;
      fields: Partial<FormField>[];
    }) => {
      await supabase.from("form_fields").delete().eq("form_id", formId);
      if (fields.length > 0) {
        const { error } = await supabase
          .from("form_fields")
          .insert(fields.map((f, i) => ({ ...f, form_id: formId, sort_order: i })));
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forms"] }),
  });

  const submitForm = useMutation({
    mutationFn: async ({
      formId,
      respondentId,
      answers,
    }: {
      formId: string;
      respondentId?: string;
      answers: Record<string, unknown>;
    }) => {
      const { error } = await supabase.from("form_submissions").insert({
        form_id: formId,
        respondent_id: respondentId,
        answers,
      });
      if (error) throw error;
    },
  });

  return { createForm, updateForm, saveFields, submitForm };
}
