import { test, expect, type Page } from "@playwright/test";

const BASE_URL = "https://off-market-amber.vercel.app";
const EMAIL = "test@test.com";
const PASSWORD = "test123";

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 20000 });
  await page.waitForTimeout(2000);
}

test.describe("Batch 3 — Billing, Users, Settings, Analytics", () => {
  test("Billing pages", async ({ page }) => {
    await login(page);

    // Main billing page
    await page.goto(`${BASE_URL}/admin/billing`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Application error");

    // Contracts
    await page.goto(`${BASE_URL}/admin/billing/contracts`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Invoices
    await page.goto(`${BASE_URL}/admin/billing/invoices`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // CA
    await page.goto(`${BASE_URL}/admin/billing/ca`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
  });

  test("Users page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/users`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Filter tabs
    for (const filter of ["Actifs", "Archiv", "Tous"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(filter, "i") }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(800);
      }
    }

    // Search
    const search = page.locator('input[placeholder*="echerch" i]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill("test");
      await page.waitForTimeout(800);
      await search.fill("");
    }
  });

  test("Settings page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/settings`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Application error");
  });

  test("Analytics page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/analytics`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Application error");
  });
});
