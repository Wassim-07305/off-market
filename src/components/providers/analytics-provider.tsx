"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Fournisseur Google Analytics 4.
 *
 * - Charge le script gtag.js via `next/script` (strategy afterInteractive)
 * - Initialise gtag avec le Measurement ID
 * - Track automatiquement chaque changement de page (navigations SPA)
 *
 * Si `NEXT_PUBLIC_GA_MEASUREMENT_ID` n'est pas défini, le composant
 * ne rend rien et aucun tracking n'est effectué.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();

  // Track les navigations SPA
  useEffect(() => {
    if (!GA_ID) return;
    trackPageView(pathname);
  }, [pathname]);

  // Pas de Measurement ID → pas de tracking
  if (!GA_ID) return null;

  return (
    <>
      {/* Script gtag.js */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />

      {/* Initialisation de gtag */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
