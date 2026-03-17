import { run as runAuth } from "./01-auth.spec.mjs";
import { run as runDashboard } from "./02-admin-dashboard.spec.mjs";
import { run as runCRM } from "./03-crm.spec.mjs";
import { run as runMessaging } from "./04-messaging.spec.mjs";
import { run as runBilling } from "./05-billing.spec.mjs";
import { run as runSchool } from "./06-school.spec.mjs";
import { run as runCoach } from "./07-coach.spec.mjs";
import { run as runClient } from "./08-client.spec.mjs";
import { run as runCommunity } from "./09-community.spec.mjs";
import { run as runSecurity } from "./10-security.spec.mjs";

const suites = [
  { name: "Authentication", run: runAuth },
  { name: "Admin Dashboard", run: runDashboard },
  { name: "CRM", run: runCRM },
  { name: "Messaging", run: runMessaging },
  { name: "Billing", run: runBilling },
  { name: "School/LMS", run: runSchool },
  { name: "Coach", run: runCoach },
  { name: "Client", run: runClient },
  { name: "Community", run: runCommunity },
  { name: "Security", run: runSecurity },
];

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("  OFF-MARKET E2E TEST RUNNER");
  console.log("  App: https://off-market-amber.vercel.app");
  console.log("  Date: " + new Date().toISOString());
  console.log("=".repeat(70));

  const allResults = [];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const suite of suites) {
    try {
      const result = await suite.run();
      allResults.push({ suite: suite.name, ...result });
      totalPassed += result.passed;
      totalFailed += result.failed;
    } catch (err) {
      console.error(`\nFATAL ERROR in suite "${suite.name}":`, err.message);
      allResults.push({
        suite: suite.name,
        passed: 0,
        failed: 1,
        tests: [{ name: "Suite crashed", status: "FAIL", error: err.message }],
      });
      totalFailed++;
    }
  }

  // Final Report
  console.log("\n\n" + "=".repeat(70));
  console.log("  FINAL REPORT");
  console.log("=".repeat(70));
  console.log(`  Total: ${totalPassed + totalFailed} tests`);
  console.log(`  ✅ Passed: ${totalPassed}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  console.log(
    `  Score: ${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%`,
  );
  console.log("=".repeat(70));

  console.log("\n📋 SUITE SUMMARY:\n");
  for (const r of allResults) {
    const icon = r.failed === 0 ? "✅" : "❌";
    const score =
      r.passed + r.failed > 0
        ? Math.round((r.passed / (r.passed + r.failed)) * 100)
        : 0;
    console.log(
      `  ${icon} ${r.suite}: ${r.passed}/${r.passed + r.failed} passed (${score}%)`,
    );
  }

  console.log("\n📋 FAILING TESTS:\n");
  let hasFailing = false;
  for (const r of allResults) {
    const failing = r.tests ? r.tests.filter((t) => t.status === "FAIL") : [];
    if (failing.length > 0) {
      hasFailing = true;
      console.log(`  [${r.suite}]`);
      for (const t of failing) {
        console.log(`    ❌ ${t.name}`);
        if (t.error) console.log(`       → ${t.error}`);
      }
    }
  }
  if (!hasFailing) console.log("  None! All tests passed.");

  console.log("\n" + "=".repeat(70));
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Runner crashed:", err);
  process.exit(1);
});
