import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("CRM (/admin/crm)", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("la page CRM charge sans erreur", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/crm");

    // Pas de 404 ou page d'erreur
    await expect(
      page.getByText("404").or(page.getByText("Page introuvable")),
    ).not.toBeVisible();

    // Verifie qu'un contenu principal est rendu
    await expect(page.locator("h1, h2, [role='heading']").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("affiche des tabs ou views (Pipeline, Timeline, etc.)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/crm");

    // Cherche des boutons/tabs de navigation dans la page CRM
    const tabs = page.locator('[role="tab"], [role="tablist"], button').filter({
      hasText: /pipeline|timeline|kanban|liste|leads|clients|vue/i,
    });

    // Au moins un element de navigation devrait etre present
    await expect(tabs.first()).toBeVisible({ timeout: 15_000 });
  });

  test("si kanban present, verifie les colonnes", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/crm");

    // Cherche un kanban board ou des colonnes de pipeline
    const kanbanColumns = page.locator(
      '[data-testid*="column"], [class*="kanban"], [class*="column"]',
    );
    const pipelineStatuses = page.getByText(
      /premier.message|qualification|proposition|negociation|close|perdu|gagne/i,
    );

    // Soit un kanban avec des colonnes, soit des statuts de pipeline sont visibles
    const hasKanban = (await kanbanColumns.count()) > 0;
    const hasStatuses = (await pipelineStatuses.count()) > 0;

    // Au moins un des deux devrait etre present (le CRM affiche un pipeline)
    expect(hasKanban || hasStatuses).toBeTruthy();
  });

  test("la page ne montre pas de 404 ou d'erreur critique", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    // Ecoute les erreurs console
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/admin/crm");

    // Pas de page 404
    await expect(page.getByText("404")).not.toBeVisible();

    // Pas de "Something went wrong" ou erreur React boundary
    await expect(
      page
        .getByText("Something went wrong")
        .or(page.getByText("Une erreur est survenue")),
    ).not.toBeVisible();
  });
});
