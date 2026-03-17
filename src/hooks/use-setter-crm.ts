"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  PipelineColumn,
  SetterLead,
  SetterActivity,
} from "@/types/setter-crm";
import { DEFAULT_PIPELINE_COLUMNS } from "@/types/setter-crm";

// ─── Pipeline Columns ─────────────────────────────────────────

export function usePipelineColumns(clientId?: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const columnsQuery = useQuery({
    queryKey: ["pipeline-columns", clientId],
    queryFn: async () => {
      let query = supabase
        .from("pipeline_columns")
        .select("*")
        .order("position", { ascending: true });

      if (clientId) {
        query = query.eq("client_id", clientId);
      } else {
        query = query.is("client_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Auto-seed les colonnes par defaut si vide
      if (!data || data.length === 0) {
        const toInsert = DEFAULT_PIPELINE_COLUMNS.map((col) => ({
          ...col,
          client_id: clientId ?? null,
        }));

        const { data: seeded, error: seedError } = await supabase
          .from("pipeline_columns")
          .insert(toInsert)
          .select("*")
          .order("position", { ascending: true });

        if (seedError) throw seedError;
        return (seeded ?? []) as PipelineColumn[];
      }

      return data as PipelineColumn[];
    },
    enabled: !!user,
  });

  return {
    columns: columnsQuery.data ?? [],
    isLoading: columnsQuery.isLoading,
    refetch: columnsQuery.refetch,
  };
}

export function useCreatePipelineColumn() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      column: Pick<PipelineColumn, "name" | "color" | "position"> & {
        client_id?: string | null;
        is_terminal?: boolean;
      },
    ) => {
      const { data, error } = await supabase
        .from("pipeline_columns")
        .insert(column)
        .select()
        .single();
      if (error) throw error;
      return data as PipelineColumn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-columns"] });
      toast.success("Colonne ajoutee");
    },
    onError: () => toast.error("Erreur lors de la creation de la colonne"),
  });
}

export function useUpdatePipelineColumn() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<PipelineColumn> & { id: string }) => {
      const { error } = await supabase
        .from("pipeline_columns")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-columns"] });
      toast.success("Colonne mise a jour");
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });
}

export function useDeletePipelineColumn() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("pipeline_columns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-columns"] });
      toast.success("Colonne supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useReorderPipelineColumns() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columns: { id: string; position: number }[]) => {
      // Mise a jour en batch via Promise.all
      const updates = columns.map(({ id, position }) =>
        supabase.from("pipeline_columns").update({ position }).eq("id", id),
      );
      const results = await Promise.all(updates);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const failed = results.find((r: any) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-columns"] });
    },
    onError: () => toast.error("Erreur lors du reordonnancement"),
  });
}

// ─── Setter Leads ─────────────────────────────────────────────

interface SetterLeadFilters {
  setterId?: string;
  clientId?: string;
  columnId?: string;
}

export function useSetterLeads(filters?: SetterLeadFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const { user } = useAuth();

  const leadsQuery = useQuery({
    queryKey: ["setter-leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("setter_leads")
        .select("*")
        .order("updated_at", { ascending: false });

      if (filters?.setterId) {
        query = query.eq("setter_id", filters.setterId);
      }
      if (filters?.clientId) {
        query = query.eq("client_id", filters.clientId);
      }
      if (filters?.columnId) {
        query = query.eq("column_id", filters.columnId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SetterLead[];
    },
    enabled: !!user,
  });

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    refetch: leadsQuery.refetch,
  };
}

export function useCreateSetterLead() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      lead: Omit<
        SetterLead,
        "id" | "created_at" | "updated_at" | "setter_id"
      > & {
        setter_id?: string;
      },
    ) => {
      const { data, error } = await supabase
        .from("setter_leads")
        .insert({ ...lead, setter_id: lead.setter_id ?? user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as SetterLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setter-leads"] });
      toast.success("Lead ajoute");
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(`Erreur: ${msg}`);
    },
  });
}

