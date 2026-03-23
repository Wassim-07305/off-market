"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { CustomRole } from "@/types/database";

// ─── List all active custom roles ──────────────────────────

export function useCustomRoles() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["custom-roles"],
    queryFn: async () => {
      const { data: roles, error } = await supabase
        .from("custom_roles")
        .select("*")
        .eq("is_active", true)
        .order("is_system", { ascending: false })
        .order("name");
      if (error) throw error;

      // Get user counts per role
      const { data: profiles } = await supabase
        .from("profiles")
        .select("custom_role_id")
        .not("custom_role_id", "is", null);

      const countMap: Record<string, number> = {};
      for (const p of profiles ?? []) {
        const rid = (p as { custom_role_id: string }).custom_role_id;
        countMap[rid] = (countMap[rid] ?? 0) + 1;
      }

      return (roles as unknown as CustomRole[]).map((r) => ({
        ...r,
        permissions: Array.isArray(r.permissions)
          ? r.permissions
          : JSON.parse(r.permissions as unknown as string),
        user_count: countMap[r.id] ?? 0,
      }));
    },
    enabled: !!user,
  });
}

// ─── Get a single role's permissions ───────────────────────

export function useRolePermissions(roleId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["custom-role-permissions", roleId],
    queryFn: async () => {
      if (!roleId) return [];
      const { data, error } = await supabase
        .from("custom_roles")
        .select("permissions")
        .eq("id", roleId)
        .single();
      if (error) throw error;
      const perms = (data as unknown as { permissions: string[] }).permissions;
      return Array.isArray(perms)
        ? perms
        : JSON.parse(perms as unknown as string);
    },
    enabled: !!roleId,
  });
}

// ─── Create a custom role ──────────────────────────────────

export function useCreateRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      role: Omit<
        CustomRole,
        | "id"
        | "created_at"
        | "updated_at"
        | "is_system"
        | "created_by"
        | "user_count"
      >,
    ) => {
      const { data, error } = await supabase
        .from("custom_roles")
        .insert({
          ...role,
          created_by: user!.id,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      toast.success("Role créé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la creation du role");
    },
  });
}

// ─── Update a custom role ──────────────────────────────────

export function useUpdateRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CustomRole> & { id: string }) => {
      const { error } = await supabase
        .from("custom_roles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      toast.success("Role mis à jour");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });
}

// ─── Delete a custom role (non-system only) ────────────────

export function useDeleteRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      // Check no users assigned
      const { data: users } = await supabase
        .from("profiles")
        .select("id")
        .eq("custom_role_id", roleId)
        .limit(1);

      if (users && users.length > 0) {
        throw new Error(
          "Impossible de supprimer ce role : des utilisateurs y sont encore assignes",
        );
      }

      const { error } = await supabase
        .from("custom_roles")
        .delete()
        .eq("id", roleId)
        .eq("is_system", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      toast.success("Role supprime");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });
}

// ─── Assign a custom role to a user ────────────────────────

export function useAssignRole() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      roleId,
    }: {
      userId: string;
      roleId: string | null;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ custom_role_id: roleId } as never)
        .eq("id", userId);
      if (error) throw error;

      // Audit
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "user.custom_role_assign",
          entity_type: "profile",
          entity_id: userId,
          details: { custom_role_id: roleId },
          user_agent: navigator.userAgent,
        } as never);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-roles"] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      toast.success("Role assigne");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'assignation");
    },
  });
}
