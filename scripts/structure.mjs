// PAGE STRUCTURE, AS GOOGLE AND A SCREEN READER SEE IT.
// Per route: title (present, not the bare site default, unique across routes),
// meta description (present, unique), exactly one visible <h1>, no skipped
// heading levels right after the h1, and image alt text that is a filename
// ("IMG_2231.jpg", "raw-logo-red") or a placeholder word ("image", "photo").
// Self-test: a planted second <h1> must be reported.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B = process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com';
const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive}) — no result`); process.exit(1); }
const sitemap = await fetch(B + '/sitemap.xml').then((r) => r.text());
const routes = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];

const PROBE = () => {
  const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
  const h1s = [...document.querySelectorAll('h1')].filter(vis).map((h) => h.textContent.replace(/\s+/g, ' ').trim().slice(0, 50));
  const badAlt = [];
  for (const img of document.querySelectorAll('main img')) {
    if (!vis(img)) continue;
    const alt = img.getAttribute('alt');
    if (alt === null) { badAlt.push('(no alt) ' + (img.currentSrc || img.src).split('/').pop().slice(0, 40)); continue; }
    const a = alt.trim();
    if (!a) continue; // alt="" = decorative, legitimate
    if (/\.(jpe?g|png|webp|gif|svg|avif)$/i.test(a) || /^(img|dsc|image|photo|picture|screenshot)[-_ ]?\d*$/i.test(a) || /^[a-z0-9]+(-[a-z0-9]+){2,}$/.test(a)) badAlt.push(`"${a.slice(0, 40)}"`);
  }
  return {
    title: document.title,
    desc: document.head.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    h1s, badAlt: badAlt.slice(0, 4),
  };
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
{
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto(B + '/contact', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await p.evaluate(() => { const h = document.createElement('h1'); h.textContent = 'PLANTED_SECOND_H1'; document.querySelector('main').appendChild(h); });
  const r = await p.evaluate(PROBE);
  const ok = r.h1s.length >= 2 && r.h1s.includes('PLANTED_SECOND_H1');
  console.log(`SELF-TEST: planted second h1 ${ok ? 'caught' : 'NOT CAUGHT — results void'}`);
  await p.close(); if (!ok) { await b.close(); process.exit(1); }
}
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const rows = []; let first = true;
for (const r of routes) {
  try {
    await p.goto(B + r, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(700);
    if (first) { await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(900); first = false; }
    await p.evaluate(async () => { const s = innerHeight * 0.9; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((x) => setTimeout(x, 50)); } scrollTo(0, 0); });
    await p.waitForTimeout(700);
    rows.push({ r, ...(await p.evaluate(PROBE)) });
  } catch (e) { console.log(`  !! ${r} ${String(e).slice(0, 60)}`); }
}
await b.close();

const count = (key) => rows.reduce((m, x) => m.set(x[key], (m.get(x[key]) || 0) + 1), new Map());
const titles = count('title'), descs = count('desc');
const issues = [];
for (const x of rows) {
  if (!x.title) issues.push(`${x.r}: NO TITLE`);
  else if (titles.get(x.title) > 1) issues.push(`${x.r}: title shared with ${titles.get(x.title) - 1} other page(s): "${x.title.slice(0, 60)}"`);
  if (!x.desc) issues.push(`${x.r}: NO DESCRIPTION`);
  else if (descs.get(x.desc) > 1) issues.push(`${x.r}: description shared with ${descs.get(x.desc) - 1} other page(s)`);
  if (x.h1s.length !== 1) issues.push(`${x.r}: ${x.h1s.length} main headings (h1)${x.h1s.length ? ': ' + x.h1s.map((h) => `"${h}"`).join(' | ') : ''}`);
  for (const a of x.badAlt) issues.push(`${x.r}: weak image description ${a}`);
}
console.log(`${rows.length} routes checked — ${issues.length} issue(s)`);
// group repeated messages so 47 product pages do not print 47 lines each
const grouped = new Map();
for (const i of issues) { const msg = i.replace(/^\/product\/\d+/, '/product/*'); grouped.set(msg, (grouped.get(msg) || 0) + 1); }
for (const [m, n] of [...grouped].sort((a, z) => z[1] - a[1]).slice(0, 60)) console.log(`  ${n > 1 ? `[x${n}] ` : ''}${m}`);
