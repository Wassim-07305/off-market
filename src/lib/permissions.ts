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
  | "hall-of-fame";

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
