import { test, expect, getUserByRole } from "../fixtures";

// ─── Admin : Ressources (/admin/resources) ──────────────────────────────────

test.describe("Ressources — Admin", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("la page /admin/resources charge sans erreur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/admin\/resources/);

    // Le titre "Ressources" doit etre visible
    await expect(
      page.getByRole("heading", { name: /ressources/i }),
    ).toBeVisible();
  });

  test("les filtres de categorie sont presents", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    // Les categories : Toutes, General, Templates, Guides, Contrats, Marketing, Formation
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /g[eé]n[eé]ral/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /templates/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /guides/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /contrats/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /marketing/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /formation/i }),
    ).toBeVisible();
  });

  test("la barre de recherche est presente", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    const searchInput = page.locator('input[placeholder*="rechercher" i]');
    await expect(searchInput).toBeVisible();
  });

  test("le bouton Ajouter une ressource est visible pour un admin", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    const uploadBtn = page.getByRole("button", {
      name: /ajouter une ressource/i,
    });
    await expect(uploadBtn).toBeVisible();
  });

  test("cliquer sur Ajouter une ressource ouvre le formulaire d'upload", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    const uploadBtn = page.getByRole("button", {
      name: /ajouter une ressource/i,
    });
    await uploadBtn.click();

    // Le formulaire d'upload apparait avec le titre "Nouvelle ressource"
    await expect(
      page.getByRole("heading", { name: /nouvelle ressource/i }),
    ).toBeVisible();

    // Le champ titre doit etre visible
    const titleInput = page.locator(
      'input[placeholder*="nom de la ressource" i], input[placeholder*="ressource" i]',
    );
    await expect(titleInput).toBeVisible();

    // La zone de drop de fichier doit etre visible
    const dropZone = page.getByText(/clique ou glisse un fichier/i);
    await expect(dropZone).toBeVisible();
  });

  test("affiche des ressources ou un empty state", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    // Soit des ressources (avec "Telecharger") soit l'empty state
    const resourceItems = page.getByRole("button", {
      name: /t[eé]l[eé]charger/i,
    });
    const emptyState = page.getByText(/aucune ressource/i);

    const hasResources = (await resourceItems.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasResources || hasEmpty).toBeTruthy();
  });

  test("cliquer sur un filtre de categorie ne crash pas", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/resources");

    // Cliquer sur "Templates"
    await page.getByRole("button", { name: /templates/i }).click();
    await page.waitForTimeout(500);

    // La page ne doit pas etre en erreur
    await expect(
      page.getByRole("heading", { name: /ressources/i }),
    ).toBeVisible();

    // Retour sur "Toutes"
    await page.getByRole("button", { name: "Toutes" }).click();
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible();
  });
});

// ─── Client : Ressources (/client/resources) ───────────────────────────────

test.describe("Ressources — Client", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page /client/resources charge correctement", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/resources");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/client\/resources/);

    await expect(
      page.getByRole("heading", { name: /ressources/i }),
    ).toBeVisible();
  });

  test("un client voit les filtres et la recherche", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/resources");

    // Filtres
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible();

    // Recherche
    const searchInput = page.locator('input[placeholder*="rechercher" i]');
    await expect(searchInput).toBeVisible();
  });

  test("un client ne voit PAS le bouton Ajouter une ressource", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/resources");

    const uploadBtn = page.getByRole("button", {
      name: /ajouter une ressource/i,
    });
    await expect(uploadBtn).not.toBeVisible();
  });
});
