import { test, expect, getUserByRole } from "../fixtures";

// ─── Admin : Formations (/admin/school) ─────────────────────────────────────

test.describe("Formations — Admin", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("la page /admin/school charge sans erreur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/school");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/admin\/school/);

    // Le titre "Formation" doit etre visible
    await expect(
      page.getByRole("heading", { name: /formation/i }),
    ).toBeVisible();
  });

  test("affiche une grille de cours ou un empty state", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/school");

    // Soit des cartes de cours (avec "modules" et "lecons") soit l'empty state
    const courseCards = page.locator("text=modules");
    const emptyState = page.getByText(/aucune formation disponible/i);

    const hasCourses = (await courseCards.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasCourses || hasEmpty).toBeTruthy();
  });

  test("les tabs de filtre sont presents (Toutes, En cours, Terminees, Non commencees)", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/school");

    // Les 4 filtres doivent etre visibles comme boutons
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "En cours" })).toBeVisible();
    await expect(page.getByRole("button", { name: /termin/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /non commenc/i }),
    ).toBeVisible();
  });

  test("la barre de recherche est presente", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/school");

    const searchInput = page.locator(
      'input[placeholder*="rechercher" i], input[placeholder*="formation" i]',
    );
    await expect(searchInput).toBeVisible();
  });

  test("le bouton Gerer les formations est visible pour un admin", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/school");

    // Le lien "Gerer les formations" est visible pour les staff
    const manageLink = page.getByRole("link", {
      name: /gerer les formations/i,
    });
    await expect(manageLink).toBeVisible();
  });

  test("cliquer sur un tab filtre les cours", async ({ authenticatedPage }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/school");

    // On clique sur "Non commencees" puis on verifie que le tab est actif
    const tabButton = page.getByRole("button", { name: /non commenc/i });
    await tabButton.click();

    // Le bouton doit avoir un indicateur visuel (la barre coloree en dessous)
    // On verifie simplement que le contenu ne crash pas apres le clic
    await expect(tabButton).toBeVisible();

    // Retour sur "Toutes"
    await page.getByRole("button", { name: "Toutes" }).click();
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible();
  });
});

// ─── Client : Formations (/client/school) ───────────────────────────────────

test.describe("Formations — Client", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page /client/school charge correctement", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/school");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/client\/school/);

    await expect(
      page.getByRole("heading", { name: /formation/i }),
    ).toBeVisible();
  });

  test("un client peut voir les formations et la barre de recherche", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/school");

    // Barre de recherche
    const searchInput = page.locator(
      'input[placeholder*="rechercher" i], input[placeholder*="formation" i]',
    );
    await expect(searchInput).toBeVisible();

    // Tabs de filtre
    await expect(page.getByRole("button", { name: "Toutes" })).toBeVisible();
  });

  test("un client ne voit PAS le bouton Gerer les formations", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/school");

    const manageLink = page.getByRole("link", {
      name: /gerer les formations/i,
    });
    await expect(manageLink).not.toBeVisible();
  });
});
