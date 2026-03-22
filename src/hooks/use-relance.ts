"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  RelanceSequence,
  RelanceStep,
  RelanceEnrollment,
  RelanceLog,
  RelanceChannel,
  EnrollmentStatus,
} from "@/types/relance";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

// ─── Sequences ───────────────────────────────────────────

export function useRelanceSequences() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const { user } = useAuth();

  return useQuery({
    queryKey: ["relance-sequences"],
    queryFn: async () => {
      // Fetch sequences
      const { data: sequences, error } = await sb
        .from("relance_sequences")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch step counts per sequence
      const { data: steps } = await sb
        .from("relance_steps")
        .select("sequence_id");

      // Fetch enrollment counts per sequence
      const { data: enrollments } = await sb
        .from("relance_enrollments")
        .select("sequence_id")
        .eq("status", "active");

      const stepCounts = new Map<string, number>();
      const enrollCounts = new Map<string, number>();

      steps?.forEach((s: any) => {
        stepCounts.set(s.sequence_id, (stepCounts.get(s.sequence_id) ?? 0) + 1);
      });
      enrollments?.forEach((e: any) => {
        enrollCounts.set(
          e.sequence_id,
          (enrollCounts.get(e.sequence_id) ?? 0) + 1,
        );
      });

      return (sequences as RelanceSequence[]).map((seq) => ({
        ...seq,
        step_count: stepCounts.get(seq.id) ?? 0,
        enrollment_count: enrollCounts.get(seq.id) ?? 0,
      }));
    },
    enabled: !!user,
  });
}

export function useRelanceSequence(id: string | null) {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const { user } = useAuth();

  return useQuery({
    queryKey: ["relance-sequence", id],
    queryFn: async () => {
      const { data: sequence, error } = await sb
        .from("relance_sequences")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;

      const { data: steps, error: stepsError } = await sb
        .from("relance_steps")
        .select("*")
        .eq("sequence_id", id!)
        .order("step_order", { ascending: true });
      if (stepsError) throw stepsError;

      return {
        ...sequence,
        steps: steps as RelanceStep[],
      } as RelanceSequence;
    },
    enabled: !!id && !!user,
  });
}

export function useCreateSequence() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      target_stage: string;
      steps?: Array<{
        delay_days: number;
        channel: RelanceChannel;
        subject?: string;
        content: string;
      }>;
    }) => {
      const { steps, ...sequenceData } = data;

      const { data: sequence, error } = await sb
        .from("relance_sequences")
        .insert({ ...sequenceData, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;

      if (steps?.length) {
        const stepsPayload = steps.map((step, idx) => ({
          sequence_id: sequence.id,
          step_order: idx + 1,
          delay_days: step.delay_days,
          channel: step.channel,
          subject: step.subject || null,
          content: step.content,
        }));

        const { error: stepsError } = await sb
          .from("relance_steps")
          .insert(stepsPayload);
        if (stepsError) throw stepsError;
      }

      return sequence as RelanceSequence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      toast.success("Sequence creee");
    },
    onError: () => toast.error("Erreur lors de la creation de la sequence"),
  });
}

export function useUpdateSequence() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<RelanceSequence> & { id: string }) => {
      const { error } = await sb
        .from("relance_sequences")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      queryClient.invalidateQueries({
        queryKey: ["relance-sequence", variables.id],
      });
      toast.success("Sequence mise a jour");
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });
}

export function useDeleteSequence() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb
        .from("relance_sequences")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      toast.success("Sequence supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

// ─── Steps ───────────────────────────────────────────────

export function useAddStep() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      sequence_id: string;
      step_order: number;
      delay_days: number;
      channel: RelanceChannel;
      subject?: string;
      content: string;
    }) => {
      // Shift existing steps if inserting in the middle
      const { data: existingSteps } = await sb
        .from("relance_steps")
        .select("id, step_order")
        .eq("sequence_id", data.sequence_id)
        .gte("step_order", data.step_order)
        .order("step_order", { ascending: false });

      if (existingSteps?.length) {
        for (const step of existingSteps) {
          await sb
            .from("relance_steps")
            .update({ step_order: step.step_order + 1 })
            .eq("id", step.id);
        }
      }

      const { data: step, error } = await sb
        .from("relance_steps")
        .insert({
          sequence_id: data.sequence_id,
          step_order: data.step_order,
          delay_days: data.delay_days,
          channel: data.channel,
          subject: data.subject || null,
          content: data.content,
        })
        .select()
        .single();
      if (error) throw error;
      return step as RelanceStep;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["relance-sequence", variables.sequence_id],
      });
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      toast.success("Etape ajoutee");
    },
    onError: () => toast.error("Erreur lors de l'ajout de l'etape"),
  });
}

export function useUpdateStep() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      sequence_id,
      ...updates
    }: Partial<RelanceStep> & { id: string; sequence_id: string }) => {
      const { error } = await sb
        .from("relance_steps")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return { sequence_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["relance-sequence", result.sequence_id],
      });
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      toast.success("Etape mise a jour");
    },
    onError: () => toast.error("Erreur lors de la mise a jour de l'etape"),
  });
}

