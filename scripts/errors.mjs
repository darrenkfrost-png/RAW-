// WHAT GOES WRONG WHERE NO VISITOR CAN SEE IT?
// Every sitemap route, desktop: JavaScript errors (pageerror + console.error),
// and requests that fail or return 4xx/5xx. Grouped by message so one broken
// component on 47 product pages reads as one finding.
// Self-test: a planted console.error and a planted fetch of a missing file must
// both be reported, or a clean result is meaningless.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B = process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com';
const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive}) — no result`); process.exit(1); }
const sitemap = await fetch(B + '/sitemap.xml').then((r) => r.text());
const routes = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
let current = '';
const found = new Map();
const add = (kind, msg) => {
  const key = kind + ' ' + msg.replace(/\/product\/\d+/g, '/product/N').replace(/:\d+:\d+/g, '').slice(0, 220);
  if (!found.has(key)) found.set(key, new Set());
  found.get(key).add(current);
};
p.on('pageerror', (e) => add('JS-ERROR', String(e.message || e)));
p.on('console', (m) => { if (m.type() === 'error') add('CONSOLE', m.text()); });
p.on('requestfailed', (r) => { const f = r.failure()?.errorText || ''; if (/ERR_ABORTED/.test(f)) return; add('REQ-FAILED', `${f} ${r.url().split('?')[0]}`); });
p.on('response', (r) => { if (r.status() >= 400) add(`HTTP-${r.status()}`, r.url().split('?')[0]); });

// self-test
current = '(self-test)';
await p.goto(B + '/contact', { waitUntil: 'load' }); await p.waitForTimeout(800);
await p.evaluate(() => { console.error('PLANTED_CONSOLE_ERROR'); fetch('/definitely-missing-file-xyz.png').catch(() => {}); });
await p.waitForTimeout(1500);
const st = [...found.keys()];
const ok = st.some((k) => k.includes('PLANTED_CONSOLE_ERROR')) && st.some((k) => k.includes('definitely-missing-file-xyz'));
console.log(`SELF-TEST: planted error + missing file ${ok ? 'both caught' : 'NOT BOTH CAUGHT — results void'}`);
if (!ok) { await b.close(); process.exit(1); }
found.clear();

let first = true;
for (const r of routes) {
  current = r;
  try {
    await p.goto(B + r, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(700);
    if (first) { await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(900); first = false; }
    await p.evaluate(async () => { const s = innerHeight * 0.9; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((x) => setTimeout(x, 60)); } });
    await p.waitForTimeout(1200);
  } catch (e) { add('NAV-FAIL', String(e).slice(0, 100)); }
}
await b.close();
const rows = [...found].sort((a, z) => z[1].size - a[1].size);
console.log(`${routes.length} routes — ${rows.length} distinct problem(s)`);
for (const [k, rs] of rows.slice(0, 50)) console.log(`  [${rs.size} route${rs.size > 1 ? 's' : ''}] ${k}\n      e.g. ${[...rs].slice(0, 3).join(', ')}`);
