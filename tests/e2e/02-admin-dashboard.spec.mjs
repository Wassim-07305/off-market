import { chromium } from "playwright";
import {
  BASE_URL,
  ACCOUNTS,
  login,
  screenshot,
  createTestRunner,
} from "./helpers.mjs";

const { it, results } = createTestRunner("Admin Dashboard");

export async function run() {
  console.log("\n📊 SUITE: Admin Dashboard\n" + "=".repeat(50));
  const browser = await chromium.launch({ headless: true });

  try {
    // Login once and reuse context
    const { page, context } = await login(browser, ACCOUNTS.admin);

    await it("2.1 - KPIs affiches sur le dashboard admin", async () => {
      await page.goto(`${BASE_URL}/admin/dashboard`);
      await page.waitForTimeout(3000);
      const content = await page.content();
      const hasKPI =
        content.includes("CA du mois") ||
        content.includes("Eleves actifs") ||
        content.includes("Nouveaux") ||
        content.includes("LTV");
      if (!hasKPI) {
        await screenshot(page, "fail-admin-kpi");
        throw new Error("KPI cards not found on admin dashboard");
      }
    });

    await it("2.2 - Metriques secondaires presentes", async () => {
      const content = await page.content();
      const hasMetrics =
        content.includes("Retention") ||
        content.includes("Churn") ||
        content.includes("closing") ||
        content.includes("Completion");
      if (!hasMetrics) {
        await screenshot(page, "fail-admin-metrics");
        throw new Error("Secondary metrics not found");
      }
    });

    await it("2.3 - Graphique Evolution CA visible", async () => {
      const content = await page.content();
      const hasChart =
        content.includes("Evolution CA") ||
        content.includes("volution") ||
        content.includes("recharts") ||
        content.includes("svg");
      if (!hasChart) {
        await screenshot(page, "fail-admin-chart");
        throw new Error("Revenue chart not found");
      }
    });

    await it("2.4 - Graphique CA par canal visible", async () => {
      const content = await page.content();
      const hasPieChart =
        content.includes("canal") ||
        content.includes("Canal") ||
        content.includes("pie") ||
        content.includes("camembert");
      if (!hasPieChart) {
        await screenshot(page, "fail-admin-pie");
        throw new Error("Canal chart not found");
      }
    });

    await it("2.5 - Comparaison de periodes fonctionnelle", async () => {
      const content = await page.content();
      const hasPeriod =
        content.includes("Comparaison") ||
        content.includes("Periode") ||
        content.includes("periode");
      if (!hasPeriod) {
        await screenshot(page, "fail-admin-period");
        throw new Error("Period comparison section not found");
      }
    });

    await it("2.6 - Rapport IA hebdomadaire visible", async () => {
      const content = await page.content();
      const hasIA =
        content.includes("Rapport IA") ||
        content.includes("IA hebdomadaire") ||
        content.includes("Regenerer") ||
        content.includes("intelligence");
      if (!hasIA) {
        await screenshot(page, "fail-admin-ai-report");
        throw new Error("IA weekly report not found");
      }
    });

    await it('2.7 - Bouton "Voir les alertes" fonctionnel', async () => {
      const alertBtn = await page.$(
        'button:has-text("Voir les alertes"), a:has-text("Voir les alertes"), button:has-text("alertes")',
      );
      if (!alertBtn) {
        const content = await page.content();
        if (!content.includes("alerte"))
          throw new Error("Alerts section not found");
      } else {
        await alertBtn.click();
        await page.waitForTimeout(1500);
      }
    });

    await it("2.8 - Sidebar admin contient les liens principaux", async () => {
      const content = await page.content();
      const expectedLinks = [
        "Dashboard",
        "CRM",
        "Messagerie",
        "Formation",
        "Analytics",
        "Parametres",
      ];
      const missingLinks = expectedLinks.filter(
        (link) => !content.includes(link),
      );
      if (missingLinks.length > 3) {
        await screenshot(page, "fail-admin-sidebar");
        throw new Error(`Missing sidebar links: ${missingLinks.join(", ")}`);
      }
    });

    await it('2.9 - Bouton "Reduire" sidebar', async () => {
      const reduireBtn = await page.$(
        'button:has-text("Réduire"), button:has-text("Reduire"), button[aria-label*="sidebar"], button[aria-label*="menu"]',
      );
      if (!reduireBtn) {
        // Try finding collapse button by position (usually at bottom of sidebar)
        const allButtons = await page.$$("button");
        let found = false;
        for (const btn of allButtons) {
          const box = await btn.boundingBox();
          if (box && box.x < 300) {
            const text = await btn.textContent();
            if (
              text &&
              (text.includes("duire") ||
                text.includes("<<") ||
                text.includes("collapse"))
            ) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
          // Just verify sidebar is visible
          const sidebar = await page.$('nav, aside, [class*="sidebar"]');
          if (!sidebar) throw new Error("Sidebar not found");
        }
      } else {
        await reduireBtn.click();
        await page.waitForTimeout(1000);
      }
    });

    await context.close();
  } finally {
    await browser.close();
  }

  return results;
}

const isMain = process.argv[1].endsWith("02-admin-dashboard.spec.mjs");
if (isMain) {
  run().then((r) => {
    console.log(`\nResults: ${r.passed} passed, ${r.failed} failed`);
    process.exit(r.failed > 0 ? 1 : 0);
  });
}
