"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  admin: "Admin",
  coach: "Coach",
  client: "Espace Client",
  sales: "Sales",
  dashboard: "Dashboard",
  crm: "CRM",
  clients: "Clients",
  messaging: "Messagerie",
  school: "Formation",
  forms: "Formulaires",
  billing: "Facturation",
  content: "Contenu",
  feed: "Feed",
  calls: "Appels",
  ai: "Assistant IA",
  invitations: "Invitations",
  resources: "Ressources",
  rewards: "Récompenses",
  badges: "Badges",
  moderation: "Modération",
  calendar: "Calendrier",
  csm: "Équipe CSM",
  analytics: "Analytics",
  audit: "Audit",
  "audit-log": "Journal d'audit",
  faq: "FAQ",
  upsell: "Upsell",
  settings: "Paramètres",
  notifications: "Notifications",
  community: "Communauté",
  journal: "Journal",
  checkin: "Check-in",
  "check-ins": "Check-ins",
  goals: "Objectifs",
  challenges: "Défis",
  leaderboard: "Classement",
  certificates: "Certificats",
  progress: "Progression",
  roadmap: "Roadmap",
  booking: "Réservation",
  replays: "Replays",
  contracts: "Contrats",
  invoices: "Factures",
  users: "Utilisateurs",
  pipeline: "Pipeline",
  finances: "Finances",
  leads: "Leads",
  sessions: "Séances",
  availability: "Disponibilités",
  onboarding: "Onboarding",
  profile: "Mon profil",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav className="flex items-center text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <ChevronRight className="mx-1.5 h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Dashboard</span>
      </nav>
    );
  }

  return (
    <nav className="flex min-w-0 items-center text-sm text-muted-foreground">
      <Link
        href="/"
        className="shrink-0 transition-colors hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = "/" + segments.slice(0, index + 1).join("/");
        // Skip UUID segments — don't show them
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            segment,
          );
        if (isUuid) return null;

        const label =
          ROUTE_LABELS[segment] ??
          segment
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        return (
          <span key={href} className="flex min-w-0 items-center">
            <ChevronRight className="mx-1.5 h-3.5 w-3.5 shrink-0" />
            {isLast ? (
              <span className="max-w-[180px] truncate font-medium text-foreground">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="shrink-0 transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
