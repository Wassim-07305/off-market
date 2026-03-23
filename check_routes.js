const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const context = browser.contexts()[0];
    const page = await context.newPage();

    const results = {};

    // Check admin dashboard
    const pages_to_check = [
      'https://off-market-amber.vercel.app/admin/dashboard',
      'https://off-market-amber.vercel.app/admin/billing',
      'https://off-market-amber.vercel.app/admin/personnes',
      'https://off-market-amber.vercel.app/admin/school',
      'https://off-market-amber.vercel.app/admin/settings',
      'https://off-market-amber.vercel.app/admin/analytics',
      'https://off-market-amber.vercel.app/admin/rewards',
    ];

    for (const url of pages_to_check) {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const links = await page.evaluate(() => {
        const anchors = document.querySelectorAll('a');
        return Array.from(anchors).map(a => ({
          href: a.getAttribute('href'),
          text: a.textContent.trim().substring(0, 80)
        })).filter(l => l.href && l.href.startsWith('/'));
      });

      const seen = new Set();
      const unique = links.filter(l => {
        if (seen.has(l.href)) return false;
        seen.add(l.href);
        return true;
      });

      results[url] = unique;
    }

    fs.writeFileSync('/tmp/admin_links.json', JSON.stringify(results, null, 2));
    console.log('DONE - wrote to /tmp/admin_links.json');

    await page.close();
  } catch(e) {
    console.error('ERROR:', e.message);
  }
})();
