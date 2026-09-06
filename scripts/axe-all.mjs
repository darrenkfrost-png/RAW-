// The repo gate checks five routes for accessibility violations. This checks
// every route in the sitemap, at phone width, because that is where targets get
// small and contrast gets thin.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const fs = require('fs');

const BASE = process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com';
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const sitemap = await fetch(BASE + '/sitemap.xml').then((r) => r.text());
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p, i, a) => a.indexOf(p) === i);

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();

const tally = new Map();
let clean = 0;
for (const route of routes) {
  try {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(900);
    await page.keyboard.press('Enter').catch(() => {});
    await page.waitForTimeout(900);
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async () =>
      await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }),
    );
    if (!res.violations.length) { clean++; continue; }
    for (const v of res.violations) {
      const cur = tally.get(v.id) || { impact: v.impact, help: v.help, routes: new Set(), nodes: 0, sample: '' };
      cur.routes.add(route);
      cur.nodes += v.nodes.length;
      if (!cur.sample) cur.sample = (v.nodes[0]?.html || '').slice(0, 150);
      tally.set(v.id, cur);
    }
  } catch (e) {
    console.log(`  !! ${route}: ${String(e).slice(0, 80)}`);
  }
}
await browser.close();

console.log(`\n${routes.length} routes at 375px — ${clean} clean\n`);
for (const [id, v] of [...tally].sort((a, b) => b[1].nodes - a[1].nodes)) {
  console.log(`${id} [${v.impact}] — ${v.nodes} nodes on ${v.routes.size} routes`);
  console.log(`   ${v.help}`);
  console.log(`   e.g. ${v.sample}`);
  console.log(`   routes: ${[...v.routes].slice(0, 6).join(', ')}`);
}
if (!tally.size) console.log('no violations');
