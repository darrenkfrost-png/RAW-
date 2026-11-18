/**
 * TEXT THAT IS READ ALOUD BUT CANNOT BE SEEN.
 *
 * ⚠️ DECORATION MADE OF WORDS IS STILL WORDS.
 *
 * The front page carries a falling-character texture at 5% white — a visual
 * effect, not a sentence. A sighted visitor sees grain. A screen reader found
 * 514 characters and read "RAW_..." forty times before anything that meant
 * something. `pointer-events-none` had already told a mouse to ignore it;
 * nothing told anyone else.
 *
 * So this looks for the mismatch: text with so little contrast against what is
 * behind it that nobody can read it, which is NOT hidden from assistive
 * technology. Either it is meant to be read, and it must be legible — or it is
 * decoration, and it must be aria-hidden. It cannot be neither.
 *
 * ⚠️ WHY IT COMPOSITES RATHER THAN READING ONE COLOUR. An earlier contrast
 * probe in this repo was defeated by rgba(): it pulled three numbers out with a
 * regex and ignored the alpha, so white-at-5-percent measured as pure white and
 * passed. Here the text colour is composited over the first opaque ancestor
 * background, alpha and inherited element opacity included, before any ratio is
 * worked out.
 *
 * ⚠️ ONE COPY OF THE COLOUR MATH, INSTALLED INTO THE PAGE. Both passes have to
 * agree about what "invisible" means. When pass two judged by its own rule
 * instead of re-running this one, it threw away an entire class of finding —
 * see the warning above pass two.
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:5332').replace(/\/$/, '');
/* ⚠️ A HAND-WRITTEN ROUTE LIST IS A COVERAGE GAP WITH NO WARNING LIGHT.
   This swept twelve routes it had been given by name while the site served
   seventy-eight, so two thirds of the pages were never looked at and the
   summary line said "no invisible text" about all of them. That is the same
   failure as the viewport hole described further down, one level up: silence
   from a page nobody measured reads exactly like silence from a clean one.
   The routes now come from the sitemap, which is itself generated from the
   router, so a new page is swept the moment it exists. Pass routes as
   arguments to narrow a run while working on one page. */
const ROUTES = process.argv.slice(3).length ? process.argv.slice(3) : await (async () => {
  const xml = await fetch(BASE + '/sitemap.xml').then((r) => r.text());
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const unique = [...new Set(paths)];
  if (!unique.length) {
    console.error(`no routes: ${BASE}/sitemap.xml listed none — refusing to report a clean sweep of nothing`);
    process.exit(2);
  }
  return unique;
})();
const FLOOR = 1.6; // below this, the text is not readable by anyone

/* Installed before any page script, on every navigation and reload, so that
   `window.__ghost` is there for both passes and for the settle helpers. */
const INSTALL = () => {
  const parse = (c) => {
    const m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const n = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  // The nearest ancestor that actually paints something opaque.
  const backdrop = (el) => {
    for (let a = el; a; a = a.parentElement) {
      const c = parse(getComputedStyle(a).backgroundColor);
      if (c && c.a >= 0.99) return c;
    }
    return { r: 0, g: 0, b: 0, a: 1 }; // the site's shell is near-black
  };

  const inheritedOpacity = (el) => {
    let o = 1;
    for (let a = el; a; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity || '1');
    return o;
  };

  /* How legible this element's text is, right now: its colour and every
     inherited opacity composited over whatever actually paints behind it. */
  const contrast = (el) => {
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    if (!fg) return null;
    const bg = backdrop(el);
    const effective = { ...fg, a: fg.a * inheritedOpacity(el) };
    return +ratio(over(effective, bg), bg).toFixed(2);
  };

  const scan = (floor) => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent || '').trim();
      if (text.length < 8) continue;
      const el = n.parentElement;
      if (!el || seen.has(el)) continue;
      seen.add(el);
      if (/^(SCRIPT|STYLE|NOSCRIPT|TITLE)$/.test(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      // Already excluded from the accessibility tree? Then it is not read.
      if (el.closest('[aria-hidden="true"]')) continue;
      // Deliberately offscreen helper text (sr-only) is FOR screen readers.
      if (r.width <= 1 || r.height <= 1) continue;

      /* ⚠️ TRAP ONE: GRADIENT TEXT HAS NO COLOUR, AND IS NOT INVISIBLE.
         The house headline style is `text-transparent bg-clip-text
         bg-gradient-to-*` — the glyphs are painted by the background, so
         `color` is rgba(0,0,0,0) by design. Reading the colour alone called
         every display heading on the site invisible. */
      if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') continue;

      /* ⚠️ TRAP TWO: NOT-YET-REVEALED IS NOT INVISIBLE.
         Most of this site fades in on scroll, so anything below the fold sits
         at opacity 0 until it is reached. Judging the whole document in one
         pass called every unrevealed paragraph ghost text — 170 "findings", of
         which two were real.
         ⚠️ AND THE OBVIOUS FIX WAS ALSO WRONG. Judging only what was in the
         viewport at a few scroll stops left a hole: a decorative watermark on
         Our Story sat at the top of its own section and never landed in a
         sampled screen, so it was never judged at all — reported clean while
         being exactly what this looks for. Silence from a gap in coverage is
         indistinguishable from silence from a clean page.
         So nothing is filtered by position here. Suspects are collected from
         the whole document, then each one is scrolled to and measured again;
         only those still invisible with their reveal finished are reported. */

      const c = contrast(el);
      if (c === null || c >= floor) continue;
      out.push({
        text: text.slice(0, 48),
        chars: text.length,
        contrast: c,
        color: cs.color,
        opacity: +inheritedOpacity(el).toFixed(2),
        cls: String(el.className).slice(0, 44),
      });
    }
    return out;
  };

  window.__ghost = { contrast, scan, inheritedOpacity };
};

