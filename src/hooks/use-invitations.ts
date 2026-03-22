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
      specialties?: string[];
    }) => {
      const { data, error } = await (supabase as any)
        .from("user_invites")
        .insert({
          email: invite.email,
          full_name: invite.full_name,
          role: invite.role,
          invited_by: user!.id,
          specialties: invite.specialties ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      return data as UserInvite;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation creee avec succes");

      // Envoyer l'email d'invitation (silencieux en cas d'echec)
      try {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
        const inviteUrl = `${appUrl}/signup?invite=${data.invite_code}`;

        // Get inviter name from profile
        const { data: inviterProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user!.id)
          .single()
          .then(r => ({ data: r.data as { full_name: string } | null }));

        await fetch("/api/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: data.email,
            template: "invitation",
            data: {
              name: data.full_name,
              inviterName: inviterProfile?.full_name ?? "Off-Market",
              role: data.role,
              inviteUrl,
            },
          }),
        });
      } catch {
        // Echec silencieux — l'invitation est quand meme creee
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la creation");
    },
  });

  const createBulkInvitations = useMutation({
    mutationFn: async (invites: { email: string; full_name: string; role: string }[]) => {
      const results: UserInvite[] = [];
      for (const invite of invites) {
        const { data, error } = await (supabase as any)
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
        results.push(data as UserInvite);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitations creees avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'import");
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
    createBulkInvitations,
    deleteInvitation,
  };
}

export function useValidateInviteCode(code: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["validate-invite", code],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("validate_invite_code", {
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
