/**
 * AN OPEN PANEL MUST KEEP THE KEYBOARD, WITH REAL TAB PRESSES.
 *
 * ⚠️ THE FAULT THIS WAS WRITTEN FOR. With the Everything directory open — a
 * sheet covering the whole screen, holding thirty links — the next Tab after
 * the button that opened it landed on "SYSTEM", a breadcrumb link on the page
 * UNDERNEATH. A keyboard visitor opened the site's own directory and then
 * tabbed invisibly through the page behind it, with the focus ring hidden
 * under an opaque panel. Nothing on screen suggested anything was wrong.
 *
 * ⚠️ WHY THE OBVIOUS CHECK WOULD HAVE PASSED THE BROKEN SITE. Every one of
 * these panels already moved focus into itself when it opened, so a probe that
 * read `document.activeElement` after opening saw a perfect result. The escape
 * happens at the END of the cycle, several Tab presses later — which is why
 * this presses the key, over and over, the whole way round, in both
 * directions. `el.focus()` is not a Tab press and proves nothing here.
 *
 * ⚠️ AND IT PLANTS AN UNTRAPPED PANEL FIRST. A trap check that has never seen
 * an escape is a check nobody has tested. Before any real panel is opened, an
 * overlay with no trap is injected and the probe must catch it escaping; if it
 * does not, the run stops rather than reporting a clean site.
 *
 * USAGE
 *   npm run trapcheck                 # local build
 *   npm run trapcheck -- https://…    # the deployed site
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

/** Each panel: how it opens, and how we know it is open. */
const PANELS = [
  { name: 'the Everything directory', open: 'button[aria-label*="directory"]', panel: '[role="dialog"][aria-label="Everything on this site"]' },
  { name: 'product search',           open: 'button[aria-label="Search products"]', panel: '[role="dialog"][aria-label="Search products"]' },
  { name: 'the stack drawer',         open: 'button[aria-label^="My stack"]', panel: '[role="dialog"][aria-labelledby="protocol-drawer-title"]' },
  { name: 'the basket drawer',        open: 'button[aria-label^="Basket"]', panel: '[role="dialog"]' },
];

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

await p.goto(`${BASE}/`, { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(2500);

/** Tab `n` times and report every stop that was outside `selector`. */
async function walk(selector, n, shift = false) {
  const escaped = [];
  for (let i = 0; i < n; i++) {
    await p.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
    const where = await p.evaluate((sel) => {
      const panel = document.querySelector(sel);
      const el = document.activeElement;
      if (!panel || !el || el === document.body) return { out: !!panel, what: el ? el.tagName : 'BODY' };
      return {
        out: !panel.contains(el),
        what: ((el.getAttribute('aria-label') || el.textContent || el.tagName) || '').trim().slice(0, 40),
      };
    }, selector);
    if (where.out) escaped.push(`${shift ? 'Shift+Tab' : 'Tab'} #${i + 1} → "${where.what}"`);
  }
  return escaped;
}

/* ── SELF-TEST ────────────────────────────────────────────────────────────
   An overlay with no trap at all. The probe must see the keyboard leave it. */
await p.evaluate(() => {
  const d = document.createElement('div');
  d.id = 'trapcheck-plant';
  d.setAttribute('role', 'dialog');
  d.setAttribute('aria-label', 'planted untrapped panel');
  d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000';
  d.innerHTML = '<button id="trapcheck-first">one</button><button>two</button>';
  document.body.appendChild(d);
  document.getElementById('trapcheck-first').focus();
});
const planted = await walk('#trapcheck-plant', 6);
await p.evaluate(() => document.getElementById('trapcheck-plant')?.remove());
if (!planted.length) {
  console.error('SELF-TEST FAILED: an overlay with NO focus trap was not caught, so this probe cannot see an escape and a clean result below would mean nothing.');
  await b.close();
  process.exit(2);
}
console.log(`SELF-TEST: an untrapped overlay was caught escaping (${planted[0]})`);

/* ── THE REAL PANELS ──────────────────────────────────────────────────── */
let bad = 0;
for (const panel of PANELS) {
  const trigger = await p.$(panel.open);
  if (!trigger) {
    console.log(`   ${panel.name}: its button was not found — NOT CHECKED`);
    bad++;
    continue;
  }
  await trigger.click();
  await p.waitForTimeout(1200);

  const isOpen = await p.evaluate((sel) => !!document.querySelector(sel), panel.panel);
  if (!isOpen) {
    console.log(`   ${panel.name}: did not open — NOT CHECKED`);
    bad++;
    continue;
  }

  /* Enough presses to go round the longest panel more than once. */
  const out = [...await walk(panel.panel, 45), ...await walk(panel.panel, 12, true)];
  if (out.length) {
    console.log(`   ${panel.name}: the keyboard left it ${out.length} time(s) — ${out[0]}`);
    bad++;
  } else {
    console.log(`   ${panel.name}: the keyboard stayed inside, forwards and backwards`);
  }

  await p.keyboard.press('Escape');
  await p.waitForTimeout(800);
  /* And it must hand the keyboard back, not drop it on <body>. */
  const returned = await p.evaluate(() => {
    const el = document.activeElement;
    return !el || el === document.body ? null : (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40);
  });
  if (!returned) {
    console.log(`   ${panel.name}: closing dropped the keyboard at the top of the page instead of putting it back`);
    bad++;
  }
  await p.waitForTimeout(400);
}

await b.close();
console.log(bad ? `\n${bad} problem(s)` : `\nevery panel keeps the keyboard while it is open and hands it back when it closes — ${PANELS.length} checked`);
process.exit(bad ? 1 : 0);