export function useDeleteStep() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      sequence_id,
    }: {
      id: string;
      sequence_id: string;
    }) => {
      // Get the step to know its order
      const { data: step } = await sb
        .from("relance_steps")
        .select("step_order")
        .eq("id", id)
        .single();

      const { error } = await sb
        .from("relance_steps")
        .delete()
        .eq("id", id);
      if (error) throw error;

      // Reorder remaining steps
      if (step) {
        const { data: remaining } = await sb
          .from("relance_steps")
          .select("id, step_order")
          .eq("sequence_id", sequence_id)
          .gt("step_order", step.step_order)
          .order("step_order", { ascending: true });

        if (remaining?.length) {
          for (const s of remaining) {
            await sb
              .from("relance_steps")
              .update({ step_order: s.step_order - 1 })
              .eq("id", s.id);
          }
        }
      }

      return { sequence_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["relance-sequence", result.sequence_id],
      });
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      toast.success("Etape supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression de l'etape"),
  });
}

// ─── Enrollments ─────────────────────────────────────────

export function useEnrollContact() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      contact_id,
      sequence_id,
    }: {
      contact_id: string;
      sequence_id: string;
    }) => {
      // Get the first step to calculate next_step_at
      const { data: firstStep } = await sb
        .from("relance_steps")
        .select("delay_days")
        .eq("sequence_id", sequence_id)
        .eq("is_active", true)
        .order("step_order", { ascending: true })
        .limit(1)
        .single();

      const nextStepAt = firstStep
        ? new Date(
            Date.now() + firstStep.delay_days * 24 * 60 * 60 * 1000,
          ).toISOString()
        : null;

      const { data, error } = await sb
        .from("relance_enrollments")
        .insert({
          contact_id,
          sequence_id,
          current_step: 0,
          status: "active",
          next_step_at: nextStepAt,
          enrolled_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as RelanceEnrollment;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contact-enrollments", variables.contact_id],
      });
      queryClient.invalidateQueries({ queryKey: ["relance-sequences"] });
      queryClient.invalidateQueries({ queryKey: ["relance-stats"] });
      toast.success("Contact inscrit a la sequence");
    },
    onError: (err: unknown) => {
      const pg = err as { code?: string };
      if (pg?.code === "23505") {
        toast.error("Ce contact est deja inscrit a cette sequence");
      } else {
        toast.error("Erreur lors de l'inscription");
      }
    },
  });
}

export function usePauseEnrollment() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await sb
        .from("relance_enrollments")
        .update({ status: "paused" as EnrollmentStatus })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["relance-stats"] });
      toast.success("Sequence mise en pause");
    },
    onError: () => toast.error("Erreur lors de la mise en pause"),
  });
}

export function useResumeEnrollment() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await sb
        .from("relance_enrollments")
        .update({ status: "active" as EnrollmentStatus })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["relance-stats"] });
      toast.success("Sequence reprise");
    },
    onError: () => toast.error("Erreur lors de la reprise"),
  });
}

export function useCancelEnrollment() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await sb
        .from("relance_enrollments")
        .update({ status: "cancelled" as EnrollmentStatus })
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["relance-stats"] });
      toast.success("Sequence annulee");
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });
}

export function useContactEnrollments(contactId: string | null) {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contact-enrollments", contactId],
    queryFn: async () => {
      const { data, error } = await sb
        .from("relance_enrollments")
        .select("*, sequence:relance_sequences(*)")
        .eq("contact_id", contactId!)
        .order("enrolled_at", { ascending: false });
      if (error) throw error;
      return data as RelanceEnrollment[];
    },
    enabled: !!contactId && !!user,
  });
}

export function useEnrollmentLogs(enrollmentId: string | null) {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const { user } = useAuth();

  return useQuery({
    queryKey: ["enrollment-logs", enrollmentId],
    queryFn: async () => {
      const { data, error } = await sb
        .from("relance_logs")
        .select("*, step:relance_steps(*)")
        .eq("enrollment_id", enrollmentId!)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data as RelanceLog[];
    },
    enabled: !!enrollmentId && !!user,
  });
}

// ─── Stats ───────────────────────────────────────────────

export function useRelanceStats() {
  const supabase = useSupabase();
  const sb = supabase as AnySupabase;
  const { user } = useAuth();

  return useQuery({
    queryKey: ["relance-stats"],
    queryFn: async () => {
      const [
        { count: activeEnrollments },
        { count: totalSent },
        { count: totalOpened },
        { count: totalSequences },
      ] = await Promise.all([
        sb
          .from("relance_enrollments")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        sb
          .from("relance_logs")
          .select("id", { count: "exact", head: true })
          .eq("status", "sent"),
        sb
          .from("relance_logs")
          .select("id", { count: "exact", head: true })
          .eq("status", "opened"),
        sb
          .from("relance_sequences")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
      ]);

      const sent = totalSent ?? 0;
      const opened = totalOpened ?? 0;

      return {
        active_enrollments: activeEnrollments ?? 0,
        total_sent: sent,
        open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        total_sequences: totalSequences ?? 0,
      };
    },
    enabled: !!user,
  });
}
