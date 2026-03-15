"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  CrmContact,
  PipelineStage,
  CallNote,
  ContactInteraction,
  InteractionType,
} from "@/types/pipeline";

// ─── Pipeline Contacts ───────────────────────────────────────

export function usePipelineContacts(stage?: PipelineStage) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const contactsQuery = useQuery({
    queryKey: ["pipeline-contacts", stage],
    queryFn: async () => {
      let query = supabase
        .from("crm_contacts")
        .select(
          "*, assigned_profile:profiles!crm_contacts_assigned_to_fkey(id, full_name)",
        )
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });

      if (stage) {
        query = query.eq("stage", stage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CrmContact[];
    },
    enabled: !!user,
  });

  const createContact = useMutation({
    mutationFn: async (contact: {
      full_name: string;
      email?: string;
      phone?: string;
      company?: string;
      source?: string;
      stage?: PipelineStage;
      estimated_value?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .insert({ ...contact, created_by: user!.id, assigned_to: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as CrmContact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Contact ajoute");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      console.error("CRM contact create error:", err);
      toast.error(`Erreur lors de l'ajout: ${msg}`);
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CrmContact> & { id: string }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
    },
  });

  const moveContact = useMutation({
    mutationFn: async ({
      id,
      stage,
      sort_order,
    }: {
      id: string;
      stage: PipelineStage;
      sort_order?: number;
    }) => {
      const updates: Record<string, unknown> = { stage };
      if (sort_order !== undefined) updates.sort_order = sort_order;
      const { error } = await supabase
        .from("crm_contacts")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("crm_contacts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Contact supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  return {
    contacts: contactsQuery.data ?? [],
    isLoading: contactsQuery.isLoading,
    createContact,
    updateContact,
    moveContact,
    deleteContact,
  };
}

// ─── Update Contact Stage ────────────────────────────────────

export function useUpdateContactStage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: PipelineStage }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ stage })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Etape mise a jour");
    },
    onError: () => toast.error("Erreur lors du deplacement"),
  });
}

// ─── Contact Interactions ────────────────────────────────────

export function useContactInteractions(contactId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contact-interactions", contactId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_interactions")
        .select(
          "*, author:profiles!contact_interactions_created_by_fkey(full_name, avatar_url)",
        )
        .eq("contact_id", contactId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContactInteraction[];
    },
    enabled: !!contactId && !!user,
  });
}

export function useAddInteraction() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      contact_id,
      type,
      content,
      metadata,
    }: {
      contact_id: string;
      type: InteractionType;
      content?: string;
      metadata?: Record<string, unknown>;
    }) => {
      // Insert the interaction
      const { error: interactionError } = await supabase
        .from("contact_interactions")
        .insert({
          contact_id,
          type,
          content: content || null,
          metadata: metadata || {},
          created_by: user!.id,
        });
      if (interactionError) throw interactionError;

      // Update last_interaction_at and increment interaction_count on the contact
      const { data: currentContact } = await supabase
        .from("crm_contacts")
        .select("interaction_count")
        .eq("id", contact_id)
        .single();

      const { error: contactUpdateError } = await supabase
        .from("crm_contacts")
        .update({
          last_interaction_at: new Date().toISOString(),
          interaction_count:
            ((currentContact?.interaction_count as number) ?? 0) + 1,
        })
        .eq("id", contact_id);

      if (contactUpdateError) throw contactUpdateError;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contact-interactions", variables.contact_id],
      });
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Interaction ajoutee");
    },
    onError: () => toast.error("Erreur lors de l'ajout de l'interaction"),
  });
}

// ─── Update Lead Score ───────────────────────────────────────

export function useUpdateLeadScore() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      lead_score,
    }: {
      id: string;
      lead_score: number;
    }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ lead_score })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour du score"),
  });
}

// ─── Call Notes ───────────────────────────────────────────────

export function useCallNote(callId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const noteQuery = useQuery({
    queryKey: ["call-note", callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_notes")
        .select("*")
        .eq("call_id", callId!)
        .maybeSingle();
      if (error) throw error;
      return data as CallNote | null;
    },
    enabled: !!callId && !!user,
  });

  const saveNote = useMutation({
    mutationFn: async (note: {
      summary?: string;
      client_mood?: string;
      outcome?: string;
      next_steps?: string;
      action_items?: { title: string; done: boolean }[];
    }) => {
      if (!callId || !user) throw new Error("Missing callId or user");

      const payload = {
        call_id: callId,
        author_id: user.id,
        ...note,
      };

      const { data, error } = await supabase
        .from("call_notes")
        .upsert(payload, { onConflict: "call_id" })
        .select()
        .single();
      if (error) throw error;
      return data as CallNote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-note", callId] });
      toast.success("Notes sauvegardees");
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });

  return {
    note: noteQuery.data,
    isLoading: noteQuery.isLoading,
    saveNote,
  };
}
