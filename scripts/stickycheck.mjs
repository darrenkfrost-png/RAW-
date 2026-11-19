/**
 * STICKY THAT DOES NOT STICK.
 *
 * ⚠️ WHY THIS EXISTS. `position: sticky` is the quietest failure in CSS. When
 * it does not work there is no error, no warning and nothing visibly broken —
 * the element simply behaves like a normal block and scrolls away, which looks
 * like a design choice rather than a fault. It is disabled outright by any
 * ancestor between it and the scroll container having `overflow` other than
 * `visible`, and it has nothing to do if its own parent is no taller than it
 * is. Both happen by accident, from a stray `overflow-hidden` added to fix
 * something else several elements away.
 *
 * This site has four, and two of them are commercial: the product page's buy
 * panel and the protocol-stack sidebar are meant to stay beside a long body of
 * text while the visitor reads it.
 *
 * ⚠️ IT SCROLLS THE PAGE AND MEASURES, rather than reading the CSS and
 * reasoning about it. Reasoning is how the last bug in this repo hid for so
 * long: the faulty property was `filter: blur(0px)` on an element in a
 * different file, which looked finished and read as harmless. So the question
 * asked here is the only one that matters — after scrolling, is the element
 * still where it promised to be? An element that is genuinely stuck keeps its
 * viewport `top` at roughly its `top` offset; one that has come unstuck rides
 * the page upward with everything else.
 *
 * USAGE
 *   npm run stickycheck                  # against a local build
 *   npm run stickycheck -- https://…     # against the deployed site
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const xml = await fetch(BASE + '/sitemap.xml').then((r) => r.text()).catch(() => '');
const ROUTES = process.argv.slice(3).length
  ? process.argv.slice(3)
  : [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
if (!ROUTES.length) {
  console.error(`no routes: ${BASE}/sitemap.xml listed none — refusing to report a clean sweep of nothing`);
  process.exit(2);
}

/* Tag each sticky element so it can be found again after a scroll, and report
   what would stop it working. Returns one entry per sticky element. */
const FIND = () => {
  const out = [];
  let n = 0;
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'sticky') continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue; // not laid out at this width — sticky is often lg: only
    const tag = `sticky-${n++}`;
    el.setAttribute('data-stickycheck', tag);

    // An ancestor that scrolls or clips disables sticky entirely.
    let clipper = null;
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const acs = getComputedStyle(a);
      /* ⚠️ `clip` IS NOT `hidden`, AND THE DIFFERENCE IS THE WHOLE POINT.
         Only a SCROLL CONTAINER disables a sticky descendant: hidden, auto and
         scroll make one, `clip` does not. Treating every non-visible overflow
         as a culprit flagged the very fix for this bug — overflow-x-clip, which
         contains a decorative glow while leaving sticky working — as the cause
         of it. `visible` and `clip` are both fine here. */
      const scrolls = (v) => v !== 'visible' && v !== 'clip';
      if (scrolls(acs.overflowY) || scrolls(acs.overflowX)) {
        clipper = `${a.tagName}${a.id ? '#' + a.id : ''}.${String(a.className).slice(0, 34)} has overflow ${acs.overflowX}/${acs.overflowY}`;
        break;
      }
    }
    // Sticky has nothing to do unless its parent gives it room to travel.
    const parent = el.parentElement;
    const room = parent ? Math.round(parent.getBoundingClientRect().height - r.height) : 0;

    out.push({
      tag,
      el: `${el.tagName}.${String(el.className).slice(0, 40)}`,
      top: cs.top,
      clipper,
      room,
    });
  }
  return out;
};

/* Wait until nothing on the page is mid-fade, rather than for a chosen number
   of milliseconds. Capped, because this site has one watermark that pulses for
   ever and would otherwise never settle. */
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

const topOf = (page, tag) => page.evaluate((t) => {
  const el = document.querySelector(`[data-stickycheck="${t}"]`);
  if (!el) return null;
  return Math.round(el.getBoundingClientRect().top);
}, tag);

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

/* ⚠️ A PROBE THAT HAS NEVER CAUGHT ANYTHING IS AN UNTESTED PROBE. Build a
   sticky element that cannot work — one inside an `overflow: hidden` ancestor,
   the commonest cause — and require that the sweep calls it broken. A second
   element, correctly stuck, must come back clean: a probe that flags everything
   is as useless as one that flags nothing. */
