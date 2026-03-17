import { test, expect, getUserByRole } from "../fixtures";

test.use({ testUser: getUserByRole("admin") });

test.describe("Logout", () => {
  test("admin clique Deconnexion dans la sidebar et est redirige vers /login", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 60_000 });

    // Ferme le Next.js dev overlay s'il est present
    await page.evaluate(() => {
      document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
    });

    const logoutButton = page.getByRole("button", { name: "Déconnexion" });
    await expect(logoutButton).toBeVisible({ timeout: 10_000 });
    await logoutButton.click({ force: true });

    await page.waitForURL("**/login", { timeout: 30_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("apres logout, acceder a /admin/dashboard redirige vers /login", async ({
    authenticatedPage,
  }) => {
    const { page } = authenticatedPage;

    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 60_000 });

    // Ferme le Next.js dev overlay
    await page.evaluate(() => {
      document.querySelectorAll("nextjs-portal").forEach((el) => el.remove());
    });

    const logoutButton = page.getByRole("button", { name: "Déconnexion" });
    await expect(logoutButton).toBeVisible({ timeout: 10_000 });
    await logoutButton.click({ force: true });
    await page.waitForURL("**/login", { timeout: 30_000 });

    // Tente d'acceder au dashboard admin apres logout
    await page.goto("/admin/dashboard");
    await page.waitForURL("**/login", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
