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
  Gift,
  Phone,
  Send,
  CalendarCheck,
  Calendar,
  Clock,
  Kanban,
  Award,
  FolderOpen,
  FileSignature,
  Contact,
  Star,
  Map,
  TrendingUp,
  UserCog,
  Palette,
  PhoneCall,
  Presentation,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  section?: string;
}

/** Admin / Fondateur */
export const adminNavigation: NavItem[] = [
  // ── Pilotage ──
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    section: "Pilotage",
  },
  { name: "CRM", href: "/admin/crm", icon: Kanban },
  { name: "Clients", href: "/admin/clients", icon: Contact },
  { name: "Appels & Lives", href: "/admin/calls", icon: Phone },
  { name: "Messagerie", href: "/admin/messaging", icon: MessageSquare },
  { name: "Finances", href: "/admin/analytics", icon: BarChart3 },

  // ── Contenu ──
  {
    name: "Formation",
    href: "/admin/school",
    icon: GraduationCap,
    section: "Contenu",
  },
  { name: "Feed", href: "/admin/feed", icon: Rss },
  { name: "Ressources", href: "/admin/resources", icon: FolderOpen },
  { name: "AlexIA", href: "/admin/ai", icon: Bot },
  { name: "Formulaires", href: "/admin/forms", icon: FileText },

  // ── Business ──
  {
    name: "Booking",
    href: "/admin/booking",
    icon: CalendarCheck,
    section: "Business",
  },
  { name: "Closer Calls", href: "/admin/closer-calls", icon: PhoneCall },
  { name: "Facturation", href: "/admin/billing", icon: CreditCard },

  // ── Administration ──
  {
    name: "Equipe",
    href: "/admin/csm",
    icon: UserCog,
    section: "Administration",
  },
  { name: "Invitations", href: "/admin/invitations", icon: Send },
  { name: "Gamification", href: "/admin/rewards", icon: Trophy },
  { name: "Miro", href: "/admin/miro", icon: Presentation },
];

/** Coach / CSM */
export const coachNavigation: NavItem[] = [
  // ── Pilotage ──
  {
    name: "Dashboard",
    href: "/coach/dashboard",
    icon: LayoutDashboard,
    section: "Pilotage",
  },
  { name: "CRM", href: "/coach/crm", icon: Users },
  { name: "Appels & Lives", href: "/coach/calls", icon: Phone },
  { name: "Messagerie", href: "/coach/messaging", icon: MessageSquare },
  { name: "Check-ins", href: "/coach/checkins", icon: ClipboardCheck },

  // ── Contenu ──
  {
    name: "Formation",
    href: "/coach/school",
    icon: GraduationCap,
    section: "Contenu",
  },
  { name: "Feed", href: "/coach/feed", icon: Rss },
  { name: "Communaute", href: "/coach/community", icon: Users },
  { name: "Ressources", href: "/coach/resources", icon: FolderOpen },

  // ── Gestion ──
  { name: "Alertes", href: "/coach/alerts", icon: Bell, section: "Gestion" },
  { name: "Seances", href: "/coach/sessions", icon: Video },
];

/** Sales (Setter + Closer) */
export const salesNavigation: NavItem[] = [
  { name: "Dashboard", href: "/sales/dashboard", icon: LayoutDashboard },
  { name: "Pipeline", href: "/sales/pipeline", icon: Kanban },
  { name: "Commissions", href: "/sales/commissions", icon: Receipt },
  { name: "Messagerie", href: "/sales/messaging", icon: MessageSquare },
  { name: "Appels", href: "/sales/calls", icon: Phone },
  { name: "Ressources", href: "/sales/resources", icon: FolderOpen },
];

/** Client / Freelance */
export const clientNavigation: NavItem[] = [
  // ── Mon Espace ──
  {
    name: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard,
    section: "Mon Espace",
  },
  { name: "Formation", href: "/client/school", icon: GraduationCap },
  { name: "Suivi", href: "/client/suivi", icon: ClipboardCheck },

  // ── Business ──
  { name: "CRM", href: "/client/crm", icon: Kanban, section: "Business" },
  { name: "Documents", href: "/client/documents", icon: FileSignature },
  { name: "Reserver", href: "/client/booking", icon: CalendarCheck },

  // ── Communaute ──
  { name: "Feed", href: "/client/feed", icon: Rss, section: "Communaute" },
  { name: "Communaute", href: "/client/community", icon: Users },
  { name: "Messagerie", href: "/client/messaging", icon: MessageSquare },

  // ── Outils ──
  { name: "AlexIA", href: "/client/ai", icon: Bot, section: "Outils" },
  { name: "Ressources", href: "/client/resources", icon: FolderOpen },
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
