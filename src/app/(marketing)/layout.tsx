import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Off-Market — La plateforme tout-en-un pour freelances, coachs et consultants",
  description:
    "CRM, formation, messagerie, gamification et IA centralises dans une seule plateforme. Atteignez et depassez les 10 000 EUR/mois.",
  openGraph: {
    title: "Off-Market — Atteignez les 10K EUR/mois",
    description:
      "La plateforme tout-en-un pour freelances, coachs et consultants. Centralisez formation, suivi client, facturation et communaute.",
    type: "website",
    locale: "fr_FR",
    siteName: "Off-Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Off-Market — Atteignez les 10K EUR/mois",
    description:
      "La plateforme tout-en-un pour freelances, coachs et consultants. Centralisez tout en un seul endroit.",
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
