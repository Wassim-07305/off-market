import { test, expect, getUserByRole } from "../fixtures";

// ─── Admin : Formulaires (/admin/forms) ─────────────────────────────────────

test.describe("Formulaires — Admin", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("la page /admin/forms charge sans erreur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/forms");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/admin\/forms/);

    // Le titre "Formulaires" doit etre visible
    await expect(
      page.getByRole("heading", { name: /formulaires/i }),
    ).toBeVisible();
  });

  test("le bouton Nouveau formulaire est visible pour un admin", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/forms");

    const newFormBtn = page.getByRole("link", {
      name: /nouveau formulaire/i,
    });
    await expect(newFormBtn).toBeVisible();
  });

  test("les filtres de statut sont presents (Tous, Actifs, Brouillons, Fermes)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/forms");

    await expect(page.getByRole("button", { name: "Tous" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Actifs" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Brouillons" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /ferm/i })).toBeVisible();
  });

  test("affiche des formulaires ou un empty state", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/forms");

    // Soit des cartes de formulaires (avec "reponse(s)") soit l'empty state
    const formCards = page.locator("text=/\\d+ reponses?/i");
    const emptyState = page.getByText(/aucun formulaire/i);

    const hasForms = (await formCards.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasForms || hasEmpty).toBeTruthy();
  });

  test("cliquer sur un filtre de statut ne crash pas", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/forms");

    // Cliquer sur "Brouillons"
    await page.getByRole("button", { name: "Brouillons" }).click();
    // Attendre que le filtre soit applique
    await page.waitForTimeout(500);

    // La page ne doit pas etre en erreur
    await expect(
      page.getByRole("heading", { name: /formulaires/i }),
    ).toBeVisible();

    // Retour sur "Tous"
    await page.getByRole("button", { name: "Tous" }).click();
    await expect(page.getByRole("button", { name: "Tous" })).toBeVisible();
  });

  test("le bouton Nouveau formulaire pointe vers /admin/forms/new", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/forms");

    const newFormLink = page.getByRole("link", {
      name: /nouveau formulaire/i,
    });
    await expect(newFormLink).toHaveAttribute("href", /\/forms\/new/);
  });
});

// ─── Client : Formulaires (/client/forms) ───────────────────────────────────

test.describe("Formulaires — Client", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page /client/forms charge correctement", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/forms");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/client\/forms/);

    await expect(
      page.getByRole("heading", { name: /formulaires/i }),
    ).toBeVisible();
  });

  test("un client peut voir les formulaires", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/forms");

    // Les filtres de statut doivent etre visibles
    await expect(page.getByRole("button", { name: "Tous" })).toBeVisible();
  });

  test("un client ne voit PAS le bouton Nouveau formulaire", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/forms");

    const newFormBtn = page.getByRole("link", {
      name: /nouveau formulaire/i,
    });
    await expect(newFormBtn).not.toBeVisible();
  });
});
