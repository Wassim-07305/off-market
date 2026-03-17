import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Security");

export async function run() {
  console.log("\n🔒 SUITE: Security\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    // Test 23.1 - Client cannot access admin pages
    await it("23.1 - Client ne peut pas acceder aux pages admin", async () => {
      const { page, context } = await login(browser, ACCOUNTS.client);
      await page.goto(`${BASE_URL}/admin/clients`);
      await page.waitForTimeout(2000);
      const url = page.url();
      if (url.includes("/admin/clients")) {
        await screenshot(page, "fail-security-client-admin");
        throw new Error(`Client accessed admin page! URL: ${url}`);
      }
      await context.close();
    });

    // Test 23.2 - Client cannot access coach pages
    await it("23.2 - Client ne peut pas acceder aux pages coach", async () => {
      const { page, context } = await login(browser, ACCOUNTS.client);
      await page.goto(`${BASE_URL}/coach/crm`);
      await page.waitForTimeout(2000);
      const url = page.url();
      if (url.includes("/coach/crm")) {
        await screenshot(page, "fail-security-client-coach");
        throw new Error(`Client accessed coach CRM! URL: ${url}`);
      }
      await context.close();
    });

    // Test 23.3 - Coach cannot access admin pages
    await it("23.3 - Coach ne peut pas acceder aux pages admin", async () => {
      const { page, context } = await login(browser, ACCOUNTS.coach);
      await page.goto(`${BASE_URL}/admin/billing`);
      await page.waitForTimeout(2000);
      const url = page.url();
      if (url.includes("/admin/billing")) {
        await screenshot(page, "fail-security-coach-admin");
        throw new Error(`Coach accessed admin billing! URL: ${url}`);
      }
      await context.close();
    });

    // Test - Unauthenticated access
    await it("1.7 - Acces non-auth vers pages protegees", async () => {
      const protectedPaths = [
        "/admin/dashboard",
        "/coach/dashboard",
        "/client/dashboard",
      ];
      for (const path of protectedPaths) {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForTimeout(2000);
        const url = page.url();
        if (url.includes(path)) {
          await screenshot(
            page,
            `fail-security-unauth-${path.replace(/\//g, "-")}`,
          );
          await context.close();
          throw new Error(`Unauthenticated user accessed ${path}! URL: ${url}`);
        }
        await context.close();
      }
    });

    // Test admin pages load
    await it("22.x - Pages admin supplementaires chargees", async () => {
      const { page, context } = await login(browser, ACCOUNTS.admin);
      const adminPages = [
        "/admin/forms",
        "/admin/invitations",
        "/admin/resources",
        "/admin/rewards",
        "/admin/badges",
        "/admin/moderation",
        "/admin/csm",
        "/admin/analytics",
        "/admin/audit",
        "/admin/faq",
        "/admin/upsell",
      ];

      const errors = [];
      for (const path of adminPages) {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForTimeout(2000);
        const content = await page.content();
        const url = page.url();
        if (url.includes("/login")) {
          errors.push(`${path} → redirected to login`);
        } else if (
          content.includes("TypeError") &&
          content.includes("Cannot read properties")
        ) {
          await screenshot(page, `fail-admin${path.replace(/\//g, "-")}`);
          errors.push(`${path} → TypeError`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Admin pages with errors:\n${errors.join("\n")}`);
      }
      await context.close();
    });

    // Test navigation UX
    await it("20.2 - Panneau Notifications accessible", async () => {
      const { page, context } = await login(browser, ACCOUNTS.coach);
      await page.waitForTimeout(1000);
      const notifBtn = await page.$(
        'button[aria-label*="notification"], button[aria-label*="Notification"], button:has([class*="bell"]), button:has-text("Notifications")',
      );
      if (!notifBtn) {
        const content = await page.content();
        if (!content.includes("notif") && !content.includes("Notif"))
          throw new Error("Notifications button not found in header");
      } else {
        await notifBtn.click();
        await page.waitForTimeout(1000);
      }
      await context.close();
    });

    await it("20.4 - Page Parametres (Coach) accessible", async () => {
      const { page, context } = await login(browser, ACCOUNTS.coach);
      await page.goto(`${BASE_URL}/coach/settings`);
      await page.waitForTimeout(2000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-coach-settings");
        throw new Error("Coach settings has TypeError error");
      }
      if (
        !content.includes("Param") &&
        !content.includes("param") &&
        !content.includes("settings")
      ) {
        await screenshot(page, "fail-coach-settings-content");
        throw new Error("Coach settings page not loaded");
      }
      await context.close();
    });

    await it("20.5 - Page Parametres (Client) accessible", async () => {
      const { page, context } = await login(browser, ACCOUNTS.client);
      await page.goto(`${BASE_URL}/client/settings`);
      await page.waitForTimeout(2000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-client-settings");
        throw new Error("Client settings has TypeError error");
      }
      await context.close();
    });
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("10-security.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
