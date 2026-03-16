"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useFormMutations } from "./use-forms";
import { toast } from "sonner";

export interface FormTemplate {
  id: string;
  name: string;
  description: string | null;
  category: "onboarding" | "feedback" | "evaluation" | "intake" | "survey";
  thumbnail_emoji: string;
  fields: TemplateField[];
  is_system: boolean;
  created_by: string | null;
  created_at: string;
}

export interface TemplateField {
  field_type: string;
  label: string;
  description: string;
  placeholder: string;
  is_required: boolean;
  options: Array<{ label: string; value: string }>;
  sort_order: number;
}

export function useFormTemplates(category?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["form-templates", category],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("form_templates")
        .select("*")
        .order("created_at", { ascending: true });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FormTemplate[];
    },
  });
}

export function useCreateFormFromTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { saveFields } = useFormMutations();

  return useMutation({
    mutationFn: async ({
      template,
      title,
    }: {
      template: FormTemplate;
      title?: string;
    }) => {
      if (!user) throw new Error("Non authentifie");

      // Create the form
      const { data: form, error: formError } = await supabase
        .from("forms")
        .insert({
          title: title || template.name,
          description: template.description,
          created_by: user.id,
          status: "draft",
        })
        .select()
        .single();
      if (formError) throw formError;

      // Insert fields from template
      const fields = template.fields.filter(
        (f) => f.field_type && f.label !== undefined,
      );
      if (fields.length > 0) {
        await saveFields.mutateAsync({
          formId: form.id,
          fields: fields.map((f, i) => ({
            field_type: f.field_type,
            label: f.label || "Sans titre",
            description: f.description || null,
            placeholder: f.placeholder || null,
            is_required: f.is_required ?? false,
            options: f.options ?? [],
            conditional_logic: {},
            sort_order: i,
          })),
        });
      }

      return form;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast.success("Formulaire cree depuis le template");
    },
    onError: () => {
      toast.error("Erreur lors de la creation du formulaire");
    },
  });
}

export function useSaveAsTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      name,
      description,
      category,
      emoji,
      fields,
    }: {
      name: string;
      description: string;
      category: FormTemplate["category"];
      emoji: string;
      fields: TemplateField[];
    }) => {
      if (!user) throw new Error("Non authentifie");

      const { data, error } = await supabase
        .from("form_templates")
        .insert({
          name,
          description,
          category,
          thumbnail_emoji: emoji,
          fields: fields as unknown as Record<string, unknown>,
          is_system: false,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-templates"] });
      toast.success("Template sauvegarde");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde du template");
    },
  });
}
