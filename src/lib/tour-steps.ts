import type { RoleVariant } from "@/lib/navigation";

export type TourPosition = "top" | "bottom" | "left" | "right";

export interface TourStep {
  id: string;
  target: string; // CSS selector, e.g. '[data-tour="dashboard"]'
  title: string;
  description: string;
  position: TourPosition;
}

// ─── Client / Prospect ──────────────────────────────────────────
const clientSteps: TourStep[] = [
  {
    id: "client-dashboard",
    target: '[data-tour="dashboard"]',
    title: "Votre tableau de bord personnel",
    description:
      "Retrouvez ici vos KPIs, votre progression et un resume de votre activite. C'est votre point de depart chaque jour.",
    position: "right",
  },
  {
    id: "client-school",
    target: '[data-tour="school"]',
    title: "Accedez a vos formations",
    description:
      "Parcourez les modules de formation a votre rythme, validez vos acquis avec des quiz et obtenez des certificats.",
    position: "right",
  },
  {
    id: "client-messaging",
    target: '[data-tour="messaging"]',
    title: "Discutez avec votre coach en temps reel",
    description:
      "Envoyez des messages, partagez des fichiers et restez en contact direct avec votre coach attitre.",
    position: "right",
  },
  {
    id: "client-journal",
    target: '[data-tour="journal"]',
    title: "Tenez votre journal de coaching",
    description:
      "Notez vos reflexions, suivez vos habitudes et gardez une trace de votre evolution au quotidien.",
    position: "right",
  },
  {
    id: "client-community",
    target: '[data-tour="community"]',
    title: "Rejoignez la communaute",
    description:
      "Echangez avec les autres membres du programme, partagez vos victoires et inspirez-vous des succes collectifs.",
    position: "right",
  },
];

// ─── Coach / CSM ────────────────────────────────────────────────
const coachSteps: TourStep[] = [
  {
    id: "coach-dashboard",
    target: '[data-tour="dashboard"]',
    title: "Vue d'ensemble de vos clients",
    description:
      "Visualisez l'activite de vos clients, les alertes importantes et vos prochaines actions en un coup d'oeil.",
    position: "right",
  },
  {
    id: "coach-crm",
    target: '[data-tour="crm"]',
    title: "Gerez votre pipeline commercial",
    description:
      "Suivez chaque prospect dans le pipeline, de la prise de contact jusqu'a la conversion en client.",
    position: "right",
  },
  {
    id: "coach-messaging",
    target: '[data-tour="messaging"]',
    title: "Communiquez avec vos clients",
    description:
      "Messagerie en temps reel pour accompagner vos clients au quotidien avec des messages et fichiers.",
    position: "right",
  },
  {
    id: "coach-calls",
    target: '[data-tour="calls"]',
    title: "Planifiez et gerez vos appels",
    description:
      "Organisez vos appels de coaching, consultez l'historique et suivez les comptes-rendus automatiques.",
    position: "right",
  },
  {
    id: "coach-school",
    target: '[data-tour="school"]',
    title: "Creez et gerez vos formations",
    description:
      "Construisez des modules de formation, ajoutez des quiz et suivez la progression de vos clients.",
    position: "right",
  },
];

// ─── Admin / Fondateur ──────────────────────────────────────────
const adminSteps: TourStep[] = [
  {
    id: "admin-dashboard",
    target: '[data-tour="dashboard"]',
    title: "Vue d'ensemble complete",
    description:
      "Tableau de bord central avec tous les KPIs : revenus, clients actifs, conversions et activite de l'equipe.",
    position: "right",
  },
  {
    id: "admin-crm",
    target: '[data-tour="crm"]',
    title: "Pipeline et gestion clients",
    description:
      "Gerez l'ensemble du pipeline commercial, attribuez des leads aux coaches et suivez les conversions.",
    position: "right",
  },
  {
    id: "admin-billing",
    target: '[data-tour="billing"]',
    title: "Suivi financier et facturation",
    description:
      "Visualisez les revenus, gerez les factures, les echeanciers de paiement et les commissions.",
    position: "right",
  },
  {
    id: "admin-clients",
    target: '[data-tour="clients"]',
    title: "Gestion des clients et coaches",
    description:
      "Gerez votre equipe de coaches, attribuez les clients et suivez les performances individuelles.",
    position: "right",
  },
  {
    id: "admin-analytics",
    target: '[data-tour="analytics"]',
    title: "Analyses et KPIs",
    description:
      "Explorez les metriques detaillees : tendances de revenus, taux de conversion, performances par coach.",
    position: "right",
  },
];

// ─── Sales ──────────────────────────────────────────────────────
const salesSteps: TourStep[] = [
  {
    id: "sales-dashboard",
    target: '[data-tour="dashboard"]',
    title: "Votre tableau de bord commercial",
    description:
      "Consultez vos objectifs, vos appels prevus et vos conversions du mois en un coup d'oeil.",
    position: "right",
  },
  {
    id: "sales-pipeline",
    target: '[data-tour="pipeline"]',
    title: "Votre pipeline de vente",
    description:
      "Suivez vos prospects etape par etape, du premier contact jusqu'a la signature.",
    position: "right",
  },
  {
    id: "sales-messaging",
    target: '[data-tour="messaging"]',
    title: "Messagerie d'equipe",
    description: "Communiquez avec l'equipe et coordonnez-vous en temps reel.",
    position: "right",
  },
  {
    id: "sales-calls",
    target: '[data-tour="calls"]',
    title: "Gerez vos appels",
    description:
      "Planifiez et retrouvez l'historique de tous vos appels commerciaux.",
    position: "right",
  },
];

// ─── Export by role ─────────────────────────────────────────────
export function getTourStepsForRole(variant: RoleVariant): TourStep[] {
  switch (variant) {
    case "admin":
      return adminSteps;
    case "coach":
      return coachSteps;
    case "sales":
      return salesSteps;
    case "client":
      return clientSteps;
  }
}
