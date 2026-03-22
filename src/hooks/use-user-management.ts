"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Profile } from "@/types/database";

export function useUserManagement() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const allUsersQuery = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as (Profile & {
        is_archived?: boolean;
        archived_at?: string | null;
      })[];
    },
    enabled: !!user,
  });

  const changeUserRole = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: string;
    }) => {
      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ role: newRole } as never)
        .eq("id", userId);
      if (profileError) throw profileError;

      // Update user_roles table
      const { error: roleError } = await supabase
        .from("user_roles")
        .update({ role: newRole } as never)
        .eq("user_id", userId);
      if (roleError) throw roleError;

      // Log audit
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "user.role_change",
          entity_type: "profile",
          entity_id: userId,
          details: { new_role: newRole },
          user_agent: navigator.userAgent,
        } as never);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Role mis a jour");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du changement de role");
    },
  });

  const archiveUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user!.id,
        } as never)
        .eq("id", userId);
      if (error) throw error;

      // Log audit
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        action: "user.archive",
        entity_type: "profile",
        entity_id: userId,
        details: {},
        user_agent: navigator.userAgent,
      } as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Utilisateur archive");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'archivage");
    },
  });

  const restoreUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          is_archived: false,
          archived_at: null,
          archived_by: null,
        } as never)
        .eq("id", userId);
      if (error) throw error;

      // Log audit
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        action: "user.restore",
        entity_type: "profile",
        entity_id: userId,
        details: {},
        user_agent: navigator.userAgent,
      } as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Utilisateur restaure");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la restauration");
    },
  });

  const offboardUser = useMutation({
    mutationFn: async ({
      userId,
      reassignCoachId,
    }: {
      userId: string;
      reassignCoachId?: string;
    }) => {
      // Reassign students if needed
      if (reassignCoachId) {
        const { error: reassignError } = await supabase
          .from("student_details")
          .update({ assigned_coach: reassignCoachId } as never)
          .eq("assigned_coach", userId);
        if (reassignError) throw reassignError;
      }

      // Archive the user
      const { error } = await supabase
        .from("profiles")
        .update({
          is_archived: true,
          archived_at: new Date().toISOString(),
          archived_by: user!.id,
        } as never)
        .eq("id", userId);
      if (error) throw error;

      // Log audit
      await supabase.from("audit_logs").insert({
        user_id: user!.id,
        action: "user.offboard",
        entity_type: "profile",
        entity_id: userId,
        details: {
          reassign_coach_id: reassignCoachId ?? null,
        },
        user_agent: navigator.userAgent,
      } as never);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Offboarding effectue avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'offboarding");
    },
  });

  return {
    users: allUsersQuery.data ?? [],
    isLoading: allUsersQuery.isLoading,
    changeUserRole,
    archiveUser,
    restoreUser,
    offboardUser,
  };
}

export function useCoaches() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, email")
        .in("role", ["admin", "coach"])
        .eq("is_archived", false)
        .order("full_name");
      if (error) throw error;
      return data as Pick<
        Profile,
        "id" | "full_name" | "avatar_url" | "email"
      >[];
    },
    enabled: !!user,
  });
}
