"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  CrmContact,
  PipelineStage,
  CloserStage,
  CallNote,
  ContactInteraction,
  InteractionType,
} from "@/types/pipeline";
import type { CommissionRole } from "@/types/billing";
import { DEFAULT_COMMISSION_RATES } from "@/types/billing";

// ─── Pipeline Contacts ───────────────────────────────────────

export type PipelineMode = "manual" | "signup" | "all";

export function usePipelineContacts(stage?: PipelineStage, mode?: PipelineMode) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const contactsQuery = useQuery({
    queryKey: ["pipeline-contacts", stage, mode],
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

      // Filter by mode: manual leads vs signed-up prospects
      if (mode === "manual") {
        query = query.is("converted_profile_id", null);
      } else if (mode === "signup") {
        query = query.not("converted_profile_id", "is", null);
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
      converted_profile_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("crm_contacts")
        .insert({ ...contact, created_by: user!.id, assigned_to: user!.id } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CrmContact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Contact ajoute");

      // Auto-enrich if social URLs provided
      if (
        data.linkedin_url ||
        data.instagram_url ||
        data.tiktok_url ||
        data.facebook_url ||
        data.website_url
      ) {
        fetch("/api/enrichment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contactId: data.id, type: "all" }),
        })
          .then(() => {
            queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
            toast.success("Enrichissement auto lance");
          })
          .catch(() => {
            // Silent fail — enrichment is best-effort
          });
      }
    },
    onError: (err: unknown) => {
      const pg = err as { message?: string; code?: string; details?: string };
      const msg =
        pg?.message ||
        (err instanceof Error ? err.message : JSON.stringify(err));
      console.error("CRM contact create error:", err);
      toast.error(`Erreur: ${msg}`, { duration: 8000 });
    },
  });

  const updateContact = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CrmContact> & { id: string }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du contact");
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
      const updates: Record<string, unknown> = { stage, returned_by_closer: false };
      if (sort_order !== undefined) updates.sort_order = sort_order;
      const { error } = await supabase
        .from("crm_contacts")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
      return { id, stage };
    },
    onMutate: async ({ id, stage, sort_order }) => {
      // Optimistic update: move contact in cache immediately
      await queryClient.cancelQueries({ queryKey: ["pipeline-contacts"] });
      const previousContacts = queryClient.getQueriesData<CrmContact[]>({
        queryKey: ["pipeline-contacts"],
      });

      queryClient.setQueriesData<CrmContact[]>(
        { queryKey: ["pipeline-contacts"] },
        (old) =>
          old?.map((c) =>
            c.id === id
              ? {
                  ...c,
                  stage,
                  ...(sort_order !== undefined ? { sort_order } : {}),
                }
              : c,
          ),
      );

      return { previousContacts };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousContacts) {
        for (const [key, data] of context.previousContacts) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("Erreur lors du deplacement");
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });

      // Auto-create commissions when contact moves to "client" stage
      if (result.stage === "client") {
        try {
          // Fetch contact and check existing commissions in parallel
          const [contactResult, commissionResult] = await Promise.all([
            supabase
              .from("crm_contacts")
              .select("id, full_name, estimated_value, assigned_to, created_by")
              .eq("id", result.id)
              .single(),
            supabase
              .from("commissions")
              .select("id", { count: "exact", head: true })
              .eq("sale_id", result.id),
          ]);

          const contact = contactResult.data as { id: string; full_name: string; estimated_value: number; assigned_to: string | null; created_by: string | null } | null;
          if (!contact || !contact.estimated_value) return;
          if (commissionResult.count && commissionResult.count > 0) return;

          const saleAmount = Number(contact.estimated_value);
          if (saleAmount <= 0) return;

          // Determine commission recipients
          const commissionEntries: Array<{
            sale_id: string;
            contractor_id: string;
            contractor_role: CommissionRole;
            sale_amount: number;
            commission_rate: number;
            commission_amount: number;
            percentage: number;
            amount: number;
          }> = [];

          // Assigned user gets closer commission
          if (contact.assigned_to) {
            const rate = DEFAULT_COMMISSION_RATES.closer;
            const commAmount = Math.round(saleAmount * rate * 100) / 100;
            commissionEntries.push({
              sale_id: contact.id,
              contractor_id: contact.assigned_to,
              contractor_role: "closer",
              sale_amount: saleAmount,
              commission_rate: rate,
              commission_amount: commAmount,
              percentage: rate * 100,
              amount: commAmount,
            });
          }

          // Creator (if different from assignee) gets setter commission
          if (
            contact.created_by &&
            contact.created_by !== contact.assigned_to
          ) {
            const rate = DEFAULT_COMMISSION_RATES.setter;
            const commAmount = Math.round(saleAmount * rate * 100) / 100;
            commissionEntries.push({
              sale_id: contact.id,
              contractor_id: contact.created_by,
              contractor_role: "setter",
              sale_amount: saleAmount,
              commission_rate: rate,
              commission_amount: commAmount,
              percentage: rate * 100,
              amount: commAmount,
            });
          }

          if (commissionEntries.length > 0) {
            const { error: commError } = await supabase
              .from("commissions")
              .insert(commissionEntries as never);

            if (commError) {
              console.error("Auto-commission creation error:", commError);
            } else {
              queryClient.invalidateQueries({ queryKey: ["commissions"] });
              toast.success(
                `${commissionEntries.length} commission(s) creee(s) automatiquement`,
              );
            }
          }
        } catch (err) {
          console.error("Auto-commission error:", err);
        }
      }
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