/**
 * ⚠️ A FIXED WAIT IS A GUESS, AND THIS ONE GUESSED SHORT.
 *
 * The sweep waited 1800ms and then judged. The front page's call to action
 * animates in with `delay: 1, duration: 1.5` — it is not fully opaque until
 * 2500ms, so it was measured at a fifth of its opacity and reported as text
 * nobody can read. It is black on white: the highest contrast on the site.
 * The manifesto paragraph was the same story one scroll down.
 *
 * So nothing here waits a chosen number of milliseconds. Both helpers watch
 * the thing they are about to judge until it stops changing, and only then
 * allow a verdict — which is also faster on the pages that settle quickly.
 */
const settleValue = async (page, read, { cap = 6000, step = 250 } = {}) => {
  let last = null, stable = 0;
  for (let waited = 0; waited < cap; waited += step) {
    await page.waitForTimeout(step);
    const now = await read();
    if (now === last) { if (++stable >= 2) return now; } else { stable = 0; }
    last = now;
  }
  return last;
};

/* The whole document's painted state, cheap enough to sample: how many
   elements are mid-fade. Zero and holding means every reveal has finished. */
const settleDocument = (page) =>
  settleValue(page, () => page.evaluate(() => {
    if (!document.body || !document.body.firstElementChild) return -1; // React has not mounted
    let moving = 0;
    for (const el of document.body.querySelectorAll('*')) {
      const o = parseFloat(getComputedStyle(el).opacity || '1');
      if (o > 0 && o < 0.99) moving++;
    }
    return moving;
  }));

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(INSTALL);
const p = await ctx.newPage();

/* ⚠️ A PROBE THAT HAS NEVER CAUGHT ANYTHING IS NOT A PASSING PROBE, it is an
   untested one. Two faults are planted, because the sweep has two halves and
   for a long time only the first was ever proven:
     - one invisible by COLOUR at full opacity, which pass two used to discard,
     - one invisible by OPACITY, the shape pass two was built around.
   Both must survive the whole sweep, scroll and hover included, and be
   reported. If either is swallowed, the probe proves nothing and says so. */
