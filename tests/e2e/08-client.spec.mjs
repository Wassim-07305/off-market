import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  dbQuery,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Client");
const CLIENT_PROFILE_ID = "5fd740bb-84f9-43b3-80e9-64a71a53fcf6";

export async function run() {
  console.log("\n👤 SUITE: Client\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    const { page, context } = await login(browser, ACCOUNTS.client);

    // Dashboard
    await it("16.1 - Dashboard Client complet", async () => {
      await page.goto(`${BASE_URL}/client/dashboard`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-client-dashboard-typeerror");
        throw new Error("Client dashboard has TypeError error");
      }
      if (
        !content.includes("Thomas") &&
        !content.includes("Bonjour") &&
        !content.includes("dashboard")
      ) {
        await screenshot(page, "fail-client-dashboard");
        throw new Error("Client dashboard not loaded properly");
      }
    });

    // Check-in client
    await it("13.1 - Page Check-in (Client) chargee", async () => {
      await page.goto(`${BASE_URL}/client/checkin`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-client-checkin");
        throw new Error("Client checkin has TypeError error");
      }
      if (
        !content.includes("Check-in") &&
        !content.includes("check-in") &&
        !content.includes("Bien-") &&
        !content.includes("humeur")
      ) {
        await screenshot(page, "fail-client-checkin-content");
        throw new Error("Check-in page not loaded");
      }
    });

    await it("13.2 - Remplir un check-in etape Bien-etre", async () => {
      const bienBtn = await page.$(
        'button:has-text("Bien"), button:has-text("😊"), [aria-label*="Bien"]',
      );
      if (bienBtn) {
        await bienBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
      const energyBtn = await page.$(
        'button:has-text("En forme"), button:has-text("💪")',
      );
      if (energyBtn) {
        await energyBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
      const nextBtn = await page.$(
        'button:has-text("Suivant"), button:has-text("Next")',
      );
      if (nextBtn) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(1000);
      }
    });

    // Journal
    await it("14.1 - Page Journal (Client) chargee", async () => {
      await page.goto(`${BASE_URL}/client/journal`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-client-journal");
        throw new Error("Journal page has TypeError error");
      }
      if (
        !content.includes("Journal") &&
        !content.includes("journal") &&
        !content.includes("Entr")
      ) {
        await screenshot(page, "fail-client-journal-content");
        throw new Error("Journal page not loaded");
      }
    });

    await it("14.3 - Utiliser un prompt du jour", async () => {
      const promptBtn = await page.$(
        'button:has-text("Utiliser ce prompt"), button:has-text("prompt"), button:has-text("Nouveau prompt")',
      );
      if (!promptBtn) {
        const content = await page.content();
        if (!content.includes("prompt") && !content.includes("Prompt"))
          throw new Error("Prompt section not found");
      } else {
        await promptBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    // Goals
    await it("15.1 - Page Objectifs (Client) chargee", async () => {
      await page.goto(`${BASE_URL}/client/goals`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-client-goals");
        throw new Error("Goals page has TypeError error");
      }
      if (
        !content.includes("Objectif") &&
        !content.includes("objectif") &&
        !content.includes("goal")
      ) {
        await screenshot(page, "fail-client-goals-content");
        throw new Error("Goals page not loaded");
      }
    });

    // Forms
    await it("17.1 - Page Formulaires (Client) chargee", async () => {
      await page.goto(`${BASE_URL}/client/forms`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-client-forms");
        throw new Error("Forms page has TypeError error");
      }
    });

    // Additional client pages
    const clientPages = [
      { path: "/client/certificates", name: "24.1 - Certificats" },
      { path: "/client/progress", name: "24.2 - Progression" },
      { path: "/client/challenges", name: "24.3 - Defis" },
      { path: "/client/leaderboard", name: "24.4 - Classement" },
      { path: "/client/rewards", name: "24.5 - Recompenses" },
      { path: "/client/roadmap", name: "24.6 - Roadmap" },
      { path: "/client/community", name: "24.7 - Communaute" },
      { path: "/client/hall-of-fame", name: "24.8 - Hall of Fame" },
      { path: "/client/resources", name: "24.9 - Ressources" },
      { path: "/client/booking", name: "24.10 - Reserver" },
      { path: "/client/calls", name: "24.11 - Appels (Client)" },
    ];

    for (const { path, name } of clientPages) {
      await it(`${name} chargee`, async () => {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForTimeout(2000);
        const content = await page.content();
        if (
          content.includes("TypeError") &&
          content.includes("Cannot read properties")
        ) {
          await screenshot(page, `fail-${path.replace(/\//g, "-")}`);
          throw new Error(`TypeError on ${path}`);
        }
        const currentUrl = page.url();
        if (currentUrl.includes("/login"))
          throw new Error(`Redirected to login from ${path}`);
      });
    }

    // Sidebar links check
    await it("16.4 - Sidebar Client contient les liens principaux", async () => {
      await page.goto(`${BASE_URL}/client/dashboard`);
      await page.waitForTimeout(2000);
      const content = await page.content();
      const expectedLinks = [
        "Formation",
        "Messagerie",
        "Journal",
        "Objectifs",
        "Check-in",
      ];
      const missingLinks = expectedLinks.filter(
        (link) => !content.includes(link),
      );
      if (missingLinks.length > 2) {
        await screenshot(page, "fail-client-sidebar");
        throw new Error(`Missing sidebar links: ${missingLinks.join(", ")}`);
      }
    });

    await context.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("08-client.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
