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

test.describe("Batch 2 — Clients, Messaging, Feed", () => {
  test("Clients page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/clients`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Search
    const search = page.locator('input[placeholder*="echerch" i]').first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill("test");
      await page.waitForTimeout(800);
      await search.fill("");
      await page.waitForTimeout(500);
    }

    // Add client modal
    const addBtn = page.locator("button").filter({ hasText: /ajouter/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("Messaging page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/messaging`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Click first channel
    const channelBtn = page.locator("aside button, nav button").first();
    if (await channelBtn.isVisible().catch(() => false)) {
      await channelBtn.click();
      await page.waitForTimeout(1500);
    }

    // Type in message input (don't send)
    const msgInput = page.locator('textarea[placeholder*="message" i], textarea[placeholder*="crire" i]').first();
    if (await msgInput.isVisible().catch(() => false)) {
      await msgInput.fill("Test automatisé");
      await page.waitForTimeout(500);
      await msgInput.fill("");
    }
  });

  test("Feed page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/feed`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Click filter buttons
    for (const filter of ["Victoires", "Questions", "Tout"]) {
      const btn = page.locator("button").filter({ hasText: filter }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }

    // Click sort buttons
    for (const sort of ["Tendances", "Plus aim", "cent"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(sort, "i") }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }
  });
});