// ─── Closer Pipeline ─────────────────────────────────────────

export function useCloserPipeline(adminMode = false) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const contactsQuery = useQuery({
    queryKey: ["closer-pipeline", adminMode ? "all" : user?.id],
    queryFn: async () => {
      let query = supabase
        .from("crm_contacts")
        .select(
          "*, assigned_profile:profiles!crm_contacts_assigned_to_fkey(id, full_name)",
        )
        .not("closer_stage", "is", null);

      // Non-admin: only see own contacts
      if (!adminMode) {
        query = query.eq("closer_id", user!.id);
      }

      const { data, error } = await query
        .order("sort_order", { ascending: true })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as CrmContact[];
    },
    enabled: !!user,
  });

  const moveCloserStage = useMutation({
    mutationFn: async ({
      id,
      closer_stage,
    }: {
      id: string;
      closer_stage: CloserStage;
    }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ closer_stage } as never)
        .eq("id", id);
      if (error) throw error;
      return { id, closer_stage };
    },
    onMutate: async ({ id, closer_stage }) => {
      await queryClient.cancelQueries({ queryKey: ["closer-pipeline"] });
      const previous = queryClient.getQueriesData<CrmContact[]>({
        queryKey: ["closer-pipeline"],
      });
      queryClient.setQueriesData<CrmContact[]>(
        { queryKey: ["closer-pipeline"] },
        (old) =>
          old?.map((c) => (c.id === id ? { ...c, closer_stage } : c)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error("Erreur lors du deplacement");
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["closer-pipeline"] });

      // Auto-create commissions when closer marks as "close"
      if (result.closer_stage === "close") {
        try {
          const [contactResult, commResult] = await Promise.all([
            supabase
              .from("crm_contacts")
              .select("id, full_name, estimated_value, assigned_to, created_by, closer_id")
              .eq("id", result.id)
              .single(),
            supabase
              .from("commissions")
              .select("id", { count: "exact", head: true })
              .eq("sale_id", result.id),
          ]);

          const contact = contactResult.data as { id: string; full_name: string; estimated_value: number; assigned_to: string | null; created_by: string | null; closer_id: string | null } | null;
          if (!contact || !contact.estimated_value) return;
          if (commResult.count && commResult.count > 0) return;

          const saleAmount = Number(contact.estimated_value);
          if (saleAmount <= 0) return;

          const entries: Array<{
            sale_id: string;
            contractor_id: string;
            contractor_role: CommissionRole;
            sale_amount: number;
            commission_rate: number;
            commission_amount: number;
            percentage: number;
            amount: number;
          }> = [];

          // Closer commission (10%)
          if (contact.closer_id) {
            const rate = DEFAULT_COMMISSION_RATES.closer;
            const commAmount = Math.round(saleAmount * rate * 100) / 100;
            entries.push({
              sale_id: contact.id,
              contractor_id: contact.closer_id,
              contractor_role: "closer",
              sale_amount: saleAmount,
              commission_rate: rate,
              commission_amount: commAmount,
              percentage: rate * 100,
              amount: commAmount,
            });
          }

          // Setter commission (5%) — created_by is the setter
          if (contact.created_by && contact.created_by !== contact.closer_id) {
            const rate = DEFAULT_COMMISSION_RATES.setter;
            const commAmount = Math.round(saleAmount * rate * 100) / 100;
            entries.push({
              sale_id: contact.id,
              contractor_id: contact.created_by,
              contractor_role: "setter",
              sale_amount: saleAmount,
              commission_rate: rate,
              commission_amount: commAmount,
              percentage: rate * 100,
              amount: commAmount,
            });
          }

          if (entries.length > 0) {
            const { error: commError } = await supabase
              .from("commissions")
              .insert(entries as never);
            if (!commError) {
              queryClient.invalidateQueries({ queryKey: ["commissions"] });
              toast.success(
                `${entries.length} commission(s) creee(s) automatiquement`,
              );
            }
          }
        } catch (err) {
          console.error("Auto-commission error:", err);
        }
      }
    },
  });

  return {
    contacts: contactsQuery.data ?? [],
    isLoading: contactsQuery.isLoading,
    moveCloserStage,
  };
}

