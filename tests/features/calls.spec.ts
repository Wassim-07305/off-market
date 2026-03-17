import { test, expect } from "../fixtures";
import { getUserByRole } from "../fixtures";

test.describe("Appels (/admin/calls)", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("la page Appels charge sans 404", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/calls");

    // Pas de 404
    await expect(
      page.getByText("404").or(page.getByText("Page introuvable")),
    ).not.toBeVisible();

    // Un contenu principal est rendu
    await expect(page.locator("h1, h2, [role='heading']").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("affiche une vue calendrier ou liste", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/calls");

    // Cherche des indicateurs de vue calendrier ou liste
    const calendarView = page.locator(
      '[class*="calendar"], [class*="Calendar"], [role="grid"], table',
    );
    const listView = page.locator(
      '[class*="list"], [role="list"], [role="table"]',
    );
    const anyContent = page.getByText(
      /appel|call|calendrier|agenda|semaine|lundi|mardi/i,
    );

    const hasCalendar = (await calendarView.count()) > 0;
    const hasList = (await listView.count()) > 0;
    const hasContent = (await anyContent.count()) > 0;

    expect(hasCalendar || hasList || hasContent).toBeTruthy();
  });

  test("bouton Nouvel appel ou + est present", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/calls");

    // Cherche un bouton pour creer un nouvel appel
    const newCallButton = page
      .getByRole("button", {
        name: /nouvel.appel|nouveau|ajouter|\+|planifier/i,
      })
      .or(page.locator('button:has-text("appel")'))
      .or(page.locator('a:has-text("appel")'))
      .or(
        page.locator(
          'button[aria-label*="ajout"], button[aria-label*="nouveau"]',
        ),
      );

    await expect(newCallButton.first()).toBeVisible({ timeout: 15_000 });
  });

  test("navigation entre semaines (boutons prev/next)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/calls");

    // Cherche des boutons de navigation temporelle (fleches, precedent/suivant)
    const navButtons = page
      .locator(
        'button[aria-label*="precedent"], button[aria-label*="suivant"], ' +
          'button[aria-label*="previous"], button[aria-label*="next"]',
      )
      .or(
        page
          .getByRole("button")
          .filter({ has: page.locator("svg") })
          .filter({
            hasText: /^$/, // Boutons icone sans texte (fleches)
          }),
      )
      .or(
        page.locator(
          'button:has(svg[class*="chevron"]), button:has(svg[class*="arrow"])',
        ),
      );

    // Au moins 2 boutons de navigation (prev + next)
    const count = await navButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("pas d'erreur critique sur la page", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/calls");

    // Pas d'erreur React boundary
    await expect(
      page
        .getByText("Something went wrong")
        .or(page.getByText("Une erreur est survenue")),
    ).not.toBeVisible();
  });
});