const PLANTS = [
  { text: 'planted invisible sentence by colour', css: 'color:rgba(255,255,255,0.04)' },
  { text: 'planted invisible sentence by opacity', css: 'color:#fff;opacity:0.02' },
];
await p.goto(BASE + '/', { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.evaluate((plants) => {
  for (const [i, plant] of plants.entries()) {
    const d = document.createElement('p');
    d.textContent = plant.text;
    d.style.cssText = `${plant.css};position:fixed;top:${40 + i * 40}px;left:40px;z-index:1`;
    document.body.appendChild(d);
  }
}, PLANTS);

/* The plants are judged by the same two-pass pipeline as a real page, so this
   is defined before the sweep and called for the self-test first. */
const judge = async (suspects) => {
  const hits = [];
  for (const sus of suspects) {
    const handle = await p.evaluateHandle((t) => {
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) {
        if ((n.textContent || '').trim().slice(0, 48) === t) return n.parentElement;
      }
      return null;
    }, sus.text);
    const el = handle.asElement();
    if (!el) { await handle.dispose(); continue; }

    /* ⚠️ PASS TWO MUST ASK THE SAME QUESTION PASS ONE ASKED.
       It used to re-judge on inherited opacity alone: anything that had
       settled at opacity >= 0.95 was dropped as a false positive. But text can
       be unreadable at full opacity — 5% white on black is the very fault this
       file was written for — so every colour-based finding was silently
       discarded on its way out. The probe had never reported one, and the
       self-test only exercised pass one, so nothing showed it. Pass two now
       re-measures contrast through window.__ghost, exactly as pass one did. */
    const contrast = () => el.evaluate((e) => window.__ghost.contrast(e));

    await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    let c = await settleValue(p, contrast);
    if (c === null || c >= FLOOR) { await handle.dispose(); continue; }

    /* ⚠️ HOVER-REVEALED TEXT IS NOT INVISIBLE TEXT, AND ANNOUNCING IT IS RIGHT.
       Several cards keep their description in an `absolute inset-0 opacity-0
       group-hover:opacity-100` overlay. A mouse brings it up; a screen reader,
       which cannot hover, has it read out instead — the accessible behaviour,
       not a fault. Judging on opacity alone called six of these ghost text.
       ⚠️ AND DISPATCHING mouseenter DOES NOT WORK. CSS :hover answers to real
       pointer input only, so synthetic events left all six still "invisible"
       and the probe looked fixed while having changed nothing. The hover has
       to be driven from outside the page. */
    const group = (await el.evaluateHandle((e) => e.closest('.group') || e.parentElement)).asElement();
    if (group) {
      try {
        await group.hover({ timeout: 2000 });
        const hovered = await settleValue(p, contrast);
        if (hovered !== null && hovered >= FLOOR) { await handle.dispose(); continue; }
        c = hovered ?? c;
      } catch { /* not hoverable (offscreen, covered) — fall through and report */ }
    }
    hits.push({ ...sus, contrast: c, opacity: await el.evaluate((e) => +window.__ghost.inheritedOpacity(e).toFixed(2)) });
    await handle.dispose();
  }
  return hits;
};

const selfTest = await judge(await p.evaluate((f) => window.__ghost.scan(f), FLOOR));
const missed = PLANTS.filter((plant) => !selfTest.some((x) => x.text.startsWith(plant.text.slice(0, 30))));
if (missed.length) {
  console.error(`SELF-TEST FAILED: the full sweep swallowed ${missed.length} planted fault(s) — this probe proves nothing.`);
  missed.forEach((m) => console.error(`   never reported: "${m.text}"  [${m.css}]`));
  await b.close();
  process.exit(2);
}
console.log(`SELF-TEST: both planted faults (colour and opacity) survived the full sweep`);

let total = 0;
for (const route of ROUTES) {
  await p.goto(BASE + route, { waitUntil: 'load' });
  await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
  await p.reload({ waitUntil: 'load' });
  /* ⚠️ WAIT FOR THE PAGE TO EXIST BEFORE JUDGING IT. Rewriting the sweep once
     deleted this line, and pass one then ran against an empty React root:
     zero suspects on every route, reported as "no invisible text". A probe
     that measures nothing agrees with a clean site, which is why this is the
     third blind spot this one file has produced and the reason each is
     written down rather than quietly patched. */
  await settleDocument(p);
  // Pass one: every run of text that currently measures invisible, anywhere.
  const suspects = await p.evaluate((f) => window.__ghost.scan(f), FLOOR);
  if (process.env.GHOST_DEBUG) console.log(`   [debug] ${route}: ${suspects.length} suspect(s): ${suspects.map((x) => JSON.stringify(x.text)).join(', ').slice(0, 300)}`);

  // Pass two: bring each suspect to the screen, let its reveal run, look again.
  const hits = await judge(suspects);

  if (hits.length) {
    console.log(`\n${route}  (${hits.length})`);
    hits.forEach((h) => console.log(`   ${String(h.contrast).padStart(5)}:1  ${h.chars} chars  ${h.color} @${h.opacity}  "${h.text}"  [${h.cls}]`));
    total += hits.length;
  }
}
await b.close();
/* ⚠️ THE SUMMARY STATES ITS OWN SCOPE, so that a clean result can be checked
   rather than taken on trust. "No invisible text" says nothing useful without
   the number of pages behind it: a sweep of three routes and a sweep of
   seventy-eight print the identical sentence, and this file has already shipped
   three different ways of measuring nothing and calling it clean. */
console.log(total
  ? `\n${total} run(s) of text are announced but invisible across ${ROUTES.length} route(s) — make them legible, or aria-hidden them`
  : `\nno invisible text is announced to assistive technology, across ${ROUTES.length} route(s)`);
process.exit(total ? 1 : 0);
