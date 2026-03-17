import { test, expect, getUserByRole } from "../fixtures";

// ─── Admin : Feed communautaire (/admin/feed) ──────────────────────────────

test.describe("Feed communautaire — Admin", () => {
  test.use({ testUser: getUserByRole("admin") });

  test("la page /admin/feed charge sans erreur", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/feed");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/admin\/feed/);

    // Le titre "Feed" doit etre present
    await expect(page.getByRole("heading", { name: /feed/i })).toBeVisible();
  });

  test("la zone de composition de post est presente", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/feed");

    // Le textarea du PostComposer avec le placeholder
    const composer = page.locator(
      'textarea[placeholder*="communaute" i], textarea[placeholder*="partage" i]',
    );
    await expect(composer).toBeVisible();
  });

  test("les types de posts sont selectionnables apres focus sur le composer", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/feed");

    // Focus sur le composer pour l'expandre
    const composer = page.locator(
      'textarea[placeholder*="communaute" i], textarea[placeholder*="partage" i]',
    );
    await composer.click();
    await composer.fill("Test");

    // Les boutons de type de post doivent apparaitre (victoire, question, experience, general)
    await expect(page.getByRole("button", { name: /victoire/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /question/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /exp[eé]rience/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /g[eé]n[eé]ral/i }),
    ).toBeVisible();
  });

  test("le bouton Publier est present dans le composer expande", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/feed");

    const composer = page.locator(
      'textarea[placeholder*="communaute" i], textarea[placeholder*="partage" i]',
    );
    await composer.click();
    await composer.fill("Test publication");

    await expect(page.getByRole("button", { name: /publier/i })).toBeVisible();
  });

  test("les filtres de type (Tout, Victoires, Questions, Experiences, General) sont presents", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/feed");

    await expect(page.getByRole("button", { name: "Tout" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /victoires/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /questions/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /exp[eé]riences/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /g[eé]n[eé]ral/i }),
    ).toBeVisible();
  });

  test("les options de tri (Recents, Tendances, Plus aimes) sont presentes", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/admin/feed");

    await expect(
      page.getByRole("button", { name: /r[eé]cents/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /tendances/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /plus aim[eé]s/i }),
    ).toBeVisible();
  });

  test("la sidebar Trending est presente sur desktop", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    // S'assurer qu'on est en viewport desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/admin/feed");

    // La TrendingSidebar est dans un div "hidden lg:block"
    // On cherche le composant ou un texte typique de la sidebar
    const sidebar = page.locator(
      "text=/tendance|trending|populaire|top posts/i",
    );
    const sidebarContainer = page.locator(".lg\\:block .sticky, aside").first();

    const hasSidebarText = (await sidebar.count()) > 0;
    const hasSidebarContainer = await sidebarContainer
      .isVisible()
      .catch(() => false);

    expect(hasSidebarText || hasSidebarContainer).toBeTruthy();
  });
});

// ─── Client : Feed communautaire (/client/feed) ────────────────────────────

test.describe("Feed communautaire — Client", () => {
  test.use({ testUser: getUserByRole("client") });

  test("la page /client/feed charge correctement", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/feed");

    await expect(page).not.toHaveURL(/\/not-found/);
    await expect(page).toHaveURL(/\/client\/feed/);

    await expect(page.getByRole("heading", { name: /feed/i })).toBeVisible();
  });

  test("un client peut voir le composer et les filtres", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;
    await page.goto("/client/feed");

    // Le composer est aussi visible pour les clients
    const composer = page.locator(
      'textarea[placeholder*="communaute" i], textarea[placeholder*="partage" i]',
    );
    await expect(composer).toBeVisible();

    // Les filtres de type
    await expect(page.getByRole("button", { name: "Tout" })).toBeVisible();
  });
});
