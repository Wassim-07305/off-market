import type { AppRole } from "@/types/database";

export type Module =
  | "dashboard"
  | "messaging"
  | "formations"
  | "eleves"
  | "pipeline"
  | "calendrier"
  | "activite"
  | "finances"
  | "users"
  | "notifications"
  | "settings"
  | "analytics"
  | "closer-calls"
  | "social-content"
  | "instagram"
  | "clients"
  | "rituals"
  | "journal"
  | "gamification"
  | "forms"
  | "coaching"
  | "assistant"
  | "feed"
  | "contracts"
  | "documentation"
  | "billing"
  | "invitations"
  | "resources"
  | "school"
  | "community"
  | "hall-of-fame"
  | "audit"
  | "faq"
  | "upsell"
  | "roadmap";

const PERMISSIONS: Record<Module, AppRole[]> = {
  dashboard: ["admin", "coach", "client", "setter", "closer"],
  messaging: ["admin", "coach", "client", "setter", "closer"],
  formations: ["admin", "coach", "client"],
  eleves: ["admin", "coach"],
  pipeline: ["admin", "setter", "closer"],
  calendrier: ["admin", "coach"],
  activite: ["admin", "setter", "closer"],
  finances: ["admin"],
  users: ["admin"],
  notifications: ["admin", "coach", "client", "setter", "closer"],
  settings: ["admin", "coach", "client", "setter", "closer"],
  analytics: ["admin"],
  "closer-calls": ["admin", "closer"],
  "social-content": ["admin", "coach"],
  instagram: ["admin", "coach"],
  clients: ["admin", "coach"],
  rituals: ["admin", "coach", "client"],
  journal: ["admin", "coach", "client"],
  gamification: ["admin", "coach", "client"],
  forms: ["admin", "coach"],
  coaching: ["admin", "coach"],
  assistant: ["admin", "coach", "client"],
  feed: ["admin", "coach", "client"],
  contracts: ["admin", "setter", "closer"],
  documentation: ["admin", "coach", "client"],
  billing: ["admin"],
  invitations: ["admin"],
  resources: ["admin", "coach", "client", "setter", "closer"],
  school: ["admin", "coach", "client"],
  community: ["admin", "coach", "client"],
  "hall-of-fame": ["admin", "coach", "client"],
  audit: ["admin"],
  faq: ["admin", "coach"],
  upsell: ["admin"],
  roadmap: ["admin", "coach", "client"],
};

export function canAccess(role: AppRole | null, module: Module): boolean {
  if (!role) return false;
  return PERMISSIONS[module].includes(role);
}

export function getAccessibleModules(role: AppRole | null): Module[] {
  if (!role) return [];
  return (Object.keys(PERMISSIONS) as Module[]).filter((module) =>
    PERMISSIONS[module].includes(role),
  );
}

// ─── Custom role helpers (dynamic, DB-backed) ──────────────

/**
 * Check if a list of custom role permissions includes a given module.
 * Falls back to the static PERMISSIONS matrix if no custom permissions provided.
 */
export function canAccessWithCustomRole(
  role: AppRole | null,
  module: Module,
  customPermissions?: string[] | null,
): boolean {
  // If custom permissions are provided, use them
  if (customPermissions && customPermissions.length > 0) {
    return customPermissions.includes(module);
  }
  // Otherwise fall back to static matrix
  return canAccess(role, module);
}

/**
 * Get all accessible modules from custom permissions,
 * falling back to the static matrix.
 */
export function getAccessibleModulesWithCustomRole(
  role: AppRole | null,
  customPermissions?: string[] | null,
): Module[] {
  if (customPermissions && customPermissions.length > 0) {
    return customPermissions.filter((p) =>
      (Object.keys(PERMISSIONS) as Module[]).includes(p as Module),
    ) as Module[];
  }
  return getAccessibleModules(role);
}

/** All available modules (useful for role manager UI) */
export const ALL_MODULE_SLUGS: Module[] = Object.keys(PERMISSIONS) as Module[];
