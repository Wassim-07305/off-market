import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Off-Market — La plateforme tout-en-un de coaching et gestion business",
  description:
    "Formation, CRM, messagerie, gamification et IA reunis dans une seule plateforme premium. Accompagnez vos clients vers les 10 000 EUR/mois.",
  openGraph: {
    title: "Off-Market — Coaching & Gestion Business",
    description:
      "La plateforme premium pour coachs et consultants. Centralisez formation, suivi client, facturation et communaute.",
    type: "website",
    locale: "fr_FR",
    siteName: "Off-Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Off-Market — Coaching & Gestion Business",
    description:
      "La plateforme premium pour coachs et consultants. Centralisez tout en un seul endroit.",
  },
  robots: { index: true, follow: true },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`html { scroll-behavior: smooth; }`}</style>
      {children}
    </>
  );
}
