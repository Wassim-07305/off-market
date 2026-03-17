import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Client Progression (/client/progress)", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page charge sans erreur", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/progress");

    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");
  });

  test("la section XP/level est visible", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/progress");

    // Verifie la presence d'indicateurs XP ou niveau
    const xpIndicator = page
      .locator("text=/xp|experience|niveau|level|points/i")
      .first();
    const progressBar = page
      .locator(
        '[role="progressbar"], [class*="progress"], [class*="xp"], [class*="level"]',
      )
      .first();

    const hasXpText = (await xpIndicator.count()) > 0;
    const hasProgressBar = (await progressBar.count()) > 0;

    expect(hasXpText || hasProgressBar).toBeTruthy();
  });

  test("la section badges est visible (meme si vide)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/progress");

    // Verifie la presence de la section badges
    const badgesSection = page.locator("text=/badge/i").first();
    const badgesContainer = page
      .locator('[class*="badge"], [class*="achievement"], [class*="reward"]')
      .first();
    const emptyBadges = page
      .locator("text=/aucun badge|pas de badge|pas encore/i")
      .first();

    const hasBadgesTitle = (await badgesSection.count()) > 0;
    const hasBadgesContainer = (await badgesContainer.count()) > 0;
    const hasEmptyBadges = (await emptyBadges.count()) > 0;

    // Au moins un element lie aux badges doit etre present
    expect(hasBadgesTitle || hasBadgesContainer || hasEmptyBadges).toBeTruthy();
  });
});
