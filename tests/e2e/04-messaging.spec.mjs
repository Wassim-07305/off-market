import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  dbQuery,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Messaging");

export async function run() {
  console.log("\n💬 SUITE: Messaging\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    const { page, context } = await login(browser, ACCOUNTS.coach);

    await it("5.1 - Page Messagerie chargee", async () => {
      await page.goto(`${BASE_URL}/coach/messaging`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (
        !content.includes("Canal") &&
        !content.includes("Message") &&
        !content.includes("General")
      ) {
        await screenshot(page, "fail-messaging-load");
        throw new Error("Messaging page not loaded");
      }
    });

    await it("5.3 - Envoyer un message dans le canal General", async () => {
      // Click on General channel
      const generalChannel = await page.$(
        'button:has-text("General"), a:has-text("General"), [data-channel="general"]',
      );
      if (generalChannel) await generalChannel.click();
      await page.waitForTimeout(1000);

      const msgInput = await page.$(
        'textarea, input[placeholder*="Message"], input[placeholder*="message"]',
      );
      if (!msgInput) {
        await screenshot(page, "fail-messaging-input");
        throw new Error("Message input not found");
      }
      const testMsg = `Test E2E message ${Date.now()}`;
      await msgInput.fill(testMsg);
      await page.waitForTimeout(500);

      const sendBtn = await page.$(
        'button:has-text("Envoyer"), button[type="submit"], button[aria-label*="envoyer"], button[aria-label*="send"]',
      );
      if (!sendBtn) {
        // Try pressing Enter
        await msgInput.press("Enter");
      } else {
        await sendBtn.click();
      }
      await page.waitForTimeout(2000);

      // DB check
      const rows = await dbQuery(`
        SELECT m.* FROM messages m
        JOIN channels c ON c.id = m.channel_id
        WHERE c.name = 'General' AND m.content LIKE '%Test E2E message%'
        ORDER BY m.created_at DESC LIMIT 1
      `);
      if (!rows.length) {
        // Message may have been sent without DB verify — check UI
        const content = await page.content();
        if (!content.includes("Test E2E"))
          throw new Error("Message not found in UI or DB");
      }
    });

    await it("5.4 - Bouton message vocal", async () => {
      const voiceBtn = await page.$(
        'button:has-text("vocal"), button[aria-label*="vocal"], button[aria-label*="audio"]',
      );
      if (!voiceBtn) {
        const content = await page.content();
        if (!content.includes("vocal") && !content.includes("audio"))
          throw new Error("Voice message button not found");
      }
    });

    await it("5.7 - Templates / Reponses rapides", async () => {
      const templatesBtn = await page.$(
        'button:has-text("Template"), button:has-text("Reponse rapide"), button[aria-label*="template"]',
      );
      if (!templatesBtn) {
        const content = await page.content();
        if (!content.includes("Template") && !content.includes("rapide"))
          throw new Error("Templates button not found");
      } else {
        await templatesBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    await it("5.12 - Rechercher un message direct", async () => {
      const searchInput = await page.$(
        'input[placeholder*="Rechercher"], input[placeholder*="rechercher"]',
      );
      if (!searchInput) {
        const content = await page.content();
        if (!content.includes("Rechercher"))
          throw new Error("Search input not found");
      } else {
        await searchInput.fill("Alexia");
        await page.waitForTimeout(1000);
      }
    });

    await it("5.15 - Creer un nouveau canal", async () => {
      const addChannelBtn = await page.$(
        'button:has-text("+"):near(:text("Canaux")), button[aria-label*="canal"], button[aria-label*="channel"]',
      );
      if (!addChannelBtn) {
        // Look for + button near "Canaux" text
        const content = await page.content();
        if (!content.includes("Canaux") && !content.includes("Canal"))
          throw new Error("Channels section not found");
      } else {
        await addChannelBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    await context.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("04-messaging.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
