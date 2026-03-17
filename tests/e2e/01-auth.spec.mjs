import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  dbQuery,
  login,
  screenshot,
  createTestRunner,
  SCREENSHOTS_DIR,
} from "./helpers.mjs";

const { it, describe, results, suiteName } = createTestRunner("Authentication");

export async function run() {
  console.log("\n🔐 SUITE: Authentication\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    // Test 1.1 - Admin login
    await it("1.1 - Login admin reussi", async () => {
      const { page, context } = await login(browser, ACCOUNTS.admin);
      const url = page.url();
      if (!url.includes("/admin"))
        throw new Error(`Expected /admin, got ${url}`);
      const body = await page.content();
      if (!body.includes("Alexia") && !body.includes("alexia"))
        throw new Error("Admin name not found in page");
      const rows = await dbQuery(
        "SELECT id, full_name, role FROM profiles WHERE email = 'admin@offmarket.fr'",
      );
      if (!rows.length) throw new Error("Admin profile not found in DB");
      if (rows[0].role !== "admin")
        throw new Error(`Expected role admin, got ${rows[0].role}`);
      await context.close();
    });

    // Test 1.2 - Coach login
    await it("1.2 - Login coach reussi", async () => {
      const { page, context } = await login(browser, ACCOUNTS.coach);
      const url = page.url();
      if (!url.includes("/coach"))
        throw new Error(`Expected /coach, got ${url}`);
      const body = await page.content();
      if (!body.includes("Sophie") && !body.includes("sophie"))
        throw new Error("Coach name not found");
      const rows = await dbQuery(
        "SELECT id, full_name, role FROM profiles WHERE email = 'coach@offmarket.fr'",
      );
      if (!rows.length) throw new Error("Coach profile not found in DB");
      await context.close();
    });

    // Test 1.3 - Client login
    await it("1.3 - Login client reussi", async () => {
      const { page, context } = await login(browser, ACCOUNTS.client);
      const url = page.url();
      if (!url.includes("/client"))
        throw new Error(`Expected /client, got ${url}`);
      await context.close();
    });

    // Test 1.4 - Wrong password
    await it("1.4 - Login avec mauvais mot de passe", async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1500);
      const emailInput = await page.$(
        'input[type="email"], input[name="email"]',
      );
      if (emailInput) await emailInput.fill("admin@offmarket.fr");
      const passInput = await page.$(
        'input[type="password"], input[name="password"]',
      );
      if (passInput) await passInput.fill("mauvais_mdp");
      await page.click(
        'button[type="submit"], button:has-text("Se connecter"), button:has-text("Connexion")',
      );
      await page.waitForTimeout(3000);
      const url = page.url();
      if (
        url.includes("/admin") ||
        url.includes("/coach") ||
        url.includes("/client/dashboard")
      ) {
        throw new Error(`Should not redirect after wrong password, got ${url}`);
      }
      await context.close();
    });

    // Test 1.5 - Unknown email
    await it("1.5 - Login avec email inexistant", async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1500);
      const emailInput = await page.$(
        'input[type="email"], input[name="email"]',
      );
      if (emailInput) await emailInput.fill("inconnu@test.fr");
      const passInput = await page.$(
        'input[type="password"], input[name="password"]',
      );
      if (passInput) await passInput.fill("nimporte");
      await page.click(
        'button[type="submit"], button:has-text("Se connecter")',
      );
      await page.waitForTimeout(3000);
      const url = page.url();
      if (!url.includes("/login"))
        throw new Error(`Should stay on /login, got ${url}`);
      await context.close();
    });

    // Test 1.6 - Logout
    await it("1.6 - Deconnexion", async () => {
      const { page, context } = await login(browser, ACCOUNTS.coach);
      await page.waitForTimeout(1000);
      // Dismiss any bottom overlay first by scrolling or pressing Escape
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      const logoutBtn = await page.$(
        'button:has-text("Déconnexion"), button:has-text("Deconnexion"), a:has-text("Déconnexion"), [aria-label*="Déconnexion"]',
      );
      if (!logoutBtn) {
        await screenshot(page, "fail-logout-no-button");
        throw new Error("Logout button not found");
      }
      // Use JavaScript click to bypass overlay
      await logoutBtn.evaluate((el) => el.click());
      await page.waitForTimeout(2000);
      const url = page.url();
      if (!url.includes("/login") && !url.endsWith("/"))
        throw new Error(`Expected /login after logout, got ${url}`);
      await context.close();
    });

    // Test 1.7 - Redirect unauthenticated
    await it("1.7 - Acces sans auth redirige vers login", async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);
      const url = page.url();
      if (!url.includes("/login") && !url.endsWith("/"))
        throw new Error(`Expected redirect to /login, got ${url}`);
      await context.close();
    });

    // Test 1.8 - Client cannot access admin
    await it("1.8 - Client redirige depuis espace admin", async () => {
      const { page, context } = await login(browser, ACCOUNTS.client);
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(2000);
      const url = page.url();
      if (url.includes("/admin/dashboard"))
        throw new Error(
          `Client should not access /admin/dashboard, got ${url}`,
        );
      await context.close();
    });

    // Test 1.9 - Forgot password link
    await it('1.9 - Lien "Oublie ?" disponible', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(2000);
      const link = await page.$(
        'a:has-text("Oubli"), a:has-text("oubli"), a[href*="forgot"]',
      );
      if (!link) throw new Error("Forgot password link not found");
      await context.close();
    });

    // Test 1.10 - Signup link
    await it('1.10 - Lien "S\'inscrire" disponible', async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(2000);
      const link = await page.$(
        'a:has-text("inscrire"), a:has-text("Inscrire"), a[href*="signup"], a[href*="register"]',
      );
      if (!link) throw new Error("Signup link not found");
      await context.close();
    });

    // Test 1.11 - Password visibility toggle
    await it("1.11 - Toggle visibilite mot de passe", async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.goto(`${BASE_URL}/login`);
      await page.waitForTimeout(1500);
      const passInput = await page.$(
        'input[type="password"], input[name="password"]',
      );
      if (!passInput) throw new Error("Password input not found");
      await passInput.fill("TestAdmin2026!");
      const passBox = await passInput.boundingBox();
      if (!passBox) throw new Error("Cannot get password input position");
      // Try to find eye icon button near password field
      const allButtons = await page.$$("button");
      let toggled = false;
      for (const btn of allButtons) {
        const box = await btn.boundingBox();
        if (
          box &&
          passBox &&
          Math.abs(box.y - passBox.y) < 30 &&
          Math.abs(box.x - passBox.x) < passBox.width + 60
        ) {
          await btn.click();
          toggled = true;
          break;
        }
      }
      if (!toggled) {
        // Try aria-label selectors
        const eyeBtn = await page.$(
          '[aria-label*="voir"], [aria-label*="show"], [aria-label*="password"], [data-testid*="toggle"]',
        );
        if (eyeBtn) {
          await eyeBtn.click();
          toggled = true;
        }
      }
      if (!toggled) throw new Error("Password toggle button not found");
      await context.close();
    });
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("01-auth.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
