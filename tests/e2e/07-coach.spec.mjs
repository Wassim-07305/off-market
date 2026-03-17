import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  dbQuery,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Coach");

export async function run() {
  console.log("\n🧑‍🏫 SUITE: Coach\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    const { page, context } = await login(browser, ACCOUNTS.coach);

    // Test coach sessions page (known bug)
    await it("21.1 - Page Seances (Coach) — bug check", async () => {
      await page.goto(`${BASE_URL}/coach/sessions`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (
        content.includes("TypeError") &&
        content.includes("Cannot read properties")
      ) {
        await screenshot(page, "fail-coach-sessions-typeerror");
        throw new Error(
          "KNOWN BUG: TypeError on /coach/sessions — Cannot read properties of undefined",
        );
      }
      if (content.includes("Erreur") && content.includes("Espace Coach")) {
        await screenshot(page, "fail-coach-sessions-error");
        throw new Error("Sessions page shows error boundary");
      }
    });

    // Test coach alerts page (known bug)
    await it("21.2 - Page Alertes (Coach) — bug check", async () => {
      await page.goto(`${BASE_URL}/coach/alerts`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (
        content.includes("TypeError") &&
        content.includes("Cannot read properties")
      ) {
        await screenshot(page, "fail-coach-alerts-typeerror");
        throw new Error(
          "KNOWN BUG: TypeError on /coach/alerts — Cannot read properties of undefined",
        );
      }
      if (content.includes("Erreur") && content.includes("Espace Coach")) {
        await screenshot(page, "fail-coach-alerts-error");
        throw new Error("Alerts page shows error boundary");
      }
    });

    // Calls page
    await it("9.1 - Page Appels (Coach) chargee", async () => {
      await page.goto(`${BASE_URL}/coach/calls`);
      await page.waitForTimeout(3000);
      // Dismiss any consent/cookie banner
      const acceptBtn = await page.$(
        'button:has-text("J\'accepte"), button:has-text("Accepter"), button:has-text("Accept"), button:has-text("OK")',
      );
      if (acceptBtn) {
        await acceptBtn.evaluate((el) => el.click());
        await page.waitForTimeout(500);
      }
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-coach-calls");
        throw new Error("Calls page has TypeError error");
      }
      if (
        !content.includes("Appel") &&
        !content.includes("appel") &&
        !content.includes("call")
      ) {
        await screenshot(page, "fail-coach-calls-content");
        throw new Error("Calls page not loaded");
      }
    });

    await it("9.2 - Creer un nouvel appel", async () => {
      // Dismiss consent banner if present
      const acceptBtn = await page.$(
        'button:has-text("J\'accepte"), button:has-text("Accepter")',
      );
      if (acceptBtn) {
        await acceptBtn.evaluate((el) => el.click());
        await page.waitForTimeout(500);
      }

      const newCallBtn = await page.$(
        'button:has-text("Nouvel appel"), button:has-text("Nouveau"), button:has-text("+ Appel")',
      );
      if (!newCallBtn) {
        const content = await page.content();
        if (!content.includes("Nouvel") && !content.includes("Nouveau"))
          throw new Error("New call button not found");
      } else {
        // Use JS click to bypass any bottom overlay
        await newCallBtn.evaluate((el) => el.click());
        await page.waitForTimeout(1500);
        // Check for modal or any form appearing
        const modal = await page.$(
          '[role="dialog"], .modal, [class*="drawer"], [class*="panel"]',
        );
        const inputVisible = await page.$(
          'input[type="text"], input[type="datetime-local"], select',
        );
        if (!modal && !inputVisible) {
          await screenshot(page, "fail-coach-call-modal");
          throw new Error("New call modal/form not opened");
        }
        // Close modal using Escape key
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }
    });

    await it("9.3 - Navigation semaine precedente/suivante", async () => {
      const nextBtn = await page.$(
        'button:has-text(">"), button[aria-label*="suivant"], button[aria-label*="next"]',
      );
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
        const prevBtn = await page.$(
          'button:has-text("<"), button[aria-label*="precedent"], button[aria-label*="prev"]',
        );
        if (prevBtn) await prevBtn.click();
      }
    });

    // Check-ins page
    await it("10.1 - Page Check-ins (Coach) chargee", async () => {
      await page.goto(`${BASE_URL}/coach/checkins`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-coach-checkins");
        throw new Error("Check-ins page has TypeError error");
      }
      if (
        !content.includes("Check-in") &&
        !content.includes("check-in") &&
        !content.includes("Humeur")
      ) {
        await screenshot(page, "fail-coach-checkins-content");
        throw new Error("Check-ins page not loaded");
      }
    });

    // Community page
    await it("11.1 - Page Communaute (Coach) chargee", async () => {
      await page.goto(`${BASE_URL}/coach/community`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-coach-community");
        throw new Error("Community page has TypeError error");
      }
      if (
        !content.includes("Communaut") &&
        !content.includes("membre") &&
        !content.includes("Membre")
      ) {
        await screenshot(page, "fail-coach-community-content");
        throw new Error("Community page not loaded");
      }
    });

    // Calendar page
    await it("12.1 - Page Calendrier (Coach) chargee", async () => {
      await page.goto(`${BASE_URL}/coach/calendar`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("TypeError")) {
        await screenshot(page, "fail-coach-calendar");
        throw new Error("Calendar page has TypeError error");
      }
      if (
        !content.includes("Calendrier") &&
        !content.includes("calendrier") &&
        !content.includes("vnement")
      ) {
        await screenshot(page, "fail-coach-calendar-content");
        throw new Error("Calendar page not loaded");
      }
    });

    await it("12.2 - Creer un evenement", async () => {
      const eventBtn = await page.$(
        'button:has-text("Evenement"), button:has-text("Événement"), button:has-text("+ Evenement")',
      );
      if (!eventBtn) {
        const content = await page.content();
        if (!content.includes("vnement"))
          throw new Error("Event button not found");
      } else {
        await eventBtn.click();
        await page.waitForTimeout(1500);
        // Close modal using Escape key
        await page.keyboard.press("Escape");
        await page.waitForTimeout(500);
      }
    });

    await it("12.4 - Switcher entre vues Mois/Semaine/Jour", async () => {
      const monthBtn = await page.$(
        'button:has-text("Mois"), button:has-text("Month")',
      );
      const weekBtn = await page.$(
        'button:has-text("Semaine"), button:has-text("Week")',
      );
      if (!monthBtn && !weekBtn) {
        const content = await page.content();
        if (!content.includes("Mois") && !content.includes("Semaine"))
          throw new Error("View buttons not found");
      } else {
        if (weekBtn) {
          await weekBtn.click();
          await page.waitForTimeout(500);
        }
        if (monthBtn) {
          await monthBtn.click();
          await page.waitForTimeout(500);
        }
      }
    });

    await context.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("07-coach.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