await p.goto(BASE + '/', { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.evaluate(() => {
  const mk = (id, clip) => {
    const outer = document.createElement('div');
    outer.id = id;
    outer.style.cssText = `height:3000px;position:relative;${clip ? 'overflow:hidden;' : ''}`;
    const inner = document.createElement('div');
    inner.className = `planted-${id}`;
    inner.style.cssText = 'position:sticky;top:0px;height:50px;background:#111';
    inner.textContent = id;
    outer.appendChild(inner);
    document.body.appendChild(outer);
  };
  mk('planted-broken', true);
  mk('planted-working', false);
});
{
  const found = await p.evaluate(FIND);
  const broken = found.find((f) => f.el.includes('planted-planted-broken'));
  const working = found.find((f) => f.el.includes('planted-planted-working'));
  if (!broken || !broken.clipper) {
    console.error('SELF-TEST FAILED: a sticky element inside an overflow:hidden ancestor was not identified — this probe proves nothing.');
    await b.close();
    process.exit(2);
  }
  if (!working || working.clipper) {
    console.error('SELF-TEST FAILED: a correctly stuck element was reported as broken — this probe would flag everything.');
    await b.close();
    process.exit(2);
  }
  console.log('SELF-TEST: a clipped sticky element was caught, and a working one was not');
}

let total = 0;
let examined = 0;
let scanFailures = 0;
for (const route of ROUTES) {
  /* ⚠️ THE NAVIGATION SWALLOWED ITS OWN FAILURE TOO (`.catch(() => {})`), so a
     route that never loaded was scanned anyway — on whatever page was still
     open — and counted as clean. Between this and the scan's silent catch, a
     page could fail to open and the sweep would still print a reassuring
     summary. Both now say so and mark the route unchecked. */
  try {
    await p.goto(BASE + route, { waitUntil: 'load' });
    await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
    await p.reload({ waitUntil: 'load' });
  } catch (e) {
    console.error(`COULD NOT OPEN ${route}: ${String(e.message).split('\n')[0]}`);
    scanFailures++;
    continue;
  }
  /* ⚠️ IT WAITED A FIXED 1500ms AND FOUND NOTHING. The sidebars are inside
     scroll/entrance reveals and are not laid out that early, so a run narrowed
     to one route reported "0 examined across 1 route(s)" — on a page where
     seven sticky elements sit at top:190px. It had already caught six real
     failures on that page in a wider sweep, purely because the timing happened
     to differ. Third time a chosen number of milliseconds has lied in this
     repo; it watches the page instead. The "examined" count in the summary is
     there for exactly this reason: a sweep of nothing must not read as a pass. */
  await settle(p);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);

  /* ⚠️ THIS WAS `.catch(() => [])`, WHICH TURNED ANY ERROR INTO "no sticky
     elements on this page" — a broken scan reporting a clean site. It cost a
     long detour: the sweep kept saying "0 examined" on a page that has seven
     sticky sidebars, and the swallowed exception was the only thing that could
     have explained why. A probe may fail, but it must never fail quietly. */
  let sticky;
  try {
    sticky = await p.evaluate(FIND);
  } catch (e) {
    console.error(`SCAN FAILED on ${route}: ${String(e.message).split('\n')[0]}`);
    scanFailures++;
    continue;
  }
  if (!sticky.length) continue;
  examined += sticky.length;

  const hits = [];
  for (const s of sticky) {
    const before = await topOf(p, s.tag);
    if (before === null) continue;

    const wanted = parseFloat(s.top) || 0;

    /* ⚠️ A FIXED SCROLL OF 1200px TESTED NOTHING FOR MOST OF THEM. An element
       7,178px down the page cannot stick after 1,200px of scrolling — it is
       still far below the viewport and has not reached its threshold, so of
       course its top moved by exactly the scroll amount. That read as "it
       scrolled away with the page" and reported five healthy sidebars as
       broken, which would have had me hunting a bug that was not there.
       Sticky can only be judged INSIDE its own range. So each element is first
       scrolled until its top sits at the threshold, and only then nudged
       further: from there a stuck element holds its position while an unstuck
       one rides up by the extra distance. The page is scrolled rather than the
       element because this site runs Lenis smooth scrolling, and a window
       scroll is what a visitor's wheel ultimately drives. */
    const NUDGE = 400;
    await p.evaluate((d) => window.scrollBy(0, d), before - wanted);
    await p.waitForTimeout(600);
    const atThreshold = await topOf(p, s.tag);
    await p.evaluate((d) => window.scrollBy(0, d), NUDGE);
    await p.waitForTimeout(600);
    const after = await topOf(p, s.tag);
    if (after === null || atThreshold === null) continue;

    /* Stuck: it held the line. Unstuck: it moved up by about the nudge. */
    const stuck = Math.abs(after - wanted) <= 24;
    const rodeUp = Math.abs(after - (atThreshold - NUDGE)) <= 24;
    if (!stuck && !rodeUp) {
      /* Neither pinned nor carried along by the full nudge: the element never
         got into range (short page, or it is taller than the scroll area).
         Untestable here, and saying so beats guessing either way. */
      console.log(`  note  ${route}  ${s.el}\n        could not be brought into its sticky range, so it is UNTESTED (top ${atThreshold}px -> ${after}px, wanted ${wanted}px)`);
      continue;
    }
    // Nothing to stick to is not a fault worth failing on, but it is worth saying.
    const noRoom = s.room <= 8;

    if (!stuck && !noRoom) {
      hits.push({ ...s, before, after, why: s.clipper ? `an ancestor clips it — ${s.clipper}` : 'it scrolled away with the page' });
    } else if (!stuck && noRoom) {
      console.log(`  note  ${route}  ${s.el}\n        sticky but its parent gives it only ${s.room}px to travel, so it can never move`);
    }
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(300);
  }

  if (hits.length) {
    console.log(`\n${route}  (${hits.length})`);
    hits.forEach((h) => console.log(`   ${h.el}\n      top:${h.top} went from ${h.before}px to ${h.after}px — ${h.why}`));
    total += hits.length;
  }
}
await b.close();
console.log(total
  ? `\n${total} sticky element(s) do not stick, of ${examined} examined across ${ROUTES.length} route(s)`
  : `\nevery sticky element stays put: ${examined} examined across ${ROUTES.length} route(s)`);
if (scanFailures) console.log(`${scanFailures} route(s) could not be scanned at all — their sticky elements are UNCHECKED, not clean`);
process.exit(total || scanFailures ? 1 : 0);
