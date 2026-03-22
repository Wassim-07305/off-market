/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Google Analytics 4 — helpers de tracking
 *
 * Toutes les fonctions sont "graceful" : si GA n'est pas configuré
 * (variable d'env absente ou script non chargé), elles ne font rien.
 */

// ---------- Types ----------

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/** Événements prédéfinis de la plateforme */
export type AnalyticsEvent =
  | "signup" // inscription
  | "login" // connexion
  | "lesson_complete" // leçon terminée
  | "checkin_submit" // check-in soumis
  | "form_submit" // formulaire soumis
  | "contract_signed" // contrat signé
  | "invoice_paid"; // facture payée

// ---------- Helpers ----------

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

function hasGtag(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/**
 * Envoie un événement personnalisé à GA4.
 *
 * @param action  Nom de l'événement (string libre ou `AnalyticsEvent`)
 * @param params  Paramètres additionnels (clé-valeur)
 */
export function trackEvent(
  action: string,
  params?: Record<string, string>,
): void {
  if (!hasGtag()) return;
  window.gtag!("event", action, params);
}

/**
 * Enregistre une page vue (navigation SPA).
 *
 * @param url  Chemin courant (`/coach/dashboard`, etc.)
 */
export function trackPageView(url: string): void {
  if (!hasGtag() || !GA_ID) return;
  window.gtag!("config", GA_ID, { page_path: url });
}
