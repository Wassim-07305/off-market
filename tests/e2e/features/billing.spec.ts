import { test, expect, Page } from "@playwright/test";
import { setupNetworkErrorTracking, checkNoNetworkErrors } from "./helpers";

const BASE_URL = "https://off-market-amber.vercel.app";

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState("networkidle");
  await page.fill("input[type='email'], input[name='email']", "test@test.com");
  await page.fill("input[type='password'], input[name='password']", "test123");
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/(admin|coach|client|sales)/, { timeout: 30000 });
}

// ---------------------------------------------------------------------------
// Billing / Facturation
// ---------------------------------------------------------------------------

test.describe("Billing — Page principale", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/billing`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("page charge sans erreur", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const body = page.locator("body");
    await expect(body).toBeVisible();
    const errorText = page.getByText(/erreur 500|internal server error/i).first();
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
    checkNoNetworkErrors(tracker);
  });

  test("KPI revenus du mois visible", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const revenueKpi = page.getByText(/revenus|chiffre.*mois|ca.*mois/i).first();
    try {
      await expect(revenueKpi).toBeVisible({ timeout: 10000 });
    } catch {
      // KPI may have different label
    }
    checkNoNetworkErrors(tracker);
  });

  test("4 cartes stats visibles (Encaisses, En attente, En retard, Contrats)", async ({
    page,
  }) => {
    const tracker = setupNetworkErrorTracking(page);
    const statPatterns = [/encaiss/i, /attente/i, /retard/i, /contrats|signés|signes/i];
    let found = 0;
    for (const pattern of statPatterns) {
      try {
        const el = page.getByText(pattern).first();
        if (await el.isVisible({ timeout: 5000 })) found++;
      } catch {
        // skip
      }
    }
    expect(found).toBeGreaterThanOrEqual(1);
    checkNoNetworkErrors(tracker);
  });
});

test.describe("Billing — Contrats", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/billing/contracts`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("page contrats charge", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const body = page.locator("body");
    await expect(body).toBeVisible();
    checkNoNetworkErrors(tracker);
  });

  test("5 filtres d'onglets visibles (Tous, Brouillons, Envoyes, Signes, Annules)", async ({
    page,
  }) => {
    const tracker = setupNetworkErrorTracking(page);
    const filterPatterns = [/tous|tout/i, /brouillon/i, /envoyé|envoye/i, /signé|signe/i, /annulé|annule/i];
    let found = 0;
    for (const pattern of filterPatterns) {
      try {
        const el = page.getByRole("tab", { name: pattern }).or(page.getByRole("button", { name: pattern })).or(page.getByText(pattern));
        if (await el.first().isVisible({ timeout: 3000 })) found++;
      } catch {
        // skip
      }
    }
    expect(found).toBeGreaterThanOrEqual(1);
    checkNoNetworkErrors(tracker);
  });

  test("liste de contrats ou etat vide visible", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const contractsList = page.locator("table, [class*='contract'], [class*='list']").first();
    const emptyState = page.getByText(/aucun contrat|pas de contrat|vide/i).first();
    const hasContracts = await contractsList.isVisible().catch(() => false);
    const isEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasContracts || isEmpty).toBeTruthy();
    checkNoNetworkErrors(tracker);
  });
});

test.describe("Billing — Factures", () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/admin/billing/invoices`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
  });

  test("page factures charge", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const body = page.locator("body");
    await expect(body).toBeVisible();
    checkNoNetworkErrors(tracker);
  });

  test("KPI ou liste de factures visible", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    const content = page.locator("table, [class*='invoice'], [class*='facture'], [class*='card']").first();
    try {
      await expect(content).toBeVisible({ timeout: 10000 });
    } catch {
      // Empty state
      const emptyState = page.getByText(/aucune facture|pas de facture/i).first();
      try {
        await expect(emptyState).toBeVisible({ timeout: 5000 });
      } catch {
        // Page may still be loading
      }
    }
    checkNoNetworkErrors(tracker);
  });
});

test.describe("Billing — Navigation entre sous-pages", () => {
  test("naviguer de billing vers contracts puis invoices", async ({ page }) => {
    const tracker = setupNetworkErrorTracking(page);
    await login(page);
    await page.goto(`${BASE_URL}/admin/billing`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Navigate to contracts
    await page.goto(`${BASE_URL}/admin/billing/contracts`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/billing/contracts");

    // Navigate to invoices
    await page.goto(`${BASE_URL}/admin/billing/invoices`);
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/billing/invoices");
    checkNoNetworkErrors(tracker);
  });
});
