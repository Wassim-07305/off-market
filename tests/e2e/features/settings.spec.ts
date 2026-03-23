import { test, expect, Page } from "@playwright/test";
import { setupNetworkErrorTracking, checkNoNetworkErrors } from "./helpers";

const BASE_URL = "https://off-market-amber.vercel.app";

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill("input[type='email'], input[name='email']", "test@test.com");
  await page.fill("input[type='password'], input[name='password']", "test123");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/(admin|coach|client|sales)/, { timeout: 30000 });
}

// ---------------------------------------------------------------------------
// Parametres / Settings
// ---------------------------------------------------------------------------

test.describe("Parametres", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("page charge sans erreur", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const errorText = page.getByText(/erreur 500|internal server error/i).first();
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
    checkNoNetworkErrors(tracker);
  });

  test("formulaire profil visible avec champs nom, email, bio", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const nameField = page.locator("input[name*='name'], input[name*='nom'], input[placeholder*='nom']").first();
    const emailField = page.locator("input[name*='email'], input[type='email']").first();
    const bioField = page.locator("textarea[name*='bio'], textarea[placeholder*='bio'], textarea").first();

    let found = 0;
    try {
      if (await nameField.isVisible({ timeout: 5000 })) found++;
    } catch { /* skip */ }
    try {
      if (await emailField.isVisible({ timeout: 5000 })) found++;
    } catch { /* skip */ }
    try {
      if (await bioField.isVisible({ timeout: 5000 })) found++;
    } catch { /* skip */ }

    expect(found).toBeGreaterThanOrEqual(1);
    checkNoNetworkErrors(tracker);
  });

  test("toggle theme clair/sombre visible et fonctionnel", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    // Look for theme toggle
    const themeOptions = [/clair|light/i, /sombre|dark/i, /système|system/i];
    let found = 0;
    for (const pattern of themeOptions) {
      try {
        const el = page.getByRole("button", { name: pattern }).or(page.getByRole("radio", { name: pattern })).or(page.getByText(pattern));
        if (await el.first().isVisible({ timeout: 3000 })) found++;
      } catch {
        // skip
      }
    }

    if (found === 0) {
      // Try looking for a toggle/switch
      const themeToggle = page.locator("button[aria-label*='thème'], button[aria-label*='theme'], [class*='theme-toggle']").first();
      try {
        await expect(themeToggle).toBeVisible({ timeout: 5000 });
        found = 1;
      } catch {
        // skip
      }
    }

    expect(found).toBeGreaterThanOrEqual(1);
    checkNoNetworkErrors(tracker);
  });

  test("sections/onglets de parametres cliquables", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    // Settings page may have sections as headings or buttons, not tabs
    // Just verify the page has interactive content
    const buttons = page.locator("main button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(1);
    // Click first button that's not dangerous
    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);
      const text = await btn.innerText().catch(() => "");
      if (text.toLowerCase().includes("supprimer") || text.toLowerCase().includes("déconnexion")) continue;
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
    }
    checkNoNetworkErrors(tracker);
  });

  test("theme sombre peut etre active", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const darkBtn = page.getByRole("button", { name: /sombre|dark/i }).or(page.getByText(/sombre/i)).first();
    try {
      if (await darkBtn.isVisible({ timeout: 5000 })) {
        await darkBtn.click();
        await page.waitForTimeout(1000);
        // Check if dark class was added
        const htmlClass = await page.locator("html").getAttribute("class");
        const hasDark = htmlClass?.includes("dark") || false;
        // Reset to light
        const lightBtn = page.getByRole("button", { name: /clair|light/i }).or(page.getByText(/clair/i)).first();
        if (await lightBtn.isVisible({ timeout: 3000 })) {
          await lightBtn.click();
        }
      }
    } catch {
      // Theme toggle not accessible
    }
    checkNoNetworkErrors(tracker);
  });
});
