"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface PreCallResponse {
  id: string;
  call_id: string;
  user_id: string;
  objective: string;
  tried_solutions: string;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch pre-call responses for a given call.
 * Returns all responses (for coaches/admins) or just the user's own (for clients).
 */
export function usePreCallResponses(callId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["pre-call-responses", callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pre_call_answers")
        .select("*")
        .eq("call_id", callId!);
      if (error) throw error;
      return data as PreCallResponse[];
    },
    enabled: !!user && !!callId,
  });

  return {
    responses: query.data ?? [],
    isLoading: query.isLoading,
    /** Convenience: the current user's response (if any) */
    myResponse: query.data?.find((r) => r.user_id === user?.id) ?? null,
    /** Whether the current user has already answered */
    hasAnswered: query.data?.some((r) => r.user_id === user?.id) ?? false,
  };
}

/**
 * Mutation to submit (upsert) the user's pre-call answers for a given call.
 */
export function useSubmitPreCallResponse() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      callId,
      objective,
      triedSolutions,
    }: {
      callId: string;
      objective: string;
      triedSolutions: string;
    }) => {
      if (!user) throw new Error("Non authentifie");

      const { data, error } = await supabase
        .from("pre_call_answers")
        .upsert(
          {
            call_id: callId,
            user_id: user.id,
            objective,
            tried_solutions: triedSolutions,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "call_id,user_id" },
        )
        .select()
        .single();

      if (error) throw error;
      return data as PreCallResponse;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pre-call-responses", variables.callId],
      });
      toast.success("Reponses enregistrees");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement des reponses");
    },
  });
}
