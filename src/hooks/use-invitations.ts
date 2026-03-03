"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { UserInvite } from "@/types/invitations";

export function useInvitations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invitationsQuery = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_invites")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserInvite[];
    },
    enabled: !!user,
  });

  const createInvitation = useMutation({
    mutationFn: async (invite: {
      email: string;
      full_name: string;
      role: string;
    }) => {
      const { data, error } = await supabase
        .from("user_invites")
        .insert({
          email: invite.email,
          full_name: invite.full_name,
          role: invite.role,
          invited_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as UserInvite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation creee avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la creation");
    },
  });

  const deleteInvitation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("user_invites")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation supprimee");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    invitations: invitationsQuery.data ?? [],
    isLoading: invitationsQuery.isLoading,
    error: invitationsQuery.error,
    createInvitation,
    deleteInvitation,
  };
}

export function useValidateInviteCode(code: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["validate-invite", code],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("validate_invite_code", {
        code: code!,
      });
      if (error) throw error;
      return data as {
        valid: boolean;
        email?: string;
        full_name?: string;
        role?: string;
      };
    },
    enabled: !!code,
  });
}
