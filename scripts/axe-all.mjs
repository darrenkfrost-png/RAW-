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
  .filter((p, i, a) => a.indexOf(p) === i)
  // Optional 4th argument: a regex to check only some routes, e.g. "^/product/".
  .filter((p) => !process.argv[4] || new RegExp(process.argv[4]).test(p));

const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
// Width is the third argument (default 375). Some layouts only exist wider —
// the laptop sidebar, three-up grids — so phone width alone is not coverage.
const WIDTH = Number(process.argv[3] || 375);
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 900 }, isMobile: WIDTH < 768, hasTouch: WIDTH < 768 });
const page = await ctx.newPage();

/* How many elements are part-way through a fade. Zero, twice running, means
   every reveal on the page has finished and what is on screen is what a
   visitor will actually see. */
const settle = async (page, { cap = 6000, step = 250 } = {}) => {
  let last = null, stable = 0;
  for (let waited = 0; waited < cap; waited += step) {
    await page.waitForTimeout(step);
    const moving = await page.evaluate(() => {
      if (!document.body || !document.body.firstElementChild) return -1;
      let n = 0;
      for (const el of document.body.querySelectorAll('*')) {
        const o = parseFloat(getComputedStyle(el).opacity || '1');
        if (o > 0 && o < 0.99) n++;
      }
      return n;
    }).catch(() => -1);
    if (moving === last) { if (++stable >= 2) return; } else { stable = 0; }
    last = moving;
  }
};

/**
 * ⚠️ DECORATION THAT CANNOT PASS, AND WHY A LIST IS SAFER THAN A LONG TAIL.
 *
 * A handful of elements on this site are texture made of letters: a 30rem
 * watermark word at 5% white, a fake "[ TARGET_ASSET_IDENT ]" stamp above each
 * product name. WCAG exempts purely incidental text from the contrast rule, but
 * axe cannot tell decoration from content, so it reports every one as a serious
 * failure — 57 of them, permanently.
 *
 * Leaving them in the count is the worse option, and that is the whole reason
 * this register exists: a gate that always reports 57 failures can never go
 * green, so the fifty-eighth — a real one — arrives invisible. The number has
 * to mean something for anyone to act on it.
 *
 * The rules that keep this honest rather than a dumping ground:
 *   · every entry carries a reason, and the reasons are PRINTED on every run,
 *     so an exemption can never be quietly forgotten;
 *   · an entry that stops matching anything is reported as stale, because a
 *     rule that matches nothing today is a hiding place for something tomorrow;
 *   · it exempts ONLY the contrast rule. Everything else axe checks still
 *     applies to these elements in full.
 */
const DECORATION = [
  {
    why: 'a 30rem watermark word at 5% white — texture, aria-hidden, and brightening it would destroy it',
    match: (html) => /opacity-\[0\.05\]/.test(html) && /text-display-lg/.test(html),
  },
  {
    why: 'the giant blurred section heading behind the real one — opacity-30 with blur(1px), scenery by construction',
    match: (html) => /opacity-30/.test(html) && /blur-\[1px\]/.test(html),
  },
  {
    why: 'the blurred word-fragment behind each Our Story statistic — three letters of a label at 3-8% opacity under a 2px blur, aria-hidden',
    match: (html) => /mix-blend-overlay/.test(html) && /blur-\[2px\]/.test(html),
  },
  {
    why: 'the fake "[ TARGET_ASSET_IDENT ]" stamp above each product name — garnish, already aria-hidden so no screen reader reads it',
    match: (html) => /TARGET_ASSET_IDENT/i.test(html),
  },
];
const exempted = new Map(DECORATION.map((d) => [d.why, 0]));

