import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Client Objectifs (/client/goals)", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page charge sans erreur", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/goals");

    // Verifie qu'aucune erreur n'est affichee
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");
  });

  test("les tabs de statut sont visibles", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/goals");

    // Verifie la presence des tabs de filtrage par statut
    const expectedTabs = [
      "Actifs",
      "Tous",
      "Terminés",
      "En pause",
      "Abandonnés",
    ];

    for (const tabLabel of expectedTabs) {
      const tab = page
        .getByRole("tab", { name: tabLabel })
        .or(page.getByRole("button", { name: tabLabel }))
        .or(page.locator(`text="${tabLabel}"`));

      await expect(tab).toBeVisible({ timeout: 15_000 });
    }
  });

  test("empty state affiche si pas d'objectifs", async ({
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

    // Verifie s'il y a des objectifs en DB
    const { data: goals } = await supabaseAdmin
      .from("coaching_goals")
      .select("id")
      .eq("user_id", profile.id)
      .limit(1);

    await page.goto("/client/goals");

    if (!goals || goals.length === 0) {
      // Pas d'objectifs — verifie la presence d'un empty state
      const emptyState = page
        .locator(
          "text=/aucun objectif|pas d'objectif|commencez|créer.*objectif/i",
        )
        .or(page.locator('[class*="empty"]'));

      await expect(emptyState).toBeVisible({ timeout: 15_000 });
    } else {
      // Des objectifs existent — verifie qu'au moins un est affiche
      const goalCards = page
        .locator('[class*="card"], [class*="goal"], li, tr')
        .first();
      await expect(goalCards).toBeVisible({ timeout: 15_000 });
    }
  });
});
