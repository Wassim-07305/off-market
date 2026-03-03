import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GraduationCap,
  FileText,
  Bot,
  BarChart3,
  CreditCard,
  Receipt,
  UserPlus,
  Rss,
  ClipboardCheck,
  BookOpen,
  Target,
  Bell,
  Video,
  Trophy,
  Flame,
  Crown,
  Phone,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

/** Admin / Fondateur */
export const adminNavigation: NavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "CRM", href: "/admin/crm", icon: Users },
  { name: "Messagerie", href: "/admin/messaging", icon: MessageSquare },
  { name: "Formation", href: "/admin/school", icon: GraduationCap },
  { name: "Formulaires", href: "/admin/forms", icon: FileText },
  { name: "Facturation", href: "/admin/billing", icon: CreditCard },
  { name: "Onboarding", href: "/admin/onboarding", icon: UserPlus },
  { name: "Feed", href: "/admin/feed", icon: Rss },
  { name: "Appels", href: "/admin/calls", icon: Phone },
  { name: "Assistant IA", href: "/admin/ai", icon: Bot },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

/** Coach / CSM */
export const coachNavigation: NavItem[] = [
  { name: "Dashboard", href: "/coach/dashboard", icon: LayoutDashboard },
  { name: "CRM", href: "/coach/crm", icon: Users },
  { name: "Messagerie", href: "/coach/messaging", icon: MessageSquare },
  { name: "Formation", href: "/coach/school", icon: GraduationCap },
  { name: "Feed", href: "/coach/feed", icon: Rss },
  { name: "Check-ins", href: "/coach/checkins", icon: ClipboardCheck },
  { name: "Alertes", href: "/coach/alerts", icon: Bell },
  { name: "Seances", href: "/coach/sessions", icon: Video },
  { name: "Appels", href: "/coach/calls", icon: Phone },
];

/** Sales (Setter + Closer) */
export const salesNavigation: NavItem[] = [
  { name: "Dashboard", href: "/sales/dashboard", icon: LayoutDashboard },
  { name: "Messagerie", href: "/sales/messaging", icon: MessageSquare },
  { name: "Appels", href: "/sales/calls", icon: Phone },
];

/** Client / Freelance */
export const clientNavigation: NavItem[] = [
  { name: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { name: "Formation", href: "/client/school", icon: GraduationCap },
  { name: "Messagerie", href: "/client/messaging", icon: MessageSquare },
  { name: "Formulaires", href: "/client/forms", icon: FileText },
  { name: "Factures", href: "/client/invoices", icon: Receipt },
  { name: "Feed", href: "/client/feed", icon: Rss },
  { name: "Check-in", href: "/client/checkin", icon: ClipboardCheck },
  { name: "Journal", href: "/client/journal", icon: BookOpen },
  { name: "Objectifs", href: "/client/goals", icon: Target },
  { name: "Progression", href: "/client/progress", icon: Trophy },
  { name: "Defis", href: "/client/challenges", icon: Flame },
  { name: "Classement", href: "/client/leaderboard", icon: Crown },
  { name: "Appels", href: "/client/calls", icon: Phone },
];

export type RoleVariant = "admin" | "coach" | "sales" | "client";

export function getNavigationForRole(variant: RoleVariant): NavItem[] {
  switch (variant) {
    case "admin":
      return adminNavigation;
    case "coach":
      return coachNavigation;
    case "sales":
      return salesNavigation;
    case "client":
      return clientNavigation;
  }
}

/** Mobile nav shows max 5 items */
export function getMobileNavForRole(variant: RoleVariant): NavItem[] {
  return getNavigationForRole(variant).slice(0, 5);
}

/** Where each role lands after login */
export function getDefaultRouteForRole(role: string): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "coach":
      return "/coach/dashboard";
    case "setter":
    case "closer":
      return "/sales/dashboard";
    case "client":
      return "/client/dashboard";
    default:
      return "/login";
  }
}

/** Which route prefix is allowed for a given role */
export function getRoutePrefix(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "coach":
      return "/coach";
    case "setter":
    case "closer":
      return "/sales";
    case "client":
      return "/client";
    default:
      return "";
  }
}
