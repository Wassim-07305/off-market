import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Client Contrats (/client/contracts)", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page charge sans erreur", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/contracts");

    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");
  });

  test("affiche la liste de contrats ou un empty state", async ({
    authenticatedPage,
    supabaseAdmin,
  }) => {
    const { page, user } = authenticatedPage;

    // Recupere le profil
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!profile) {
      test.skip(true, "Profil introuvable");
      return;
    }

    // Verifie s'il y a des contrats en DB
    const { data: contracts } = await supabaseAdmin
      .from("contracts")
      .select("id")
      .eq("client_id", profile.id)
      .limit(1);

    await page.goto("/client/contracts");

    if (!contracts || contracts.length === 0) {
      // Pas de contrats — verifie la presence d'un empty state
      const emptyState = page
        .locator("text=/aucun contrat|pas de contrat|aucun document/i")
        .or(page.locator('[class*="empty"]'));

      await expect(emptyState).toBeVisible({ timeout: 15_000 });
    } else {
      // Des contrats existent — verifie qu'au moins un est affiche
      const contractElements = page
        .locator('[class*="card"], [class*="contract"], table tbody tr, li')
        .first();

      await expect(contractElements).toBeVisible({ timeout: 15_000 });
    }
  });
});
