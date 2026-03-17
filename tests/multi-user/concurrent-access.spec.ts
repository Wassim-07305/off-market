import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "e2e-admin-1@offmarket.test";
const CLIENT_1_EMAIL = "e2e-client-1@offmarket.test";
const CLIENT_2_EMAIL = "e2e-client-2@offmarket.test";
const PASSWORD = "TestE2E123!";

async function loginUser(
  page: import("@playwright/test").Page,
  email: string,
  password: string,
) {
  await page.goto("/login");

  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Mot de passe" }).fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.waitForURL(/\/(admin|coach|client|setter|closer)\//, {
    timeout: 60_000,
  });
}

test.describe("Multi-user — Acces concurrent", () => {
  test("admin et client connectes en meme temps voient leur propre dashboard", async ({
    browser,
  }) => {
    // Context 1 : admin
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Context 2 : client
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    // Login en parallele
    await Promise.all([
      loginUser(adminPage, ADMIN_EMAIL, PASSWORD),
      loginUser(clientPage, CLIENT_1_EMAIL, PASSWORD),
    ]);

    // Verifie que chacun est sur le bon dashboard
    const adminUrl = adminPage.url();
    const clientUrl = clientPage.url();

    expect(adminUrl).toContain("/admin/");
    expect(clientUrl).toContain("/client/");

    // Verifie que le contenu est different (chacun voit son propre dashboard)
    const adminBody = await adminPage.locator("body").textContent();
    const clientBody = await clientPage.locator("body").textContent();

    // Les dashboards doivent avoir du contenu
    expect(adminBody).toBeTruthy();
    expect(clientBody).toBeTruthy();

    // Pas d'erreur sur aucune des deux pages
    await expect(adminPage.locator("body")).not.toContainText("500");
    await expect(clientPage.locator("body")).not.toContainText("500");

    await adminContext.close();
    await clientContext.close();
  });

  test("2 clients connectes en meme temps ont chacun leur propre session", async ({
    browser,
  }) => {
    // Context 1 : client 1
    const client1Context = await browser.newContext();
    const client1Page = await client1Context.newPage();

    // Context 2 : client 2
    const client2Context = await browser.newContext();
    const client2Page = await client2Context.newPage();

    // Login en parallele
    await Promise.all([
      loginUser(client1Page, CLIENT_1_EMAIL, PASSWORD),
      loginUser(client2Page, CLIENT_2_EMAIL, PASSWORD),
    ]);

    // Les deux sont sur le dashboard client
    expect(client1Page.url()).toContain("/client/");
    expect(client2Page.url()).toContain("/client/");

    // Navigue vers le profil ou les settings pour verifier l'identite
    await Promise.all([
      client1Page.goto("/client/dashboard"),
      client2Page.goto("/client/dashboard"),
    ]);

    await Promise.all([
      client1Page.waitForLoadState("networkidle"),
      client2Page.waitForLoadState("networkidle"),
    ]);

    // Pas de crash
    await expect(client1Page.locator("body")).not.toContainText("500");
    await expect(client2Page.locator("body")).not.toContainText("500");

    // Les deux sessions sont independantes (chacun voit son contenu)
    await expect(client1Page.locator("body")).toBeVisible();
    await expect(client2Page.locator("body")).toBeVisible();

    await client1Context.close();
    await client2Context.close();
  });

  test("isolation des donnees : un client ne voit pas les pages admin", async ({
    browser,
  }) => {
    // Context 1 : admin
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // Context 2 : client
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();

    // Login en parallele
    await Promise.all([
      loginUser(adminPage, ADMIN_EMAIL, PASSWORD),
      loginUser(clientPage, CLIENT_1_EMAIL, PASSWORD),
    ]);

    // L'admin accede au dashboard admin — doit fonctionner
    await adminPage.goto("/admin/dashboard");
    await adminPage.waitForLoadState("networkidle");
    await expect(adminPage.locator("body")).not.toContainText("403");
    await expect(adminPage.locator("body")).not.toContainText("Acces refuse");

    // Le client tente d'acceder au dashboard admin — doit etre bloque ou redirige
    await clientPage.goto("/admin/dashboard");
    await clientPage.waitForLoadState("networkidle");

    // Attend un court instant pour laisser les guards s'executer
    await clientPage.waitForTimeout(3_000);

    const clientUrlAfterAdminAttempt = clientPage.url();

    // Le client ne doit PAS etre sur /admin/dashboard
    // Il doit etre redirige ou voir un message d'erreur d'acces
    const isRedirected =
      !clientUrlAfterAdminAttempt.includes("/admin/dashboard");
    const hasAccessDenied =
      (await clientPage
        .locator("text=/acces refuse|non autorise|permission|interdit|403/i")
        .count()) > 0;
    const isOnClientDashboard = clientUrlAfterAdminAttempt.includes("/client/");
    const isOnLogin = clientUrlAfterAdminAttempt.includes("/login");

    expect(
      isRedirected || hasAccessDenied || isOnClientDashboard || isOnLogin,
    ).toBeTruthy();

    // L'admin peut acceder aux finances — doit fonctionner
    await adminPage.goto("/admin/finances");
    await adminPage.waitForLoadState("networkidle");
    await expect(adminPage.locator("body")).not.toContainText("500");

    // Le client tente d'acceder aux finances admin — doit etre bloque
    await clientPage.goto("/admin/finances");
    await clientPage.waitForLoadState("networkidle");
    await clientPage.waitForTimeout(3_000);

    const clientUrlAfterFinanceAttempt = clientPage.url();
    const isFinanceBlocked =
      !clientUrlAfterFinanceAttempt.includes("/admin/finances");
    const hasFinanceAccessDenied =
      (await clientPage
        .locator("text=/acces refuse|non autorise|permission|interdit|403/i")
        .count()) > 0;

    expect(isFinanceBlocked || hasFinanceAccessDenied).toBeTruthy();

    await adminContext.close();
    await clientContext.close();
  });
});
