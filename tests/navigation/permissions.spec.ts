import { test, expect, getUserByRole } from "../fixtures";

// ---------------------------------------------------------------------------
// Client — ne peut PAS acceder aux routes admin ou coach
// ---------------------------------------------------------------------------

test.describe("Permissions — client", () => {
  test.use({ testUser: getUserByRole("client") });

  test("client accede a /admin/dashboard → redirige vers /client/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/dashboard");
    await page.waitForURL("**/client/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/client\/dashboard/);
  });

  test("client accede a /coach/dashboard → redirige vers /client/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/coach/dashboard");
    await page.waitForURL("**/client/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/client\/dashboard/);
  });

  test("client accede a /sales/dashboard → redirige vers /client/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/sales/dashboard");
    await page.waitForURL("**/client/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/client\/dashboard/);
  });
});

// ---------------------------------------------------------------------------
// Coach — ne peut PAS acceder aux routes admin
// ---------------------------------------------------------------------------

test.describe("Permissions — coach", () => {
  test.use({ testUser: getUserByRole("coach") });

  test("coach accede a /admin/dashboard → redirige vers /coach/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/dashboard");
    await page.waitForURL("**/coach/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/coach\/dashboard/);
  });

  test("coach accede a /client/dashboard → redirige vers /coach/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/dashboard");
    await page.waitForURL("**/coach/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/coach\/dashboard/);
  });

  test("coach accede a /sales/dashboard → redirige vers /coach/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/sales/dashboard");
    await page.waitForURL("**/coach/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/coach\/dashboard/);
  });
});

// ---------------------------------------------------------------------------
// Setter — ne peut PAS acceder aux routes admin ou coach
// ---------------------------------------------------------------------------

test.describe("Permissions — setter", () => {
  test.use({ testUser: getUserByRole("setter") });

  test("setter accede a /admin/dashboard → redirige vers /sales/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/dashboard");
    await page.waitForURL("**/sales/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/sales\/dashboard/);
  });

  test("setter accede a /coach/dashboard → redirige vers /sales/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/coach/dashboard");
    await page.waitForURL("**/sales/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/sales\/dashboard/);
  });

  test("setter accede a /client/dashboard → redirige vers /sales/dashboard", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/client/dashboard");
    await page.waitForURL("**/sales/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/sales\/dashboard/);
  });
});
