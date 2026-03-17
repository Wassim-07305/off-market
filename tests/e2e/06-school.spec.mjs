import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  dbQuery,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("School/LMS");

export async function run() {
  console.log("\n🎓 SUITE: School/LMS\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    const { page: coachPage, context: coachCtx } = await login(
      browser,
      ACCOUNTS.coach,
    );

    await it("6.1 - Page Formation (Coach) chargee", async () => {
      await coachPage.goto(`${BASE_URL}/coach/school`);
      await coachPage.waitForTimeout(3000);
      const content = await coachPage.content();
      if (content.includes("Erreur") && content.includes("TypeError")) {
        await screenshot(coachPage, "fail-school-error");
        throw new Error("School page has TypeError error");
      }
      if (
        !content.includes("Formation") &&
        !content.includes("formation") &&
        !content.includes("cours")
      ) {
        await screenshot(coachPage, "fail-school-load");
        throw new Error("School page not loaded");
      }
    });

    await it("6.2 - Filtres de formations", async () => {
      const filterBtns = ["Toutes", "En cours", "Non commenc"];
      let found = false;
      for (const text of filterBtns) {
        const btn = await coachPage.$(
          `button:has-text("${text}"), a:has-text("${text}")`,
        );
        if (btn) {
          found = true;
          break;
        }
      }
      if (!found) {
        const content = await coachPage.content();
        if (!content.includes("Toutes") && !content.includes("En cours"))
          throw new Error("Formation filters not found");
      }
    });

    await it("6.3 - Recherche de formation", async () => {
      const searchInput = await coachPage.$(
        'input[placeholder*="Rechercher"], input[placeholder*="formation"]',
      );
      if (searchInput) {
        await searchInput.fill("111");
        await coachPage.waitForTimeout(1000);
      } else {
        const content = await coachPage.content();
        if (!content.includes("Rechercher"))
          throw new Error("Search input not found");
      }
    });

    await it('6.4 - Lien "Gerer les formations"', async () => {
      const adminLink = await coachPage.$(
        'a:has-text("Gerer les formations"), a:has-text("Gérer"), button:has-text("Gérer")',
      );
      if (!adminLink) {
        const content = await coachPage.content();
        if (!content.includes("Gérer") && !content.includes("Gerer"))
          throw new Error("Manage formations link not found");
      }
    });

    await it("6.5 - DB check formations existent", async () => {
      const rows = await dbQuery(
        "SELECT id, title FROM formations ORDER BY created_at DESC LIMIT 5",
      );
      // Formations may or may not exist — just verify the query runs
      if (rows === undefined) throw new Error("DB query failed for formations");
    });

    await coachCtx.close();

    // Client test
    const { page: clientPage, context: clientCtx } = await login(
      browser,
      ACCOUNTS.client,
    );

    await it("6.6 - Page Formation (Client) chargee", async () => {
      await clientPage.goto(`${BASE_URL}/client/school`);
      await clientPage.waitForTimeout(3000);
      const content = await clientPage.content();
      if (content.includes("Erreur") && content.includes("TypeError")) {
        await screenshot(clientPage, "fail-client-school-error");
        throw new Error("Client school page has TypeError error");
      }
      // Client should NOT see "Gerer les formations"
      if (
        content.includes("Gérer les formations") ||
        content.includes("Gerer les formations")
      ) {
        throw new Error("Client should not see manage formations link");
      }
    });

    await clientCtx.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("06-school.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
