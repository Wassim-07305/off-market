import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Empty states — Dashboard admin", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("dashboard admin avec donnees vides ne crashe pas", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/dashboard");

    // Verifie que la page ne crashe pas (pas de 500, pas d'erreur React)
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");
    await expect(page.locator("body")).not.toContainText(
      "Something went wrong",
    );

    // Verifie que le layout de base est present
    const mainContent = page
      .locator("main")
      .or(page.locator('[class*="dashboard"]'))
      .or(page.locator('[class*="layout"]'));
    await expect(mainContent.first()).toBeVisible({ timeout: 15_000 });

    // Si des cartes KPI sont presentes, elles devraient afficher 0 ou un placeholder
    const kpiCards = page.locator(
      '[class*="card"], [class*="stat"], [class*="kpi"]',
    );
    const kpiCount = await kpiCards.count();

    if (kpiCount > 0) {
      // Verifie qu'au moins la premiere carte est visible et ne contient pas d'erreur
      await expect(kpiCards.first()).toBeVisible();
      await expect(kpiCards.first()).not.toContainText("undefined");
      await expect(kpiCards.first()).not.toContainText("NaN");
    }
  });
});

test.describe("Empty states — Messagerie", () => {
  test.use({ testUser: getUserByRole("client") });

  test("messagerie sans channels affiche un empty state", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/messaging");

    // Verifie que la page ne crashe pas
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");

    // La page doit afficher soit des channels, soit un empty state
    const channels = page.locator(
      '[class*="channel"], [class*="conversation"], [class*="chat"]',
    );
    const emptyState = page
      .locator(
        "text=/aucun message|aucune conversation|pas de message|commencez|aucun canal/i",
      )
      .or(page.locator('[class*="empty"]'));

    const hasChannels = (await channels.count()) > 0;
    const hasEmptyState = (await emptyState.count()) > 0;

    // L'un ou l'autre doit etre present — pas de page blanche
    expect(hasChannels || hasEmptyState).toBeTruthy();
  });
});

test.describe("Empty states — School / Formations", () => {
  test.use({ testUser: getUserByRole("client") });

  test("school sans cours affiche un empty state", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/school");

    // Verifie que la page ne crashe pas
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");

    // La page doit afficher soit des formations, soit un empty state
    const formations = page.locator(
      '[class*="formation"], [class*="course"], [class*="card"], [class*="module"]',
    );
    const emptyState = page
      .locator(
        "text=/aucune formation|aucun cours|pas de formation|pas de cours|bientot disponible/i",
      )
      .or(page.locator('[class*="empty"]'));

    const hasFormations = (await formations.count()) > 0;
    const hasEmptyState = (await emptyState.count()) > 0;

    // L'un ou l'autre doit etre present
    expect(hasFormations || hasEmptyState).toBeTruthy();
  });
});
