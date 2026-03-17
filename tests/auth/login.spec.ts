import { test, expect, getUserByRole } from "../fixtures";

// ---------------------------------------------------------------------------
// Login — Happy paths
// ---------------------------------------------------------------------------

test.describe("Login — happy paths", () => {
  test("admin se connecte et arrive sur /admin/dashboard", async ({ page }) => {
    const admin = getUserByRole("admin");
    await page.goto("/login");

    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill(admin.password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/admin/dashboard", { timeout: 120_000 });
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    // Vérifie qu'un heading de bienvenue est visible (le prénom varie selon le user)
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("coach se connecte et arrive sur /coach/dashboard", async ({ page }) => {
    const coach = getUserByRole("coach");
    await page.goto("/login");

    await page.getByLabel("Email").fill(coach.email);
    await page.getByLabel("Mot de passe").fill(coach.password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/coach/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/coach\/dashboard/);
  });

  test("client se connecte et arrive sur /client/dashboard", async ({
    page,
  }) => {
    const client = getUserByRole("client");
    await page.goto("/login");

    await page.getByLabel("Email").fill(client.email);
    await page.getByLabel("Mot de passe").fill(client.password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/client/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/client\/dashboard/);
  });

  test("setter se connecte et arrive sur /sales/dashboard", async ({
    page,
  }) => {
    const setter = getUserByRole("setter");
    await page.goto("/login");

    await page.getByLabel("Email").fill(setter.email);
    await page.getByLabel("Mot de passe").fill(setter.password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await page.waitForURL("**/sales/dashboard", { timeout: 60_000 });
    await expect(page).toHaveURL(/\/sales\/dashboard/);
  });
});

// ---------------------------------------------------------------------------
// Login — Erreurs
// ---------------------------------------------------------------------------

test.describe("Login — erreurs", () => {
  test("mauvais email affiche un toast d'erreur", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("nexistepas@offmarket.test");
    await page.getByLabel("Mot de passe").fill("N1mporteQuoi!");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText("Email ou mot de passe incorrect")).toBeVisible(
      {
        timeout: 15_000,
      },
    );
  });

  test("mauvais mot de passe affiche un toast d'erreur", async ({ page }) => {
    const admin = getUserByRole("admin");
    await page.goto("/login");

    await page.getByLabel("Email").fill(admin.email);
    await page.getByLabel("Mot de passe").fill("MauvaisMotDePasse123!");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(page.getByText("Email ou mot de passe incorrect")).toBeVisible(
      {
        timeout: 15_000,
      },
    );
  });

  test("champs vides — le formulaire ne se soumet pas (required)", async ({
    page,
  }) => {
    await page.goto("/login");

    // Les deux champs sont required, le formulaire ne devrait pas se soumettre
    await page.getByRole("button", { name: "Se connecter" }).click();

    // On reste sur /login (pas de navigation)
    await expect(page).toHaveURL(/\/login/);

    // Le champ email est invalide (validation native du navigateur)
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("required", "");
  });
});

// ---------------------------------------------------------------------------
// Login — Liens de navigation
// ---------------------------------------------------------------------------

test.describe("Login — liens", () => {
  test("lien 'Oublie ?' navigue vers /forgot-password", async ({ page }) => {
    await page.goto("/login");

    const forgotLink = page.getByRole("link", { name: "Oublie ?" });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    await page.waitForURL("**/forgot-password", { timeout: 30_000 });
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test("lien 'S'inscrire' navigue vers /signup", async ({ page }) => {
    await page.goto("/login");

    const signupLink = page.getByRole("link", { name: "S'inscrire" });
    await expect(signupLink).toBeVisible();
    await signupLink.click();

    await page.waitForURL("**/signup", { timeout: 30_000 });
    await expect(page).toHaveURL(/\/signup/);
  });
});
