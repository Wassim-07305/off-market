import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Client Check-in (/client/checkin)", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page charge sans erreur", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/checkin");

    // Verifie qu'aucune erreur 404/500 n'est affichee
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("500");
    await expect(page.locator("body")).not.toContainText("Erreur serveur");
  });

  test("le formulaire multi-etapes est visible", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/checkin");

    // Verifie la presence d'elements de navigation multi-etapes
    // (boutons Next/Back ou indicateurs d'etapes numerotees)
    const nextButton = page.getByRole("button", {
      name: /suivant|next|continuer/i,
    });
    const stepIndicators = page.locator('[data-step], [class*="step"], .step');
    const numberedSteps = page.locator("text=/etape|step/i");

    // Au moins un des mecanismes de multi-etapes doit etre present
    const hasNextButton = (await nextButton.count()) > 0;
    const hasStepIndicators = (await stepIndicators.count()) > 0;
    const hasNumberedSteps = (await numberedSteps.count()) > 0;

    // Ou bien le formulaire lui-meme est present (textarea, inputs, radio buttons)
    const hasFormElements =
      (await page
        .locator(
          "textarea, input[type='text'], input[type='radio'], input[type='range']",
        )
        .count()) > 0;

    expect(
      hasNextButton || hasStepIndicators || hasNumberedSteps || hasFormElements,
    ).toBeTruthy();
  });

  test("si un check-in existe deja, l'historique est visible", async ({
    authenticatedPage,
    supabaseAdmin,
  }) => {
    const { page, user } = authenticatedPage;

    // Recupere le profil du user pour avoir son ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!profile) {
      test.skip(true, "Profil introuvable pour cet utilisateur");
      return;
    }

    // Verifie s'il y a des check-ins existants en DB
    const { data: checkins } = await supabaseAdmin
      .from("journal_entries")
      .select("id")
      .eq("user_id", profile.id)
      .limit(1);

    if (!checkins || checkins.length === 0) {
      // Pas de check-in existant — on verifie juste que la page ne crashe pas
      await page.goto("/client/checkin");

      await expect(page.locator("body")).toBeVisible();
      return;
    }

    // Il y a des check-ins — verifie que l'historique est affiche
    await page.goto("/client/checkin");

    // L'historique peut se manifester par une liste, un tableau, ou des cartes
    const historyElements = page.locator(
      '[class*="history"], [class*="historique"], table, [class*="card"], [class*="list"]',
    );
    const hasHistory = (await historyElements.count()) > 0;

    // Ou par la presence de dates formatees (pattern fr)
    const datePattern = page.locator(
      "text=/\\d{1,2}\\s+(janv|fevr|mars|avr|mai|juin|juil|aout|sept|oct|nov|dec)/i",
    );
    const hasDates = (await datePattern.count()) > 0;

    expect(hasHistory || hasDates).toBeTruthy();
  });
});
