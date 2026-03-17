import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Billing");

export async function run() {
  console.log("\n💰 SUITE: Billing\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    const { page, context } = await login(browser, ACCOUNTS.admin);

    await it("22.1 - Page Facturation (Admin) chargee", async () => {
      await page.goto(`${BASE_URL}/admin/billing`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      if (content.includes("Erreur") && content.includes("TypeError")) {
        await screenshot(page, "fail-billing-error");
        throw new Error("Billing page has TypeError error");
      }
      if (
        !content.includes("Factur") &&
        !content.includes("billing") &&
        !content.includes("Contrat") &&
        !content.includes("Invoice")
      ) {
        await screenshot(page, "fail-billing-content");
        throw new Error("Billing page not loaded properly");
      }
    });

    // Contracts (client)
    await context.close();
    const { page: clientPage, context: clientCtx } = await login(
      browser,
      ACCOUNTS.client,
    );

    await it("18.1 - Page Contrats (Client) chargee", async () => {
      await clientPage.goto(`${BASE_URL}/client/contracts`);
      await clientPage.waitForTimeout(3000);
      const content = await clientPage.content();
      if (content.includes("Erreur") && content.includes("TypeError")) {
        await screenshot(clientPage, "fail-contracts-error");
        throw new Error("Contracts page has TypeError error");
      }
    });

    await it("19.1 - Page Factures (Client) chargee", async () => {
      await clientPage.goto(`${BASE_URL}/client/invoices`);
      await clientPage.waitForTimeout(3000);
      const content = await clientPage.content();
      if (content.includes("Erreur") && content.includes("TypeError")) {
        await screenshot(clientPage, "fail-invoices-error");
        throw new Error("Invoices page has TypeError error");
      }
    });

    await clientCtx.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("05-billing.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
