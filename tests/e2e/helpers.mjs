import { chromium } from "playwright";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const SCREENSHOTS_DIR = path.join(__dirname, "../screenshots");

export const BASE_URL = "https://off-market-amber.vercel.app";
export const DB_URL =
  "postgresql://postgres:sAmhar-rymjyr-fufto0@db.srhpdgqqiuzdrlqaitdk.supabase.co:6543/postgres";

export const ACCOUNTS = {
  admin: {
    email: "admin@offmarket.fr",
    password: "TestAdmin2026!",
    name: "Alexia Laneau",
    space: "/admin",
  },
  coach: {
    email: "coach@offmarket.fr",
    password: "TestCoach2026!",
    name: "Sophie Martin",
    space: "/coach",
  },
  client: {
    email: "prospect@offmarket.fr",
    password: "TestProspect2026!",
    name: "Thomas Dupont",
    space: "/client",
  },
};

export async function dbQuery(sql) {
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();
  try {
    const result = await client.query(sql);
    return result.rows;
  } finally {
    await client.end();
  }
}

export async function login(browser, account) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/login`);
  await page.waitForTimeout(2000);
  await page.fill(
    'input[type="email"], input[placeholder*="email"], input[placeholder*="Email"], input[name="email"]',
    account.email,
  );
  await page.fill(
    'input[type="password"], input[placeholder*="passe"], input[name="password"]',
    account.password,
  );
  await page.click(
    'button[type="submit"], button:has-text("Se connecter"), button:has-text("Connexion")',
  );
  await page.waitForTimeout(3000);
  // Dismiss any consent/cookie banner that may block interactions
  try {
    const acceptBtn = await page.$(
      'button:has-text("J\'accepte"), button:has-text("Accepter"), button:has-text("Accept cookies")',
    );
    if (acceptBtn) {
      await acceptBtn.evaluate((el) => el.click());
      await page.waitForTimeout(500);
    }
  } catch (e) {
    // ignore
  }
  return { page, context };
}

export async function screenshot(page, name) {
  try {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, `${name}.png`),
      fullPage: false,
    });
  } catch (e) {
    // ignore
  }
}

export function createTestRunner(suiteName) {
  const results = { passed: 0, failed: 0, tests: [] };

  async function it(name, fn) {
    try {
      await fn();
      results.passed++;
      results.tests.push({ name, status: "PASS" });
      console.log(`  ✅ ${name}`);
    } catch (err) {
      results.failed++;
      results.tests.push({ name, status: "FAIL", error: err.message });
      console.log(`  ❌ ${name}`);
      console.log(`     Error: ${err.message}`);
    }
  }

  function describe(label, fn) {
    console.log(`\n📦 ${label}`);
    return fn();
  }

  return { it, describe, results, suiteName };
}
