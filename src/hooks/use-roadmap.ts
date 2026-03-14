"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  ClientRoadmap,
  RoadmapMilestone,
  MilestoneStatus,
  GenerateRoadmapPayload,
  GenerateRoadmapResponse,
  GeneratedMilestone,
} from "@/types/roadmap";

// ─── Active roadmap for a client ─────────────────────────────

export function useClientRoadmap(clientId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  return useQuery({
    queryKey: ["client-roadmap", effectiveClientId],
    enabled: !!effectiveClientId,
    queryFn: async () => {
      const { data: roadmap, error } = await supabase
        .from("client_roadmaps")
        .select(
          "*, client:profiles!client_roadmaps_client_id_fkey(id, full_name, avatar_url)",
        )
        .eq("client_id", effectiveClientId!)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!roadmap) return null;

      // Fetch milestones
      const { data: milestones, error: milError } = await supabase
        .from("roadmap_milestones")
        .select("*")
        .eq("roadmap_id", roadmap.id)
        .order("order_index", { ascending: true });

      if (milError) throw milError;

      return {
        ...roadmap,
        milestones: milestones ?? [],
      } as ClientRoadmap & { milestones: RoadmapMilestone[] };
    },
  });
}

// ─── All roadmaps for a client (history) ─────────────────────

export function useClientRoadmaps(clientId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  return useQuery({
    queryKey: ["client-roadmaps", effectiveClientId],
    enabled: !!effectiveClientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_roadmaps")
        .select(
          "*, client:profiles!client_roadmaps_client_id_fkey(id, full_name, avatar_url)",
        )
        .eq("client_id", effectiveClientId!)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClientRoadmap[];
    },
  });
}

// ─── Create roadmap (manual) ─────────────────────────────────

export function useCreateRoadmap() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientId,
      title,
      description,
      milestones,
      generatedFrom = "manual",
      sourceCallId,
    }: {
      clientId: string;
      title: string;
      description?: string;
      milestones: Omit<GeneratedMilestone, "order_index">[];
      generatedFrom?: "kickoff_call" | "manual" | "ai_suggestion";
      sourceCallId?: string;
    }) => {
      if (!user) throw new Error("Non authentifie");

      // Deactivate current roadmaps for this client
      await supabase
        .from("client_roadmaps")
        .update({ is_active: false })
        .eq("client_id", clientId)
        .eq("is_active", true);

      // Create roadmap
      const { data: roadmap, error: roadmapError } = await supabase
        .from("client_roadmaps")
        .insert({
          client_id: clientId,
          title,
          description: description ?? null,
          generated_from: generatedFrom,
          source_call_id: sourceCallId ?? null,
          created_by: user.id,
        })
        .select()
        .single();

      if (roadmapError) throw roadmapError;

      // Create milestones
      const milestonesData = milestones.map((m, i) => ({
        roadmap_id: roadmap.id,
        title: m.title,
        description: m.description ?? null,
        validation_criteria: m.validation_criteria ?? [],
        order_index: i,
      }));

      const { error: milError } = await supabase
        .from("roadmap_milestones")
        .insert(milestonesData);

      if (milError) throw milError;

      return roadmap as ClientRoadmap;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-roadmap", variables.clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["client-roadmaps", variables.clientId],
      });
      toast.success("Roadmap creee avec succes");
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la roadmap");
    },
  });
}

// ─── Generate roadmap via AI ─────────────────────────────────

export function useGenerateRoadmap() {
  return useMutation({
    mutationFn: async (
      payload: GenerateRoadmapPayload,
    ): Promise<GenerateRoadmapResponse> => {
      const res = await fetch("/api/ai/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur de generation");
      }

      return res.json();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la generation IA");
    },
  });
}

// ─── Update milestone ────────────────────────────────────────

export function useUpdateMilestone() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<RoadmapMilestone> & { id: string }) => {
      const { error } = await supabase
        .from("roadmap_milestones")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["client-roadmaps"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du jalon");
    },
  });
}

// ─── Complete milestone ──────────────────────────────────────

export function useCompleteMilestone() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      notes,
    }: {
      id: string;
      notes?: string;
    }) => {
      if (!user) throw new Error("Non authentifie");

      const { error } = await supabase
        .from("roadmap_milestones")
        .update({
          status: "completed" as MilestoneStatus,
          completed_at: new Date().toISOString(),
          completed_by: user.id,
          notes: notes ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["client-roadmaps"] });
      toast.success("Jalon valide !");
    },
    onError: () => {
      toast.error("Erreur lors de la validation du jalon");
    },
  });
}

// ─── Deactivate roadmap ──────────────────────────────────────

export function useDeactivateRoadmap() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roadmapId: string) => {
      const { error } = await supabase
        .from("client_roadmaps")
        .update({ is_active: false })
        .eq("id", roadmapId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-roadmap"] });
      queryClient.invalidateQueries({ queryKey: ["client-roadmaps"] });
      toast.success("Roadmap desactivee");
    },
  });
}
