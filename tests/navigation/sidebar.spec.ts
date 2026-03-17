import { test, expect, getUserByRole } from "../fixtures";

test.use({ testUser: getUserByRole("admin") });

// Liste des liens sidebar admin avec leurs URLs
const ADMIN_SIDEBAR_LINKS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "CRM", path: "/admin/crm" },
  { label: "Clients", path: "/admin/clients" },
  { label: "Messagerie", path: "/admin/messaging" },
  { label: "Formation", path: "/admin/school" },
  { label: "Formulaires", path: "/admin/forms" },
  { label: "Facturation", path: "/admin/billing" },
  { label: "Contenu", path: "/admin/content" },
  { label: "Feed", path: "/admin/feed" },
  { label: "Appels", path: "/admin/calls" },
  { label: "Disponibilites", path: "/admin/settings/availability" },
  { label: "Assistant IA", path: "/admin/ai" },
  { label: "Invitations", path: "/admin/invitations" },
  { label: "Ressources", path: "/admin/resources" },
  { label: "Recompenses", path: "/admin/rewards" },
  { label: "Badges", path: "/admin/badges" },
  { label: "Moderation", path: "/admin/moderation" },
  { label: "Calendrier", path: "/admin/calendar" },
  { label: "Equipe CSM", path: "/admin/csm" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Audit", path: "/admin/audit" },
  { label: "FAQ / Base IA", path: "/admin/faq" },
  { label: "Upsell", path: "/admin/upsell" },
] as const;

test.describe("Sidebar admin — pas de 404", () => {
  for (const link of ADMIN_SIDEBAR_LINKS) {
    test(`${link.label} (${link.path}) ne retourne pas de 404`, async ({
      authenticatedPage,
    }) => {
      const { page } = authenticatedPage;

      await page.goto(link.path);
      await page
        .waitForLoadState("networkidle", { timeout: 60_000 })
        .catch(() => {
          // networkidle peut timeout sur certaines pages lourdes, on continue
        });

      // Verifie que la page ne contient pas de 404
      const has404 = await page.locator("text=404").count();
      expect(has404, `La page ${link.path} affiche un 404`).toBe(0);

      // Verifie aussi qu'on n'a pas ete redirige vers une page 404 generique
      const pageTitle = await page.title();
      expect(pageTitle.toLowerCase()).not.toContain("404");

      // Verifie qu'on est toujours sur une route admin (pas de redirect inattendu)
      const currentUrl = page.url();
      expect(currentUrl).toContain("/admin");
    });
  }
});
