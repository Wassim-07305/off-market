import { test, expect } from "@playwright/test";

const BASE_URL = "https://off-market-amber.vercel.app";
const EMAIL = "test@test.com";
const PASSWORD = "test123";

test.describe("Batch 1 — Login, Dashboard, CRM", () => {
  test("Login + Dashboard + CRM tabs", async ({ page }) => {
    // LOGIN
    await page.goto(`${BASE_URL}/login`);
    await page.locator('input[type="email"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL("**/admin/**", { timeout: 30000 });

    // DASHBOARD
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForTimeout(3000);
    await expect(page.locator("main")).toBeVisible({ timeout: 10000 });
    // Verify no crash
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("Application error");
    expect(body).not.toContain("Unhandled Runtime Error");

    // CRM
    await page.goto(`${BASE_URL}/admin/crm`);
    await page.waitForTimeout(3000);
    // Click each CRM tab
    for (const tab of ["Clients", "Suivi Coaches", "Pipeline Setter", "Pipeline Closer"]) {
      const btn = page.locator("button").filter({ hasText: tab }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(1000);
      }
    }
    // Back to Clients
    await page.locator("button").filter({ hasText: "Clients" }).first().click();
    await page.waitForTimeout(1000);

    // Try add client modal
    const addBtn = page.locator("button").filter({ hasText: /ajouter/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(1000);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  });
});
