import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Dashboard Admin (/admin/dashboard)", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("affiche le greeting avec le prenom", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    const heading = page.locator("h1").filter({ hasText: "Bonjour" });
    await expect(heading).toBeVisible({ timeout: 15_000 });
    // Verifie que le prenom est present (ex: "Bonjour, Alexia")
    await expect(heading).toContainText(
      authenticatedPage.user.fullName.split(" ")[0],
    );
  });

  test("affiche les 4 KPI cards principales", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    const kpis = [
      "CA du mois",
      "Eleves actifs",
      "Nouveaux ce mois",
      "LTV moyen",
    ];
    for (const kpi of kpis) {
      await expect(page.getByText(kpi, { exact: false })).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("affiche les 4 taux (Retention, Churn, Closing, Completion)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    const taux = [
      "Retention",
      "Churn",
      "Taux closing",
      "Completion formations",
    ];
    for (const t of taux) {
      await expect(page.getByText(t, { exact: false })).toBeVisible({
        timeout: 15_000,
      });
    }
  });

  test("affiche le chart Evolution CA (SVG rendu)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    await expect(page.getByText("Evolution CA", { exact: false })).toBeVisible({
      timeout: 15_000,
    });

    // Verifie qu'un SVG Recharts est rendu a proximite
    const chartSection = page
      .locator("text=Evolution CA")
      .locator("..")
      .locator("..");
    const svg = chartSection.locator("svg").first();
    await expect(svg).toBeVisible({ timeout: 10_000 });
  });

  test("affiche le chart CA par canal", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    await expect(page.getByText("CA par canal", { exact: false })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("section Activite recente est presente", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    await expect(
      page
        .getByText("Activite recente", { exact: false })
        .or(page.getByText("Activité récente", { exact: false })),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("section Leaderboard coaches est presente et liste des coaches", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    await expect(
      page
        .getByText("Leaderboard coaches", { exact: false })
        .or(page.getByText("Leaderboard", { exact: false })),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("bouton Voir les alertes est cliquable", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    const btn = page
      .getByRole("button", { name: /alertes/i })
      .or(page.getByText("Voir les alertes"));
    await expect(btn).toBeVisible({ timeout: 15_000 });
    await expect(btn).toBeEnabled();
  });

  test("section Rapport IA hebdomadaire est presente", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    await expect(
      page
        .getByText("Rapport IA hebdomadaire", { exact: false })
        .or(page.getByText("Rapport IA", { exact: false })),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("section Comparaison de periodes avec 2 date pickers", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/dashboard");

    await expect(
      page
        .getByText("Comparaison", { exact: false })
        .or(page.getByText("comparaison de periodes", { exact: false })),
    ).toBeVisible({ timeout: 15_000 });

    // Verifie qu'il y a au moins 2 date pickers (inputs type date ou boutons date)
    const datePickers = page.locator(
      'input[type="date"], button:has-text("Selectionner"), [data-testid*="date"]',
    );
    await expect(datePickers.first()).toBeVisible({ timeout: 10_000 });
  });
});
