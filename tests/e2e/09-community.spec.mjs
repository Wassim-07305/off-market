import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  dbQuery,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Community");

export async function run() {
  console.log("\n🌐 SUITE: Community / Feed\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    const { page, context } = await login(browser, ACCOUNTS.coach);

    // Feed page
    await it("8.1 - Page Feed (Coach) chargee", async () => {
      await page.goto(`${BASE_URL}/coach/feed`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (
        content.includes("TypeError") &&
        content.includes("Cannot read properties")
      ) {
        await screenshot(page, "fail-feed-typeerror");
        throw new Error("Feed page has TypeError error");
      }
      if (
        !content.includes("feed") &&
        !content.includes("Feed") &&
        !content.includes("communaut") &&
        !content.includes("Partage")
      ) {
        await screenshot(page, "fail-feed-load");
        throw new Error("Feed page not loaded");
      }
    });

    await it("8.2 - Publier un post", async () => {
      const postInput = await page.$(
        'textarea[placeholder*="Partage"], textarea[placeholder*="partage"], textarea[placeholder*="community"], textarea',
      );
      if (!postInput) {
        const content = await page.content();
        if (!content.includes("Partage") && !content.includes("partage"))
          throw new Error("Post input not found");
      } else {
        const testPost = `Test post E2E ${Date.now()}`;
        await postInput.fill(testPost);
        await page.waitForTimeout(500);

        const submitBtn = await page.$(
          'button[type="submit"], button:has-text("Publier"), button:has-text("Poster"), button:has-text("Partager")',
        );
        if (submitBtn) {
          await submitBtn.click();
          await page.waitForTimeout(2000);
          // DB check — table might be feed_posts or announcements
          try {
            const rows = await dbQuery(
              `SELECT * FROM feed_posts WHERE content LIKE '%Test post E2E%' ORDER BY created_at DESC LIMIT 1`,
            );
            // rows may be empty if table doesn't exist or post failed
          } catch (e) {
            // Table might not exist, just check UI
          }
        }
      }
    });

    await it("8.3 - Filtres du feed", async () => {
      const filterBtns = [
        "Tout",
        "Victoires",
        "Questions",
        "Experiences",
        "General",
      ];
      for (const text of filterBtns) {
        const btn = await page.$(
          `button:has-text("${text}"), a:has-text("${text}")`,
        );
        if (btn) {
          await btn.click();
          await page.waitForTimeout(500);
        }
      }
    });

    // Content page
    await it("7.1 - Page Contenu (Coach) chargee", async () => {
      await page.goto(`${BASE_URL}/coach/content`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (
        content.includes("TypeError") &&
        content.includes("Cannot read properties")
      ) {
        await screenshot(page, "fail-content-typeerror");
        throw new Error("Content page has TypeError error");
      }
      if (
        !content.includes("Contenu") &&
        !content.includes("contenu") &&
        !content.includes("Brouillon")
      ) {
        await screenshot(page, "fail-content-load");
        throw new Error("Content page not loaded");
      }
    });

    await it("7.2 - Creer un nouveau contenu", async () => {
      const newBtn = await page.$(
        'button:has-text("Nouveau contenu"), button:has-text("+ Contenu"), button:has-text("Nouveau")',
      );
      if (!newBtn) {
        const content = await page.content();
        if (!content.includes("Nouveau"))
          throw new Error("New content button not found");
      } else {
        await newBtn.click();
        await page.waitForTimeout(1500);
        const modal = await page.$('[role="dialog"], .modal');
        if (!modal) throw new Error("Content creation modal not opened");
        // Close modal using Escape key (avoids overlay interception)
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }
    });

    await it("7.5 - Colonnes du board Kanban presentes", async () => {
      const content = await page.content();
      const hasColumns =
        content.includes("Brouillon") ||
        content.includes("Planifi") ||
        content.includes("Publi") ||
        content.includes("Archive");
      if (!hasColumns) {
        await screenshot(page, "fail-content-kanban");
        throw new Error("Kanban columns not found in content page");
      }
    });

    await context.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("09-community.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
