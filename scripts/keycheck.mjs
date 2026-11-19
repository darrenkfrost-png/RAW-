/**
 * WHAT A KEYBOARD USER ACTUALLY MEETS, ONE TAB AT A TIME.
 *
 * Two faults no other probe here can see, because both are invisible to
 * anything that only looks at the page as it sits:
 *
 *   1. FOCUSABLE BUT NOT THERE. A closed menu or panel hidden by being slid
 *      off-screen, scaled to nothing or faded to opacity:0 is still in the tab
 *      order. A keyboard user tabs into something they cannot see, and focus
 *      vanishes for ten presses. `display:none` and `visibility:hidden` take an
 *      element out of the tab order; a transform, a clip or an opacity does NOT.
 *
 *   2. FOCUSED WITH NOTHING TO SHOW IT. `focus:outline-none` with no ring put
 *      back leaves a keyboard user with no cursor at all.
 *
 * ⚠️ VISIBILITY IS JUDGED WHILE THE ELEMENT IS FOCUSED, deliberately. A skip
 * link is clipped to nothing until focused and then appears — that is the
 * correct pattern, not a fault, and judging it unfocused would condemn it.
 *
 * ⚠️ THE WALK USES REAL Tab PRESSES, not el.focus(). Programmatic focus does
 * not match :focus-visible in Chrome, so every Tailwind `focus-visible:` ring
 * would read as missing and the probe would report a sea of invented faults.
 *
 * USAGE
 *   npm run keycheck                      # local build, both widths
 *   npm run keycheck -- https://…         # the deployed site
 *   npm run keycheck -- https://… 375     # one width
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const WIDTHS = process.argv[3] ? [Number(process.argv[3])] : [375, 1440];
const MAX_TABS = 70;

const xml = await fetch(BASE + '/sitemap.xml').then((r) => r.text()).catch(() => '');
const ROUTES = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname))];
if (!ROUTES.length) {
  console.error(`no routes: ${BASE}/sitemap.xml listed none — refusing to report a clean sweep of nothing`);
  process.exit(2);
}

const INSTALL = () => {
  const name = (el) => el.tagName.toLowerCase()
    + (el.id ? `#${el.id}` : '')
    + (el.getAttribute('aria-label') ? `[${el.getAttribute('aria-label').slice(0, 30)}]` : '')
    + (el.className && typeof el.className === 'string'
      ? `.${el.className.trim().split(/\s+/).slice(0, 3).join('.')}` : '');

  /* every visual property a focus indicator could possibly live in */
  const RING = ['outlineStyle', 'outlineWidth', 'outlineColor', 'outlineOffset', 'boxShadow',
    'borderColor', 'borderWidth', 'backgroundColor', 'color', 'textDecorationLine',
    'opacity', 'transform', 'filter'];
  /* ⚠️ A BOX-SHADOW THAT PAINTS NOTHING IS NOT A FOCUS INDICATOR. Tailwind's
     ring sets box-shadow to a stack of var() slots; when the ring loses to the
     element's own shadow the slots still land in the computed value as
     `rgba(0,0,0,0) 0px 0px 0px 0px`. The string changes on focus, so a naive
     before/after comparison calls an entirely invisible ring a pass — which is
     exactly how this probe's first self-test passed the planted bare button.
     Collapse any all-transparent / all-zero shadow to `none` before comparing. */
  const paints = (shadow) => {
    if (!shadow || shadow === 'none') return 'none';
    const layers = shadow.split(/,(?![^(]*\))/).map((s) => s.trim()).filter((layer) => {
      const transparent = /(rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)|oklab\([^)]*\/\s*0\s*\)|transparent)/.test(layer);
      const zeroSized = /\b0px 0px 0px 0px\b/.test(layer) || /\b0px 0px 0px\b\s*(inset)?$/.test(layer);
      return !(transparent || zeroSized);
    });
    return layers.length ? layers.join(', ') : 'none';
  };
  /* ⚠️ THE SAME TRAP AS THE SHADOW, IN THE OUTLINE. `outline-style: none` still
     computes a width and a colour, so an element whose outline is switched off
     reports a changing style string on focus while painting nothing. Caught by
     the self-test the moment the site's real ring started working. */
  const outline = (cs) => (cs.outlineStyle === 'none' || cs.outlineStyle === 'hidden'
    || parseFloat(cs.outlineWidth) === 0)
    ? 'no-outline'
    : `${cs.outlineStyle}|${cs.outlineWidth}|${cs.outlineColor}|${cs.outlineOffset}`;

  const snap = (el) => {
    const cs = getComputedStyle(el);
    const base = outline(cs) + '|' + RING
      .filter((k) => !k.startsWith('outline'))
      .map((k) => (k === 'boxShadow' ? paints(cs[k]) : cs[k])).join('|');
    const pseudo = ['::before', '::after'].map((pp) => {
      const ps = getComputedStyle(el, pp);
      return ps.content === 'none' ? ''
        : outline(ps) + '|' + RING.filter((k) => !k.startsWith('outline'))
          .map((k) => (k === 'boxShadow' ? paints(ps[k]) : ps[k])).join('|') + ps.content;
    }).join('|');
    return base + '||' + pseudo;
  };

  /* why this element cannot be seen, or null if it can */
  const unseeable = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return `collapsed to ${Math.round(r.width)}x${Math.round(r.height)}`;
    const doc = document.documentElement;
    const pageW = Math.max(doc.scrollWidth, window.innerWidth);
    const pageH = Math.max(doc.scrollHeight, window.innerHeight);
    const x = r.left + window.scrollX, y = r.top + window.scrollY;
    if (x + r.width <= 0 || y + r.height <= 0 || x >= pageW || y >= pageH) {
      return `sits outside the page at ${Math.round(x)},${Math.round(y)} (page is ${pageW}x${pageH})`;
    }
    let o = 1;
    for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      o *= parseFloat(cs.opacity || '1');
      if (cs.clipPath && /inset\(\s*(100|9\d)(\.\d+)?%/.test(cs.clipPath)) {
        return `clipped away by an ancestor's clip-path: ${cs.clipPath}`;
      }
    }
    if (o < 0.15) return `faded to ${o.toFixed(3)} opacity`;
    return null;
  };

  window.__kc = {
    seen: [],
    look() {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      const rec = { el, name: name(el), focused: snap(el), hidden: unseeable(el) };
      this.seen.push(rec);
      return { name: rec.name, hidden: rec.hidden, at: this.seen.length - 1 };
    },
    /* called after the walk with nothing focused: the same element's resting
       look, so "did anything change on focus" is a real comparison */
    /* ⚠️ NEVER CONDEMN A FINDING WITHOUT RE-MEASURING IT. Most of this page is
       revealed by scroll: a card below the fold sits at opacity 0 until it
       enters the viewport. Tab scrolls it in, the reveal then runs — so an
       element read the instant after the key press is often mid-reveal, not
       hidden. The walk calls this a moment later and only a stop that is STILL
       unseeable is reported. (26 findings at 375px were this and nothing else.) */
    recheck(i) {
      const r = this.seen[i];
      if (!r) return null;
      try { r.hidden = unseeable(r.el); r.focused = snap(r.el); } catch { return null; }
      return r.hidden;
    },
    rest() {
      return this.seen.map((r) => {
        let unfocused = null;
        try { unfocused = snap(r.el); } catch { /* element gone */ }
        return {
          name: r.name,
          hidden: r.hidden,
          same: unfocused !== null && unfocused === r.focused,
          gone: unfocused === null,
        };
      });
    },
  };
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });

