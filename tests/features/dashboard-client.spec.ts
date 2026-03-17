import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Dashboard Client (/client/dashboard)", () => {
  test.use({ testUser: getUserByRole("client") });

  test("le client voit le dashboard client apres login", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/dashboard");

    // Verifie qu'on est bien sur le dashboard client (pas redirige vers login ou 404)
    await expect(page).toHaveURL(/\/client\/dashboard/, { timeout: 15_000 });
    // Verifie un element de base (heading ou contenu de la page)
    await expect(page.locator("h1, h2, [role='heading']").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("affiche des sections de progression (goals, courses)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/dashboard");

    // Cherche des indicateurs de progression : goals, formations, objectifs, progression
    const progressIndicators = page.getByText(
      /progression|objectif|formation|cours|goal/i,
    );
    await expect(progressIndicators.first()).toBeVisible({ timeout: 15_000 });
  });

  test("pas d'acces aux modules admin dans la sidebar", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/dashboard");

    // Les liens admin ne doivent PAS etre visibles dans la sidebar
    const sidebar = page.locator("nav, aside, [role='navigation']").first();
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    // Ces textes ne doivent pas apparaitre dans la sidebar client
    const adminOnlyLinks = ["Facturation", "Utilisateurs", "Users"];
    for (const linkText of adminOnlyLinks) {
      const link = sidebar.getByText(linkText, { exact: false });
      await expect(link).not.toBeVisible();
    }
  });

  test("la sidebar client montre les bons liens", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/dashboard");

    const sidebar = page.locator("nav, aside, [role='navigation']").first();
    await expect(sidebar).toBeVisible({ timeout: 15_000 });

    // Un client devrait voir des liens comme Dashboard, Formations, Messages, Journal, etc.
    const expectedLinks = ["Dashboard", "Formation", "Message"];
    for (const linkText of expectedLinks) {
      const link = sidebar.getByText(linkText, { exact: false });
      await expect(link).toBeVisible({ timeout: 10_000 });
    }
  });

  test("un client ne peut pas acceder a /admin/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    // Devrait etre redirige ou voir un message d'acces refuse
    // Soit redirige vers /client/dashboard, soit vers /login, soit message d'erreur
    const url = page.url();
    const isBlocked =
      !url.includes("/admin/dashboard") ||
      (await page
        .getByText(/acces refuse|non autorise|forbidden|interdit/i)
        .isVisible()
        .catch(() => false));

    expect(isBlocked).toBeTruthy();
  });
});