// ─── Assign Contact to Closer ───────────────────────────────

export function useAssignToCloser() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      closerId,
    }: {
      contactId: string;
      closerId: string;
    }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({
          closer_id: closerId,
          closer_stage: "a_appeler",
          stage: "closing",
        } as never)
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["closer-pipeline"] });
      toast.success("Lead assigne au closer");
    },
    onError: () => toast.error("Erreur lors de l'assignation"),
  });
}

// ─── Return contact from closer back to setter ──────────────

export function useReturnToSetter() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({
          closer_id: null,
          closer_stage: null,
          returned_by_closer: true,
          stage: "proposition",
        } as never)
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["closer-pipeline"] });
      toast.success("Lead retourne au setter");
    },
    onError: () => toast.error("Erreur lors du retour"),
  });
}

// ─── Claim unassigned prospect (setter takes ownership) ─────

export function useClaimProspect() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ assigned_to: user!.id } as never)
        .eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Prospect pris en charge");
    },
    onError: () => toast.error("Erreur"),
  });
}

// ─── Admin: Cancel a closed deal ────────────────────────────

export function useCancelDeal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      reason,
    }: {
      contactId: string;
      reason: string;
    }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({
          closer_stage: "perdu",
          lost_reason: reason,
        } as never)
        .eq("id", contactId);
      if (error) throw error;

      // Cancel related commissions
      await supabase
        .from("commissions")
        .update({ status: "cancelled" } as never)
        .eq("sale_id", contactId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closer-pipeline"] });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      toast.success("Deal annule");
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });
}

// ─── Available closers list ─────────────────────────────────

export function useAvailableClosers() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["available-closers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .eq("role", "closer");
      if (error) throw error;
      return data as Array<{
        id: string;
        full_name: string;
        avatar_url: string | null;
        email: string;
      }>;
    },
    enabled: !!user,
  });
}

// ─── Update Contact Stage ────────────────────────────────────

export function useUpdateContactStage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: PipelineStage }) => {
      const { error } = await supabase
        .from("crm_contacts")
        .update({ stage } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      toast.success("Étape mise à jour");
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
        } as never);
      if (interactionError) throw interactionError;

      // Update last_interaction_at and increment interaction_count on the contact
      const { data: currentContact } = await supabase
        .from("crm_contacts")
        .select("interaction_count")
        .eq("id", contact_id)
        .single();

      const cnt = (currentContact as { interaction_count: number } | null)?.interaction_count ?? 0;
      const { error: contactUpdateError } = await supabase
        .from("crm_contacts")
        .update({
          last_interaction_at: new Date().toISOString(),
          interaction_count: cnt + 1,
        } as never)
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
        .update({ lead_score } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour du score"),
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
        .upsert(payload as never, { onConflict: "call_id" })
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

// ─── Available Prospect Profiles (not yet in pipeline) ──────

type ProspectProfile = { id: string; full_name: string; email: string; avatar_url: string | null };

export function useAvailableProspectProfiles() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["available-prospect-profiles"],
    queryFn: async () => {
      // 1. Get all prospect profiles with completed onboarding
      const { data: prospects } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .eq("role", "prospect")
        .eq("onboarding_completed", true);

      // 2. Get profile IDs already linked to crm_contacts
      const { data: existing } = await supabase
        .from("crm_contacts")
        .select("converted_profile_id")
        .not("converted_profile_id", "is", null);

      const linkedIds = new Set(
        (existing ?? []).map((c: { converted_profile_id: string | null }) => c.converted_profile_id),
      );

      // 3. Return only prospects not already in pipeline
      return ((prospects ?? []) as ProspectProfile[]).filter((p) => !linkedIds.has(p.id));
    },
    enabled: !!user,
  });
}
