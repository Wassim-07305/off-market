"use client";

import { usePathname } from "next/navigation";
import { RoleLayout } from "@/components/layout/role-layout";
import { ProspectGate } from "@/components/auth/prospect-gate";
import { useAuth } from "@/hooks/use-auth";

/** Routes where prospect has FULL access (no blur) */
const PROSPECT_ALLOWED_ROUTES = [
  "/client/dashboard",
  "/client/feed",
  "/client/community",
  "/client/ai",
  "/client/suivi",
  "/client/documents",
  "/client/contracts",
  "/client/invoices",
  "/client/settings",
  "/client/notifications",
];

/** Custom messages per restricted route */
const PROSPECT_MESSAGES: Record<string, string> = {
  "/client/school": "Acces aux formations complet reserve aux clients. Rejoignez le programme pour apprendre et progresser.",
  "/client/messaging": "La messagerie avec votre coach est disponible des votre inscription. Devenez client pour echanger en direct.",
  "/client/gamification": "Le systeme de progression (XP, badges, classement) est reserve aux clients actifs.",
  "/client/booking": "La reservation de sessions est disponible des votre inscription comme client.",
  "/client/resources": "L'acces complet aux ressources est reserve aux clients du programme.",
};

function isAllowedForProspect(pathname: string): boolean {
  return PROSPECT_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
}

function getProspectMessage(pathname: string): string {
  for (const [route, msg] of Object.entries(PROSPECT_MESSAGES)) {
    if (pathname === route || pathname.startsWith(route + "/")) return msg;
  }
  return "Cette fonctionnalite est reservee aux clients du programme.";
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const isProspect = profile?.role === "prospect";
  const variant = isProspect ? "prospect" : "client";

  // Prospect on restricted route → render gate placeholder only (no children = no backend calls)
  if (isProspect && !isAllowedForProspect(pathname)) {
    return (
      <RoleLayout variant={variant}>
        <ProspectGate message={getProspectMessage(pathname)} />
      </RoleLayout>
    );
  }

  return <RoleLayout variant={variant}>{children}</RoleLayout>;
}