/* ⚠️ THE SNAPSHOT IS TAKEN THE INSTANT AFTER THE KEY PRESS, and this site
   transitions outline-color over 300ms, so at t=0 a working ring still reads as
   the resting colour. That can only ever invent a finding, never hide one — so
   the sweep runs fast, and any route that produces a finding is walked AGAIN
   with a settle after each Tab. Only what survives the slow second walk is
   reported. (Measured: the global ring reads `solid 3px currentColor` at t=0
   and `2px solid #ff1d48` at t=1500ms — the same element, the same focus.) */
const walk = async (p, settleMs = 0) => {
  await p.evaluate(() => {
    window.__kc.seen = [];
    document.activeElement && document.activeElement.blur && document.activeElement.blur();
    document.body.tabIndex = -1;
    document.body.focus();
  });
  const stops = [];
  const names = new Set();
  let capped = false;
  for (let i = 0; i < MAX_TABS; i++) {
    await p.keyboard.press('Tab');
    if (settleMs) await p.waitForTimeout(settleMs);
    const stop = await p.evaluate(() => window.__kc.look()).catch(() => null);
    if (!stop) continue;
    if (stop.hidden) {
      /* give a scroll-reveal time to run, then ask again — see recheck() */
      await p.waitForTimeout(900);
      await p.evaluate((at) => window.__kc.recheck(at), stop.at).catch(() => {});
    }
    if (names.has(stop.name) && stops.length > 3) break; /* wrapped around */
    names.add(stop.name);
    stops.push(stop);
    if (i === MAX_TABS - 1) capped = true;
  }
  await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
  const rested = await p.evaluate(() => window.__kc.rest());
  return { rested, capped };
};

