import { useAuth } from "@/hooks/use-auth";
import { canAccess } from "@/lib/permissions";
import type { AppRole } from "@/types/database";
import type { Module } from "@/lib/permissions";

export function useRole() {
  const { profile } = useAuth();
  const role = (profile?.role as AppRole) ?? null;

  function hasRole(target: AppRole): boolean {
    return role === target;
  }

  function checkAccess(module: Module): boolean {
    return canAccess(role, module);
  }

  return {
    role,
    hasRole,
    canAccess: checkAccess,
    isAdmin: role === "admin",
    isCoach: role === "coach",
    isClient: role === "client" || role === "prospect",
    isSetter: role === "setter",
    isCloser: role === "closer",
    isSales: role === "setter" || role === "closer",
    isProspect: role === "prospect",
  };
}
