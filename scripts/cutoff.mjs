// IS ANY REAL CONTENT CUT OFF AT THE RIGHT EDGE?
//
// ⚠️ WHY THE SIDEWAYS-SCROLL CHECK WAS NOT ENOUGH. A planted 600px block on a
// 375px page did not widen the page: an ancestor clips horizontal overflow, so
// on this site anything too wide is silently CUT OFF instead of scrolling —
// and that check skipped clipped elements by design. This one looks for them.
//
// Reported: visible content (text, images, buttons, inputs) whose box runs past
// the right edge of the window, or past the right edge of an ancestor that
// clips it. NOT reported, because they are meant to bleed off the edge:
//   - decoration: aria-hidden, pointer-events:none with low opacity, or
//     absolutely positioned giant background words;
//   - anything inside a horizontal scroller (overflow-x auto/scroll) — that
//     content is reachable by swiping, which is the point of a scroller;
//   - marquee/ticker tracks that animate a transform.
// Self-test first: a planted over-wide paragraph must be reported, or every
// clean result below is meaningless.
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
  const W = document.documentElement.clientWidth;
  const isDecor = (el) => {
    for (let a = el; a && a !== document.body; a = a.parentElement) {
      if (a.getAttribute && a.getAttribute('aria-hidden') === 'true') return true;
      const cs = getComputedStyle(a);
      if (cs.pointerEvents === 'none' && parseFloat(cs.opacity) < 0.35) return true;
      if (/(auto|scroll)/.test(cs.overflowX)) return true; // swipeable scroller
      if (cs.animationName && cs.animationName !== 'none' && /translate|matrix/.test(cs.transform)) return true; // ticker track
    }
    // giant faint background words: absolutely positioned, huge type, low alpha
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' && parseFloat(cs.fontSize) > 80) return true;
    return false;
  };
  const clipRight = (el) => {
    let right = W;
    for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(hidden|clip)/.test(cs.overflowX)) right = Math.min(right, a.getBoundingClientRect().right);
    }
    return right;
  };
  const out = [];
  const CONTENT = 'p, h1, h2, h3, h4, h5, h6, li, a, button, img, input, select, textarea, label, span, video';
  for (const el of document.querySelectorAll('main ' + CONTENT.split(', ').join(', main '))) {
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.bottom < -2000) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.05) continue;
    const limit = clipRight(el);
    if (r.right <= limit + 2) continue;
    if (r.left >= limit) continue; // wholly off-screen: a hidden panel, not a cut
    if (isDecor(el)) continue;
    // ⚠️ A DELIBERATE ZOOM IS NOT A CUT. Product photos sit at scale-105/110
    // inside overflow-hidden frames on purpose; the first run reported every
    // one of them "cut by 6-12px". Allow exactly the growth the scale explains.
    {
      let scale = 1;
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const acs = getComputedStyle(a);
        const m = /^matrix\(([^,]+)/.exec(acs.transform);
        if (m) scale *= Math.abs(parseFloat(m[1])) || 1;
        // Tailwind v4's scale-110 sets the separate `scale` property, NOT
        // transform — reading transform alone missed every zoomed photo.
        if (acs.scale && acs.scale !== 'none') scale *= parseFloat(acs.scale) || 1;
      }
      if (scale > 1.001 && r.right - limit <= (r.width * (1 - 1 / scale)) / 2 + 3) continue;
    }
    // report only the outermost cut element in a branch
    let parentCut = false;
    for (let a = el.parentElement; a && a.tagName !== 'MAIN'; a = a.parentElement) {
      if (a.matches && a.matches(CONTENT)) { const ar = a.getBoundingClientRect(); if (ar.right > clipRight(a) + 2 && !isDecor(a)) { parentCut = true; break; } }
    }
    if (parentCut) continue;
    out.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 60), over: Math.round(r.right - limit), text: (el.getAttribute('alt') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 44) });
  }
  return out;
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });

// self-test: plant an over-wide paragraph
{
  const p = await b.newPage({ viewport: { width: 375, height: 812 } });
  await p.goto(B + '/contact', { waitUntil: 'load' }); await p.waitForTimeout(1500);
  await p.evaluate(() => { const x = document.createElement('p'); x.textContent = 'PLANTED_WIDE_PARAGRAPH'; x.style.cssText = 'width:640px;white-space:nowrap'; document.querySelector('main').appendChild(x); });
  const hits = await p.evaluate(PROBE);
  const caught = hits.some((h) => h.text.includes('PLANTED_WIDE'));
  console.log(`SELF-TEST: planted 640px paragraph ${caught ? 'caught' : 'NOT CAUGHT — results below are meaningless'}`);
  await p.close();
  if (!caught) { await b.close(); process.exit(1); }
}

const found = [];
for (const w of [375, 768]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 812 }, isMobile: w < 768, hasTouch: w < 768 });
  const p = await ctx.newPage();
  let first = true;
  for (const r of routes) {
    try {
      await p.goto(B + r, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(500);
      if (first) { await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(800); first = false; }
      await p.evaluate(async () => { const s = innerHeight * 0.8; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((x) => setTimeout(x, 60)); } scrollTo(0, 0); });
      await p.waitForTimeout(500);
      for (const h of await p.evaluate(PROBE)) found.push({ w, r, ...h });
    } catch (e) { console.log(`  !! ${w} ${r} ${String(e).slice(0, 60)}`); }
  }
  await ctx.close();
}
await b.close();
console.log(`${routes.length} routes x 2 widths checked — ${found.length} pieces of content cut off`);
for (const f of found.slice(0, 150)) console.log(`  ${f.w} ${f.r}  <${f.tag}> cut by ${f.over}px  "${f.text}"  [${f.cls}]`);
