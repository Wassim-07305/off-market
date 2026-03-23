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

test.describe("Batch 4 — School, Forms, Badges, Invitations, Announcements", () => {
  test("School page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/school`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Filter tabs
    for (const tab of ["Toutes", "En cours", "Termin", "Non commenc"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(tab, "i") }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }
  });

  test("Forms page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/forms`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Filter tabs
    for (const tab of ["Tous", "Actifs", "Ferm"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(tab, "i") }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }
  });

  test("Badges page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/badges`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Verify no emoji TypeError
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Cannot read properties of undefined");
    expect(body).not.toContain("Application error");

    // Category filters
    for (const cat of ["Tous", "Formation", "Engagement", "Social", "Special"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(cat, "i") }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }
  });

  test("Invitations page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/invitations`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // Status filters
    for (const filter of ["En attente", "Accept", "Expir", "Toutes"]) {
      const btn = page.locator("button").filter({ hasText: new RegExp(filter, "i") }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(600);
      }
    }

    // Open invite modal
    const newBtn = page.locator("button").filter({ hasText: /nouvelle invitation/i }).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(1000);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });

  test("Announcements page", async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/announcements`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });

    // New announcement
    const newBtn = page.locator("button").filter({ hasText: /nouvelle annonce/i }).first();
    if (await newBtn.isVisible().catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(1000);
      // Cancel
      const cancelBtn = page.locator("button").filter({ hasText: /annuler/i }).first();
      if (await cancelBtn.isVisible().catch(() => false)) {
        await cancelBtn.click();
      }
    }
  });

  test("Remaining pages load without crash", async ({ page }) => {
    await login(page);

    for (const route of [
      "/admin/rewards",
      "/admin/community",
      "/admin/booking",
      "/admin/calendar",
      "/admin/ai",
    ]) {
      await page.goto(`${BASE_URL}${route}`);
      await page.waitForTimeout(3000);
      await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
      const body = await page.locator("body").innerText();
      expect(body).not.toContain("Application error");
      expect(body).not.toContain("Unhandled Runtime Error");
    }
  });
});
