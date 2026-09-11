// BROKEN IMAGES AND LINKS THAT LEAD NOWHERE.
//
// For every sitemap route: scroll the whole page so lazy images load, then
//  - an <img> that finished loading with naturalWidth 0 is a broken picture
//    the visitor can see (a hot-linked rawofficial.co file that moved, say);
//  - every same-site <a href> is collected and each unique one is opened: if
//    the page it lands on is the 404 page, the link is dead.
// External links are checked with a HEAD/GET for a 4xx/5xx.
//
// ⚠️ The server is checked FIRST. A dead port once printed "0 findings".
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B = process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com';

const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive}) — no result`); process.exit(1); }

const sitemap = await fetch(B + '/sitemap.xml').then((r) => r.text());
const routes = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const brokenImg = new Map(); const internal = new Map(); const external = new Map();
for (const r of routes) {
  try {
    await p.goto(B + r, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(600);
    await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(800);
    await p.evaluate(async () => { const s = innerHeight * 0.8; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((x) => setTimeout(x, 70)); } });
    await p.waitForTimeout(1500);
    const found = await p.evaluate(() => ({
      imgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc && !i.currentSrc.startsWith('data:')).map((i) => i.currentSrc),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith('http')),
    }));
    for (const s of found.imgs) brokenImg.set(s, (brokenImg.get(s) || new Set()).add(r));
    for (const h of found.links) {
      const u = new URL(h);
      const bucket = u.origin === new URL(B).origin ? internal : external;
      const key = u.origin === new URL(B).origin ? u.pathname : h;
      bucket.set(key, (bucket.get(key) || new Set()).add(r));
    }
  } catch (e) { console.log('  !! ' + r + ': ' + String(e).slice(0, 60)); }
}

// open each internal target once; the 404 page announces itself in the title
const deadInternal = [];
for (const [path, from] of internal) {
  if (path.startsWith('/promo/') || /\.\w{2,4}$/.test(path)) continue;
  try {
    await p.goto(B + path, { waitUntil: 'load', timeout: 30000 }); await p.waitForTimeout(700);
    // ⚠️ NOT THE TITLE. The first version matched "not found" in the tab title,
    // and on this site a dead address was titled from its own path ("Definitely
    // Not A Page Xyz") — so every dead link would have passed. The 404 page's
    // own words are the marker; checked against a planted dead URL.
    const body = (await p.evaluate(() => document.body.innerText)).toUpperCase();
    if (body.includes('ERROR_404') || body.includes('THIS PAGE DOESN')) deadInternal.push([path, [...from].slice(0, 3)]);
  } catch { deadInternal.push([path + ' (timeout)', [...from].slice(0, 3)]); }
}
await b.close();

const deadExternal = [];
for (const [url, from] of external) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(12000) });
    if (res.status === 405 || res.status === 403) res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(12000) });
    if (res.status >= 400) deadExternal.push([`${res.status} ${url}`, [...from].slice(0, 3)]);
  } catch (e) { deadExternal.push([`ERR ${url}`, [...from].slice(0, 3)]); }
}

console.log(`\n${routes.length} routes scanned, ${internal.size} internal + ${external.size} external link targets\n`);
console.log(`BROKEN IMAGES: ${brokenImg.size}`); for (const [s, f] of brokenImg) console.log(`  ${s}\n     on ${[...f].slice(0, 3).join(', ')}`);
console.log(`\nDEAD INTERNAL LINKS: ${deadInternal.length}`); for (const [s, f] of deadInternal) console.log(`  ${s}   (from ${f.join(', ')})`);
console.log(`\nDEAD EXTERNAL LINKS: ${deadExternal.length}`); for (const [s, f] of deadExternal) console.log(`  ${s}   (from ${f.join(', ')})`);
console.log('\nDONE');