export function useUpdateSetterLead() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<SetterLead> & { id: string }) => {
      const { error } = await supabase
        .from("setter_leads")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setter-leads"] });
      toast.success("Lead mis a jour");
    },
    onError: () => toast.error("Erreur lors de la mise a jour du lead"),
  });
}

export function useDeleteSetterLead() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("setter_leads")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setter-leads"] });
      toast.success("Lead supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useMoveSetterLeadToColumn() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      columnId,
    }: {
      id: string;
      columnId: string | null;
    }) => {
      const { error } = await supabase
        .from("setter_leads")
        .update({ column_id: columnId, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setter-leads"] });
    },
    onError: () => toast.error("Erreur lors du deplacement du lead"),
  });
}

// ─── Setter Activities (Bilan) ────────────────────────────────

interface SetterActivityFilters {
  userId?: string;
  clientId?: string;
}

export function useSetterActivities(filters?: SetterActivityFilters) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const { user } = useAuth();

  const activitiesQuery = useQuery({
    queryKey: ["setter-activities", filters],
    queryFn: async () => {
      let query = supabase
        .from("setter_activities")
        .select("*")
        .order("date", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }
      if (filters?.clientId) {
        query = query.eq("client_id", filters.clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SetterActivity[];
    },
    enabled: !!user,
  });

  return {
    activities: activitiesQuery.data ?? [],
    isLoading: activitiesQuery.isLoading,
    refetch: activitiesQuery.refetch,
  };
}

export function useCreateSetterActivity() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      activity: Omit<SetterActivity, "id" | "created_at" | "user_id"> & {
        user_id?: string;
      },
    ) => {
      const { data, error } = await supabase
        .from("setter_activities")
        .insert({ ...activity, user_id: activity.user_id ?? user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as SetterActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["setter-activities"] });
      queryClient.invalidateQueries({ queryKey: ["setter-stats"] });
      toast.success("Activite enregistree");
    },
    onError: () => toast.error("Erreur lors de l'enregistrement"),
  });
}

// ─── Setter Stats ─────────────────────────────────────────────

interface SetterStats {
  semaine: {
    dms_sent: number;
    followups_sent: number;
    links_sent: number;
    calls_booked: number;
  };
  mois: {
    dms_sent: number;
    followups_sent: number;
    links_sent: number;
    calls_booked: number;
  };
}

export function useSetterStats(userId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const { user } = useAuth();
  const targetUserId = userId ?? user?.id;

  return useQuery({
    queryKey: ["setter-stats", targetUserId],
    queryFn: async () => {
      const now = new Date();

      // Debut de la semaine (lundi)
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - diffToMonday);
      weekStart.setHours(0, 0, 0, 0);

      // Debut du mois
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [weekResult, monthResult] = await Promise.all([
        supabase
          .from("setter_activities")
          .select("dms_sent, followups_sent, links_sent, calls_booked")
          .eq("user_id", targetUserId!)
          .gte("date", weekStart.toISOString().split("T")[0]),
        supabase
          .from("setter_activities")
          .select("dms_sent, followups_sent, links_sent, calls_booked")
          .eq("user_id", targetUserId!)
          .gte("date", monthStart.toISOString().split("T")[0]),
      ]);

      if (weekResult.error) throw weekResult.error;
      if (monthResult.error) throw monthResult.error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sumFields = (rows: any[]) => ({
        dms_sent: rows.reduce((s: number, r: any) => s + (r.dms_sent ?? 0), 0),
        followups_sent: rows.reduce(
          (s: number, r: any) => s + (r.followups_sent ?? 0),
          0,
        ),
        links_sent: rows.reduce(
          (s: number, r: any) => s + (r.links_sent ?? 0),
          0,
        ),
        calls_booked: rows.reduce(
          (s: number, r: any) => s + (r.calls_booked ?? 0),
          0,
        ),
      });

      return {
        semaine: sumFields(weekResult.data ?? []),
        mois: sumFields(monthResult.data ?? []),
      } as SetterStats;
    },
    enabled: !!targetUserId,
  });
}
