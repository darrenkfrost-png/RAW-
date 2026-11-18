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
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:5332').replace(/\/$/, '');
const ROUTES = process.argv.slice(3).length ? process.argv.slice(3)
  : ['/', '/films', '/shop', '/combat', '/recovery', '/nutrients', '/showcase', '/our-story', '/manifesto', '/stay-safe', '/defrost', '/raw-cares'];
const FLOOR = 1.6; // below this, the text is not readable by anyone

const PAGE_FN = (FLOOR) => {
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
    if ((cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text')) continue;

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

    const fg = parse(cs.color);
    if (!fg) continue;
    let op = 1;
    for (let a = el; a; a = a.parentElement) op *= parseFloat(getComputedStyle(a).opacity || '1');
    const effective = { ...fg, a: fg.a * op };
    const bg = backdrop(el);
    const c = ratio(over(effective, bg), bg);
    if (c < FLOOR) {
      out.push({
        text: text.slice(0, 48),
        chars: text.length,
        contrast: +c.toFixed(2),
        color: cs.color,
        opacity: +op.toFixed(2),
        cls: String(el.className).slice(0, 44),
      });
    }
  }
  return out;
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();

/* ⚠️ A PROBE THAT HAS NEVER CAUGHT ANYTHING IS NOT A PASSING PROBE, it is an
   untested one. Plant text nobody can see and make sure it is found. */
await p.goto(BASE + '/', { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.evaluate(() => {
  const d = document.createElement('p');
  d.textContent = 'planted invisible sentence that is read aloud';
  d.style.cssText = 'color:rgba(255,255,255,0.04);position:fixed;top:40px;left:40px;z-index:1';
  document.body.appendChild(d);
});
const selfTest = await p.evaluate(PAGE_FN, FLOOR);
if (!selfTest.some((x) => /planted invisible/.test(x.text))) {
  console.error('SELF-TEST FAILED: planted invisible text was not caught — this probe proves nothing.');
  await b.close();
  process.exit(2);
}
console.log('SELF-TEST: planted invisible sentence caught');

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
  await p.waitForTimeout(1800);
  // Pass one: every run of text that currently measures invisible, anywhere.
  const suspects = await p.evaluate(PAGE_FN, FLOOR);
  if (process.env.GHOST_DEBUG) console.log(`   [debug] ${route}: ${suspects.length} suspect(s): ${suspects.map((x) => JSON.stringify(x.text)).join(', ').slice(0, 300)}`);

  // Pass two: bring each suspect to the screen, let its reveal run, look again.
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

    const opacity = () => el.evaluate((e) => {
      let o = 1;
      for (let a = e; a; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity || '1');
      return +o.toFixed(3);
    });

    await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await p.waitForTimeout(900);
    if (await opacity() >= 0.95) { await handle.dispose(); continue; }

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
        await p.waitForTimeout(700);
        if (await opacity() >= 0.5) { await handle.dispose(); continue; }
      } catch { /* not hoverable (offscreen, covered) — fall through and report */ }
    }
    hits.push({ ...sus, opacity: await opacity() });
    await handle.dispose();
  }

  if (hits.length) {
    console.log(`\n${route}  (${hits.length})`);
    hits.forEach((h) => console.log(`   ${String(h.contrast).padStart(5)}:1  ${h.chars} chars  ${h.color} @${h.opacity}  "${h.text}"  [${h.cls}]`));
    total += hits.length;
  }
}
await b.close();
console.log(total
  ? `\n${total} run(s) of text are announced but invisible — make them legible, or aria-hidden them`
  : `\nno invisible text is announced to assistive technology`);
process.exit(total ? 1 : 0);
