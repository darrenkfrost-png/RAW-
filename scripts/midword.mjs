// WHERE DOES A LINE ACTUALLY BREAK?
//
// ⚠️ MY PREVIOUS PROBE GUESSED, AND GUESSED WRONG BOTH WAYS. It measured the
// widest word against the container width and called anything wider a break.
// That misses nothing but invents plenty: it cannot see a <wbr> hint, so every
// title I had already fixed still counted as broken, and it cannot see a
// hyphenation or a break the browser chose sensibly.
//
// This asks the browser instead. Walk the characters of a text run, note the y
// of each one, and every time y increases a line broke there. If the character
// on each side of that break is a letter or a digit — not a space, hyphen or
// underscore — the break landed inside a word, which is the defect.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');

const BASE = process.argv[2] || 'http://localhost:5200';
const ROUTES = ['/', '/shop', '/product/29', '/combat', '/recovery', '/nutrients', '/protocol-stacks', '/protocol-stacks/strength', '/protocol-builder', '/compare', '/knowledge-core', '/academy', '/our-story', '/raw-cares', '/checkout', '/logistics', '/performance-system', '/contact', '/manifesto', '/showcase'];

const PROBE = () => {
  const out = [];
  const wordChar = (c) => /[A-Za-z0-9]/.test(c);

  for (const el of document.body.querySelectorAll('*')) {
    // only elements whose children are text — otherwise the offsets get messy
    if (el.childNodes.length === 0) continue;
    let text = '';
    let onlyText = true;
    for (const n of el.childNodes) {
      if (n.nodeType === 3) text += n.textContent;
      else { onlyText = false; break; }
    }
    if (!onlyText) continue;
    if (text.trim().length < 6) continue;

    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.15) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 8 || box.height < 4) continue;

    const node = el.firstChild;
    const range = document.createRange();
    let prevTop = null;
    const breaks = [];
    for (let i = 0; i < text.length; i++) {
      try {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
      } catch { break; }
      const r = range.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const top = Math.round(r.top);
      if (prevTop !== null && top > prevTop + 2) {
        const before = text[i - 1];
        const after = text[i];
        if (before && after && wordChar(before) && wordChar(after)) {
          breaks.push(text.slice(Math.max(0, i - 12), i) + '|' + text.slice(i, i + 12));
        }
      }
      prevTop = top;
    }
    if (breaks.length) {
      out.push({
        tag: el.tagName.toLowerCase(),
        size: Math.round(parseFloat(cs.fontSize)),
        cls: String(el.className || '').split(' ').slice(0, 3).join('.').slice(0, 46),
        at: breaks.slice(0, 2),
      });
    }
  }
  return out;
};

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const agg = new Map();
let total = 0;
for (const size of [{ n: 'phone', w: 375, h: 812 }, { n: 'desktop', w: 1440, h: 900 }]) {
  const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, isMobile: size.w < 768, hasTouch: size.w < 768 });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(700);
      await page.keyboard.press('Enter').catch(() => {});
      await page.waitForTimeout(1200);
      await page.evaluate(async () => { const s = innerHeight * 0.8; for (let y = 0; y < document.body.scrollHeight; y += s) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } scrollTo(0, 0); });
      await page.waitForTimeout(500);
      for (const h of await page.evaluate(PROBE)) {
        total++;
        const key = `${size.n} ${route}`;
        const cur = agg.get(key) || [];
        cur.push(h);
        agg.set(key, cur);
      }
    } catch { /* page-level failures are reported by the route sweep, not here */ }
  }
  await ctx.close();
}
await browser.close();

for (const [where, hits] of agg) {
  console.log(`\n${where}  (${hits.length})`);
  for (const h of hits.slice(0, 4)) console.log(`   ${h.size}px ${h.tag}.${h.cls}\n      breaks: ${h.at.join('   ')}`);
}
console.log(`\n${total} real mid-word breaks`);
