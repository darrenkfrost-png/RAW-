/**
 * POSITION:FIXED THAT IS NOT FIXED TO THE VIEWPORT.
 *
 * ⚠️ WHY THIS EXISTS. The shell's page-arrival animation faded a blur out and
 * left `filter: blur(0px)` on the wrapper. Zero blur paints exactly like no
 * blur, so there was nothing to see — but a filtered element becomes the
 * containing block for every `position: fixed` descendant, and a stacking
 * context besides. On 50 of 78 routes, "fixed to the viewport" silently came
 * to mean "fixed to this page's wrapper":
 *
 *   · /defrost asks for a full-screen desktop. It was given a 171px strip and
 *     all SEVEN of its controls were unclickable on the live site.
 *   · The product pages' fixed backdrop was stretched to 11,600px and scrolled
 *     with the content instead of staying put.
 *
 * Nothing in the codebase was wrong at either of those places, which is what
 * made it so hard to see: the faulty line was in neither file, and raising the
 * desktop's z-index — the obvious fix — changed nothing, because the same
 * filter had already trapped the stacking context.
 *
 * `transform` and `perspective` do the same thing to a fixed descendant, so
 * all three are checked, not just the one that caused it.
 *
 * USAGE
 *   npm run fixedtrap                  # against a local build
 *   npm run fixedtrap -- https://…     # against the deployed site
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

/* ⚠️ THE ROUTES COME FROM THE SITEMAP, NOT FROM A LIST WRITTEN HERE. A
   hand-kept list is a coverage gap with no warning light: the pages it forgets
   are reported clean along with the ones it checked. */
const xml = await fetch(BASE + '/sitemap.xml').then((r) => r.text()).catch(() => '');
const ROUTES = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
if (!ROUTES.length) {
  console.error(`no routes: ${BASE}/sitemap.xml listed none — refusing to report a clean sweep of nothing`);
  process.exit(2);
}

/* Returns every position:fixed element whose containing block has been taken
   over by an ancestor's filter, transform or perspective. */
const SCAN = () => {
  /* ⚠️ THE SELF-TEST FAILED FIRST TIME BECAUSE OF THIS, not because the scan
     was wrong: the planted elements were identified by `id`, and the report
     only ever printed the tag and class, so there was nothing for the matcher
     to recognise. The id is part of the name now — which is also what makes a
     real finding traceable back to an element you can actually look up. */
  const name = (e) => (e.id ? `#${e.id}` : '') + (e.className ? `.${String(e.className).slice(0, 36)}` : '');
  const out = [];
  for (const el of document.querySelectorAll('*')) {
    if (getComputedStyle(el).position !== 'fixed') continue;
    let culprit = null;
    for (let a = el.parentElement; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const why = cs.filter !== 'none' ? `filter: ${cs.filter}`
        : cs.transform !== 'none' ? `transform: ${cs.transform}`
        : cs.perspective !== 'none' ? `perspective: ${cs.perspective}` : null;
      if (why) { culprit = { why, tag: a.tagName, cls: name(a) }; break; }
    }
    if (!culprit) continue;
    const r = el.getBoundingClientRect();
    out.push({
      el: `${el.tagName}${name(el)}`,
      size: `${Math.round(r.width)}x${Math.round(r.height)}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      culprit: `${culprit.tag}.${culprit.cls} has ${culprit.why}`,
    });
  }
  return out;
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

/* ⚠️ A PROBE THAT HAS NEVER CAUGHT ANYTHING IS AN UNTESTED PROBE. Build the
   exact shape of the fault — a fixed child under a blur(0px) ancestor — and
   require that it is found before any route is judged. A zero-blur filter is
   used deliberately: that is the one that leaves nothing to see. */
await p.goto(BASE + '/', { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.evaluate(() => {
  const outer = document.createElement('div');
  outer.style.cssText = 'filter:blur(0px);position:relative';
  outer.id = 'planted-filtered-ancestor';
  const inner = document.createElement('div');
  inner.style.cssText = 'position:fixed;inset:0';
  inner.id = 'planted-trapped-fixed';
  outer.appendChild(inner);
  document.body.appendChild(outer);
});
if (!(await p.evaluate(SCAN)).some((h) => h.el.includes('planted-trapped-fixed') && h.culprit.includes('planted-filtered-ancestor'))) {
  console.error('SELF-TEST FAILED: a fixed element planted under a blur(0px) ancestor was not caught — this probe proves nothing.');
  await b.close();
  process.exit(2);
}
console.log('SELF-TEST: a fixed element trapped by blur(0px) was caught');

let total = 0;
for (const route of ROUTES) {
  await p.goto(BASE + route, { waitUntil: 'load' }).catch(() => {});
  await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
  await p.reload({ waitUntil: 'load' }).catch(() => {});
  /* ⚠️ THE FAULT ONLY APPEARS ONCE THE ANIMATION HAS FINISHED. It is the
     LEFTOVER value that does the damage, so judging mid-flight would find the
     blur that is supposed to be there and miss the one that should not be.
     Wait until nothing is mid-fade, then look. */
  let last = null, stable = 0;
  for (let waited = 0; waited < 6000; waited += 250) {
    await p.waitForTimeout(250);
    const moving = await p.evaluate(() => {
      if (!document.body.firstElementChild) return -1;
      let n = 0;
      for (const el of document.body.querySelectorAll('*')) {
        const o = parseFloat(getComputedStyle(el).opacity || '1');
        if (o > 0 && o < 0.99) n++;
      }
      return n;
    }).catch(() => -1);
    if (moving === last) { if (++stable >= 2) break; } else { stable = 0; }
    last = moving;
  }
  const hits = await p.evaluate(SCAN).catch(() => []);
  if (hits.length) {
    console.log(`\n${route}  (${hits.length})`);
    hits.forEach((h) => console.log(`   ${h.el}  ${h.size}  (viewport ${h.viewport})\n      trapped by ${h.culprit}`));
    total += hits.length;
  }
}
await b.close();
console.log(total
  ? `\n${total} fixed element(s) are anchored to something other than the viewport, across ${ROUTES.length} route(s) — find the ancestor's filter/transform and clear it`
  : `\nevery position:fixed element is anchored to the viewport, across ${ROUTES.length} route(s)`);
process.exit(total ? 1 : 0);
