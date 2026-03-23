import { test, chromium, Page, Browser } from "@playwright/test";

// ─── Config ───────────────────────────────────────────────────────────
const BASE_URL = "https://off-market-amber.vercel.app";
const CDP_ENDPOINT = "http://localhost:9222";
const EMAIL = "test@test.com";
const PASSWORD = "test123";

// Toutes les pages admin à tester
const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/crm",
  "/admin/clients",
  "/admin/calls",
  "/admin/messaging",
  "/admin/notifications",
  "/admin/school",
  "/admin/feed",
  "/admin/content",
  "/admin/resources",
  "/admin/forms",
  "/admin/rewards",
  "/admin/community",
  "/admin/billing",
  "/admin/billing/ca",
  "/admin/billing/contracts",
  "/admin/billing/invoices",
  "/admin/users",
  "/admin/settings",
  "/admin/analytics",
  "/admin/badges",
  "/admin/invitations",
  "/admin/announcements",
  "/admin/integrations",
  "/admin/booking",
  "/admin/calendar",
  "/admin/ai",
];

// ─── Types ────────────────────────────────────────────────────────────
interface PageResult {
  route: string;
  status: "✅" | "❌" | "⚠️";
  loadTimeMs: number;
  consoleErrors: string[];
  pageError: string | null;
  redirectedTo: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function isLoginPage(url: string): boolean {
  return url.includes("/login") || url.includes("/register") || url.includes("/signup");
}

async function loginIfNeeded(page: Page): Promise<boolean> {
  if (!isLoginPage(page.url())) return false;
  console.log("  🔐 Login detected — logging in...");
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  await emailInput.first().waitFor({ state: "visible", timeout: 5000 });
  await emailInput.first().fill(EMAIL);
  await passwordInput.first().fill(PASSWORD);
  const submitBtn = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter"), button:has-text("Login")');
  await submitBtn.first().click();
  await page.waitForURL((url) => !url.toString().includes("/login"), { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log(`  🔐 Post-login: ${page.url()}`);
  return true;
}

async function getPageError(page: Page): Promise<string | null> {
  try {
    const bodyText = await page.locator("body").innerText({ timeout: 3000 });
    const lower = bodyText.toLowerCase();
    if (lower.includes("application error") || lower.includes("unhandled runtime error") || lower.includes("internal server error")) {
      return bodyText.slice(0, 300);
    }
  } catch { /* ignore */ }
  return null;
}

// ─── Test ─────────────────────────────────────────────────────────────

test.describe("Smoke Test — All Admin Pages", () => {
  let browser: Browser;
  let page: Page;

  test.beforeAll(async () => {
    browser = await chromium.connectOverCDP(CDP_ENDPOINT);
    const contexts = browser.contexts();
    if (contexts.length === 0) throw new Error("No browser context found");
    page = await contexts[0].newPage();
  });

  test.afterAll(async () => {
    if (page) await page.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
  });

  test("Visiter toutes les pages admin et vérifier qu'elles chargent", async () => {
    const results: PageResult[] = [];

    for (const route of ADMIN_ROUTES) {
      const consoleErrors: string[] = [];

      const onConsole = (msg: { type: () => string; text: () => string }) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (text.includes("favicon") || text.includes("DevTools") || text.includes("hydration")) return;
          consoleErrors.push(text.slice(0, 200));
        }
      };
      page.on("console", onConsole);

      console.log(`📄 ${route}`);
      const start = Date.now();

      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
        await page.waitForTimeout(2000);

        // Login si nécessaire
        if (isLoginPage(page.url())) {
          await loginIfNeeded(page);
          if (!isLoginPage(page.url())) {
            await page.goto(`${BASE_URL}${route}`, { waitUntil: "domcontentloaded", timeout: 15000 });
            await page.waitForTimeout(2000);
          }
        }

        const loadTime = Date.now() - start;
        const finalUrl = page.url();
        const redirected = !finalUrl.includes(route) ? finalUrl : null;
        const pageError = await getPageError(page);

        // Déterminer le status
        let status: "✅" | "❌" | "⚠️" = "✅";
        if (pageError || isLoginPage(finalUrl)) status = "❌";
        else if (consoleErrors.length > 0 || redirected) status = "⚠️";

        const result: PageResult = { route, status, loadTimeMs: loadTime, consoleErrors, pageError, redirectedTo: redirected };
        results.push(result);

        const errSummary = consoleErrors.length > 0 ? ` | ${consoleErrors.length} console errors` : "";
        const redirectSummary = redirected ? ` | → ${redirected}` : "";
        console.log(`  ${status} ${loadTime}ms${errSummary}${redirectSummary}`);

        if (pageError) {
          console.log(`  💥 ${pageError.slice(0, 100)}`);
          await page.screenshot({ path: `test-results/smoke-screenshots/error-${route.replace(/\//g, "_")}.png` }).catch(() => {});
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        results.push({
          route, status: "❌", loadTimeMs: Date.now() - start,
          consoleErrors, pageError: errMsg.slice(0, 200), redirectedTo: null,
        });
        console.log(`  ❌ ${errMsg.slice(0, 100)}`);
      }

      page.removeListener("console", onConsole);
    }

    // ─── Rapport ──────────────────────────────────────────────
    console.log("\n" + "═".repeat(70));
    console.log("  📊 RAPPORT SMOKE TEST");
    console.log("═".repeat(70));

    const ok = results.filter((r) => r.status === "✅").length;
    const warn = results.filter((r) => r.status === "⚠️").length;
    const fail = results.filter((r) => r.status === "❌").length;

    console.log(`\n  Pages testées: ${results.length}`);
    console.log(`  ✅ OK: ${ok}`);
    console.log(`  ⚠️ Warnings: ${warn}`);
    console.log(`  ❌ Erreurs: ${fail}`);

    console.log("\n  Détail:");
    console.log("  " + "-".repeat(68));
    for (const r of results) {
      const time = `${r.loadTimeMs}ms`.padEnd(7);
      const errors = r.consoleErrors.length > 0 ? ` | ${r.consoleErrors.length} console err` : "";
      const redir = r.redirectedTo ? ` | → ${r.redirectedTo.slice(0, 40)}` : "";
      const crash = r.pageError ? ` | 💥 ${r.pageError.slice(0, 50)}` : "";
      console.log(`  ${r.status} ${r.route.padEnd(30)} ${time}${errors}${redir}${crash}`);
    }

    // Console errors détaillées
    const pagesWithErrors = results.filter((r) => r.consoleErrors.length > 0);
    if (pagesWithErrors.length > 0) {
      console.log("\n  Erreurs console détaillées:");
      console.log("  " + "-".repeat(68));
      for (const r of pagesWithErrors) {
        for (const err of r.consoleErrors) {
          console.log(`  ${r.route}: ${err.slice(0, 100)}`);
        }
      }
    }

    console.log("\n" + "═".repeat(70));
  });
});
