import { test } from "@playwright/test";

test("login and navigate", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("domcontentloaded");
});