const tally = new Map();
const routesWithRealFindings = new Set();
let clean = 0;
for (const route of routes) {
  try {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(900);
    await page.keyboard.press('Enter').catch(() => {});
    /* ⚠️ IT USED TO WAIT 1800ms AND JUDGE, AND THE SITE'S REVEALS RUN TO 2500ms.
       So this swept seventy-eight routes while the text was still fading in.
       axe cannot score the contrast of half-transparent text — it files it
       under "incomplete" rather than "violations" — so the sweep reported ZERO
       violations across the whole site while eight real contrast failures sat
       on the shop, product and contact pages, every one of them visible to a
       visitor two seconds later. Nothing was wrong with axe or with the rule
       list; the page simply was not finished being drawn.
       Waiting a longer fixed time would only move the guess. This watches the
       document until nothing is mid-fade, then judges. */
    await settle(page);
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async () =>
      await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }),
    );
    /* ⚠️ A FLAGGED ELEMENT IS RE-MEASURED WHERE A VISITOR WOULD SEE IT.
       Settling the document is not enough on its own: anything revealed by
       SCROLL has not been revealed yet, so four white <h1>s were being reported
       at 1.1:1 — white text, measured while it was still at three percent
       opacity below the fold. That is a measurement artefact, not a fault, and
       reporting it would have had me "fixing" headings that were already
       perfect. So each contrast finding is scrolled into view, allowed to
       settle, and re-tested on its own; only the ones that still fail survive.
       Decoration is set aside here too, counted separately, never silently. */
        for (const v of res.violations) {
      let nodes = v.nodes;
      if (v.id === 'color-contrast') {
        const kept = [];
        for (const n of nodes) {
          const d = DECORATION.find((x) => x.match(n.html || ''));
          if (d) { exempted.set(d.why, exempted.get(d.why) + 1); continue; }
          const sel = Array.isArray(n.target) ? n.target[n.target.length - 1] : n.target;
          const stillFails = await page.evaluate(async (selector) => {
            const el = document.querySelector(selector);
            if (!el) return true; // cannot re-check it, so do not dismiss it
            el.scrollIntoView({ block: 'center' });
            await new Promise((r) => setTimeout(r, 1200));
            const res = await window.axe.run(el, { runOnly: { type: 'rule', values: ['color-contrast'] } });
            return res.violations.length > 0;
          }, sel).catch(() => true);
          if (stillFails) kept.push(n);
        }
        nodes = kept;
      }
      if (!nodes.length) continue;
      const cur = tally.get(v.id) || { impact: v.impact, help: v.help, routes: new Set(), nodes: 0, sample: '' };
      cur.routes.add(route);
      cur.nodes += nodes.length;
      if (!cur.sample) cur.sample = (nodes[0]?.html || '').slice(0, 150);
      tally.set(v.id, cur);
      routesWithRealFindings.add(route);
    }
    /* ⚠️ CLEAN IS COUNTED AFTER FILTERING, NOT BEFORE. It used to be
       incremented on `!res.violations.length`, i.e. on axe's raw output, so a
       route whose only findings were decoration counted as dirty and the
       headline number understated the site. */
    if (!routesWithRealFindings.has(route)) clean++;
  } catch (e) {
    console.log(`  !! ${route}: ${String(e).slice(0, 80)}`);
  }
}
await browser.close();

console.log(`\n${routes.length} routes at ${WIDTH}px — ${clean} clean\n`);
for (const [id, v] of [...tally].sort((a, b) => b[1].nodes - a[1].nodes)) {
  console.log(`${id} [${v.impact}] — ${v.nodes} nodes on ${v.routes.size} routes`);
  console.log(`   ${v.help}`);
  console.log(`   e.g. ${v.sample}`);
  console.log(`   routes: ${[...v.routes].slice(0, 6).join(', ')}`);
}
if (!tally.size) console.log('no violations');

/* ⚠️ THE EXEMPTIONS ARE PART OF THE RESULT, NOT A FOOTNOTE. Printed every
   run so that what this sweep chose not to count is always in front of whoever
   reads the number — and so a stale rule, which is a hiding place for a future
   element, is named instead of sitting there matching nothing. */
const exemptTotal = [...exempted.values()].reduce((a, c) => a + c, 0);
console.log(`
set aside as decoration (contrast rule only): ${exemptTotal} node(s)`);
for (const [why, n] of exempted) {
  console.log(n ? `   ${String(n).padStart(4)}  ${why}` : `   STALE  matched nothing this run — remove it: ${why}`);
}
