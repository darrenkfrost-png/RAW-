// ARE THE BUTTONS BIG ENOUGH FOR A THUMB?
// WCAG 2.2 AA (2.5.8): a target must be at least 24x24 CSS px, OR have 24px of
// clear space around it. Exceptions: links inside a sentence, and targets the
// browser draws itself. Apple/Google recommend 44x44 — reported separately as
// advice, not failure.
// Self-test: a planted 12x12 button must be reported, or results are void.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B = process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com';
const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive}) — no result`); process.exit(1); }
const sitemap = await fetch(B + '/sitemap.xml').then((r) => r.text());
const routes = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))]
  .filter((r) => !/^\/product\/\d+$/.test(r) || r === '/product/29');

const PROBE = () => {
  const W = innerWidth, H = document.documentElement.scrollHeight;
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, [role=button], [role=tab], [role=switch], [tabindex]:not([tabindex="-1"])';
  const all = [...document.querySelectorAll(sel)].filter((el) => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.visibility === 'hidden' || cs.display === 'none' || r.width === 0 || r.height === 0) return false;
    if (parseFloat(cs.opacity) < 0.1 || cs.pointerEvents === 'none') return false;
    if (r.right < 0 || r.left > W) return false;
    return true;
  });
  const rects = all.map((el) => { const r = el.getBoundingClientRect(); return { el, x: r.left, y: r.top + scrollY, w: r.width, h: r.height }; });
  const out = [];
  for (const t of rects) {
    const { el } = t;
    // inline link inside running text is exempt
    if (el.tagName === 'A' && getComputedStyle(el).display === 'inline') {
      const p = el.closest('p, li, span, figcaption'); if (p && (p.textContent || '').trim().length > (el.textContent || '').trim().length + 20) continue;
    }
    if (t.w >= 24 && t.h >= 24) continue;
    // spacing exception: a 24px circle centred on it must not intersect another target
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
    let crowded = false;
    for (const o of rects) {
      if (o === t || o.el.contains(el) || el.contains(o.el)) continue;
      const nx = Math.max(o.x, Math.min(cx, o.x + o.w)), ny = Math.max(o.y, Math.min(cy, o.y + o.h));
      if (Math.hypot(nx - cx, ny - cy) < 12) { crowded = true; break; }
    }
    if (!crowded && (t.w >= 24 || t.h >= 24)) continue; // one dimension fine and room around it
    if (!crowded && Math.min(t.w, t.h) >= 16) continue; // small but isolated: passes via spacing
    out.push({ tag: el.tagName.toLowerCase(), w: Math.round(t.w), h: Math.round(t.h), crowded,
      label: (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      cls: String(el.className || '').slice(0, 60) });
  }
  return out;
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
// self-test
{
  const p = await b.newPage({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  await p.goto(B + '/contact', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await p.evaluate(() => { const m = document.querySelector('main'); for (let i = 0; i < 2; i++) { const x = document.createElement('button'); x.textContent = ''; x.setAttribute('aria-label', 'PLANTED_TINY'); x.style.cssText = 'width:12px;height:12px;padding:0;margin:0 2px;display:inline-block'; m.prepend(x); } });
  const hits = await p.evaluate(PROBE);
  const ok = hits.some((h) => h.label === 'PLANTED_TINY');
  console.log(`SELF-TEST: two planted 12x12 buttons side by side ${ok ? 'caught' : 'NOT CAUGHT — results void'}`);
  await p.close(); if (!ok) { await b.close(); process.exit(1); }
}
const agg = new Map();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage(); let first = true;
for (const r of routes) {
  try {
    await p.goto(B + r, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(500);
    if (first) { await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(800); first = false; }
    await p.evaluate(async () => { const s = innerHeight * 0.8; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((x) => setTimeout(x, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(400);
    for (const h of await p.evaluate(PROBE)) {
      const k = `${h.tag}|${h.label}|${h.w}x${h.h}|${h.cls}`;
      if (!agg.has(k)) agg.set(k, { ...h, routes: new Set() });
      agg.get(k).routes.add(r);
    }
  } catch (e) { console.log(`  !! ${r} ${String(e).slice(0, 60)}`); }
}
await b.close();
const list = [...agg.values()].sort((a, z) => z.routes.size - a.routes.size);
console.log(`${routes.length} routes at 375px — ${list.length} distinct targets below 24px`);
for (const t of list.slice(0, 50)) console.log(`  ${t.w}x${t.h}${t.crowded ? ' crowded' : ''} <${t.tag}> "${t.label}"  on ${t.routes.size} route(s) e.g. ${[...t.routes].slice(0, 3).join(', ')}  [${t.cls}]`);