/* ⚠️ SELF-TEST WITH ONE OF EACH SHAPE, INCLUDING A HEALTHY ONE. A probe that
   flags everything is as useless as one that flags nothing, so the planted set
   is: a button hidden off-screen (must be caught), a button with its ring
   stripped (must be caught), and an ordinary button with a focus ring (must
   NOT be caught, and must actually be reached, or that half proves nothing). */
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.addInitScript(INSTALL);
  await p.goto(BASE + '/', { waitUntil: 'load' });
  await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
  await p.reload({ waitUntil: 'load' });
  await p.evaluate(() => {
    document.body.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = '#planted-good:focus-visible{outline:3px solid #0f0}';
    document.head.appendChild(style);
    const off = document.createElement('div');
    off.style.cssText = 'position:absolute;left:-9999px;top:0';
    off.innerHTML = '<button id="planted-offscreen">hidden from sight</button>';
    const bare = document.createElement('button');
    bare.id = 'planted-noring';
    bare.textContent = 'no ring';
    bare.style.cssText = 'outline:none !important;width:80px;height:30px';
    const good = document.createElement('button');
    good.id = 'planted-good';
    good.textContent = 'healthy';
    good.style.cssText = 'width:80px;height:30px';
    document.body.append(off, bare, good);
  });
  const { rested } = await walk(p);
  const hit = (id, pred) => rested.some((r) => r.name.includes(id) && pred(r));
  const fails = [];
  if (!hit('planted-offscreen', (r) => r.hidden)) fails.push('a focusable button parked off-screen was not caught');
  if (!hit('planted-noring', (r) => r.same)) fails.push('a button with outline:none and no replacement ring was not caught');
  if (hit('planted-good', (r) => r.same || r.hidden)) fails.push('an ordinary button WITH a focus ring was wrongly condemned');
  if (!rested.some((r) => r.name.includes('planted-good'))) fails.push('the healthy planted button was never reached, so the no-false-positive half proves nothing');
  if (fails.length) {
    console.error('SELF-TEST FAILED — this probe proves nothing:');
    fails.forEach((f) => console.error('   ' + f));
    await b.close();
    process.exit(2);
  }
  console.log('SELF-TEST: off-screen focus stop caught, missing ring caught, healthy ring left alone');
  await p.close();
}

let problems = 0, cappedRoutes = 0, scanFailures = 0;
for (const WIDTH of WIDTHS) {
  const p = await b.newPage({ viewport: { width: WIDTH, height: 900 } });
  await p.addInitScript(INSTALL);
  let clean = 0;
  for (const route of ROUTES) {
    let ok = true;
    await p.goto(BASE + route, { waitUntil: 'load' }).catch(() => { ok = false; });
    await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1')).catch(() => { ok = false; });
    await p.reload({ waitUntil: 'load' }).catch(() => { ok = false; });
    if (!ok) {
      console.log(`\n${route} @${WIDTH}px — COULD NOT BE OPENED, so it is UNCHECKED, not clean`);
      scanFailures++;
      continue;
    }
    /* wait until nothing is mid-fade: a panel still animating in reads as
       faded-away, and a ring still growing reads as absent */
    let last = null, stable = 0;
    for (let waited = 0; waited < 6000; waited += 250) {
      await p.waitForTimeout(250);
      const moving = await p.evaluate(() => {
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
    let res;
    try {
      res = await walk(p);
    } catch (e) {
      console.log(`\n${route} @${WIDTH}px — WALK FAILED (${e.message}) — UNCHECKED, not clean`);
      scanFailures++;
      continue;
    }
    let hidden = res.rested.filter((r) => r.hidden);
    let noRing = res.rested.filter((r) => !r.hidden && r.same);
    if (hidden.length || noRing.length) {
      /* second, slower walk — see the note above walk() */
      try {
        const slow = await walk(p, 450);
        res = slow;
        hidden = slow.rested.filter((r) => r.hidden);
        noRing = slow.rested.filter((r) => !r.hidden && r.same);
      } catch (e) {
        console.log(`\n${route} @${WIDTH}px — the confirming walk FAILED (${e.message}) — UNCHECKED, not clean`);
        scanFailures++;
        continue;
      }
    }
    if (res.capped) cappedRoutes++;
    if (hidden.length || noRing.length) {
      console.log(`\n${route} @${WIDTH}px — ${res.rested.length} focus stop(s)`);
      hidden.forEach((r) => console.log(`   FOCUSABLE BUT UNSEEABLE  ${r.name}\n      ${r.hidden}`));
      noRing.forEach((r) => console.log(`   NO FOCUS INDICATOR       ${r.name}`));
      problems += hidden.length + noRing.length;
    } else clean++;
  }
  console.log(`\n${ROUTES.length} routes at ${WIDTH}px — ${clean} clean (up to ${MAX_TABS} Tab presses each)`);
  await p.close();
}
await b.close();
if (cappedRoutes) console.log(`\nNOTE: ${cappedRoutes} route-width(s) still had focus stops left at the ${MAX_TABS}-Tab cap — those tails were NOT examined`);
if (scanFailures) console.log(`\n${scanFailures} route-width(s) could not be examined at all`);
console.log(problems
  ? `\n${problems} keyboard problem(s) across ${ROUTES.length} route(s) at ${WIDTHS.join('px, ')}px`
  : `\nevery focus stop is visible and shows where it is, across ${ROUTES.length} route(s) at ${WIDTHS.join('px, ')}px`);
process.exit(problems || scanFailures ? 1 : 0);
