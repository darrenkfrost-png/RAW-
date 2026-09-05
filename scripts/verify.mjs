/**
 * THE PRE-PUSH GATE.
 *
 * A push to main IS a deploy. This is the last thing that runs before one.
 *
 * ⚠️ WHY IT EXISTS. Every check below is here because something got past me
 * and reached the live site. Not one of them is hypothetical:
 *
 *   · 25 of 26 pages returned 404 for a week, because a static host has no
 *     SPA fallback until you write one.
 *   · The compiled backend and its source map were downloadable from the
 *     document root — the server is not a page, so no paywall test saw it.
 *   · A deploy renames every chunk, and anyone holding the old build got a
 *     crash card until /assets misses returned a real 404.
 *   · A note written inside JSX rendered as text on the front page. A bare
 *     block comment there is not a comment.
 *   · Camera masters were being served as page backgrounds: 995MB on one page.
 *   · The catalogue linked WordPress's `-scaled` originals, 1.7MB a picture.
 *
 * WHAT IT NEEDS: nothing that is not already installed. The static checks use
 * Node's own fetch against a running build. The browser checks (accessibility,
 * rendered-comment text) run only if `playwright-core` happens to be present,
 * and are reported as skipped otherwise rather than silently passing.
 *
 * USAGE
 *   npm run build && npm run start      # in one terminal
 *   npm run verify                      # in another
 *   npm run verify -- https://your-site # or against the deployed site
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = (process.argv[2] || process.env.VERIFY_URL || 'http://localhost:3000').replace(/\/$/, '');

let failures = 0;
let checks = 0;
const pass = (name, note = '') => { checks++; console.log(`  PASS  ${name}${note ? ` — ${note}` : ''}`); };
const fail = (name, why) => { checks++; failures++; console.log(`  FAIL  ${name}\n        ${why}`); };
const HOST_RULE =
  ' This rule lives in public/.htaccess, so it only applies on the real host — run the gate against `npm run start` or the deployed URL, not `vite preview`.';

const skip = (name, why) => { console.log(`  SKIP  ${name} — ${why}`); };

const get = async (url, opts = {}) => {
  const res = await fetch(url, { redirect: 'follow', ...opts });
  return { status: res.status, type: res.headers.get('content-type') || '', text: res.headers.get('content-type')?.includes('image') ? '' : await res.text() };
};

console.log(`\nverifying ${BASE}\n`);

/* ── 1. every route the app serves actually answers ────────────────────────
   A static host answers a missing route with whatever the fallback says, so
   "200" alone proves nothing: the page must also carry the app's entry script. */
const app = fs.readFileSync(path.join(ROOT, 'src', 'App.tsx'), 'utf8');
const routes = ['/', ...[...app.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]).filter((r) => !r.includes(':') && r !== '*').map((r) => `/${r}`), '/product/29', '/target/athletes'];
{
  const bad = [];
  for (const r of routes) {
    try {
      const res = await get(BASE + r);
      if (res.status !== 200 || !/assets\/index-[\w-]+\.js/.test(res.text)) bad.push(`${r} (${res.status})`);
    } catch (e) { bad.push(`${r} (${e.message})`); }
  }
  bad.length ? fail('every route serves the app', bad.slice(0, 6).join(', ')) : pass('every route serves the app', `${routes.length} routes`);
}

/* ── 2. a missing asset must 404, or a stale visitor gets HTML as JavaScript ── */
{
  const res = await get(`${BASE}/assets/does-not-exist-${Date.now()}.js`);
  res.status === 404 ? pass('a missing /assets file 404s') : fail('a missing /assets file 404s', `got ${res.status} ${res.type} — a stale tab will crash on the next deploy.${HOST_RULE}`);
}

/* ── 3. the server bundle and its source map are not published ───────────── */
{
  const leaks = [];
  for (const p of ['/server.cjs', '/server.cjs.map', '/server.ts', '/.env', '/package.json']) {
    const res = await get(BASE + p);
    if (res.status === 200 && !/assets\/index-[\w-]+\.js/.test(res.text)) leaks.push(p);
  }
  leaks.length ? fail('no server files are published', leaks.join(', ')) : pass('no server files are published');
}

/* ── 4. /api/* must not fall through to the app ──────────────────────────── */
{
  const res = await get(`${BASE}/api/health`);
  res.status === 404 ? pass('/api/* does not fall through to the app') : fail('/api/* does not fall through', `got ${res.status}; a page reading this will believe an API exists.${HOST_RULE}`);
}

/* ── 5. the sitemap only advertises pages that exist ─────────────────────── */
{
  const res = await get(`${BASE}/sitemap.xml`);
  if (res.status !== 200) fail('sitemap serves', `got ${res.status}`);
  else {
    const locs = [...res.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const paths = [...new Set(locs.map((l) => new URL(l).pathname))];
    const bad = [];
    for (const p of paths.slice(0, 90)) {
      const r = await get(BASE + p);
      if (r.status !== 200) bad.push(`${p} (${r.status})`);
    }
    bad.length ? fail('every sitemap URL resolves', bad.slice(0, 5).join(', ')) : pass('every sitemap URL resolves', `${paths.length} URLs`);
  }
}

/* ── 6. nothing invented survived into the shipped code ──────────────────── */
{
  const index = await get(BASE + '/');
  const entry = (index.text.match(/assets\/index-[\w-]+\.js/) || [])[0];
  if (!entry) fail('the entry script is reachable', 'no /assets/index-*.js in the HTML');
  else {
    const js = (await get(`${BASE}/${entry}`)).text;
    const chunks = [...new Set([...js.matchAll(/assets\/[\w.-]+\.js/g)].map((m) => m[0]))];
    let all = js;
    for (const c of chunks) all += (await get(`${BASE}/${c}`)).text;

    /* Invented readouts and dead features, each removed for a reason. */
    const banned = ['ACTIVE_NODES', 'BIO_BLUEPRINT', 'AUTO_MODERATION', 'RE_SYNC_SYSTEM_NODES', 'Neural Intelligence', 'INDEX_STATION', 'COGNITIVE_INTEGRITY_INDEX', 'Neural_Interface', 'api/debug-crash', 'api/gemini', 'GoogleGenAI', 'Auto-recovery sequence', 'transparenttextures', 'grainy-gradients', 'hello@rawofficial.co'];
    const found = banned.filter((b) => all.includes(b));
    found.length ? fail('no removed feature survives in the bundle', found.join(', ')) : pass('no removed feature survives in the bundle', `${chunks.length + 1} chunks`);

    /* Camera masters. Every reel has a web copy on the same host; linking the
       master is how one page came to cost 995MB. */
    const masters = [...new Set([...all.matchAll(/videos\.files\.wordpress\.com\/\w+\/[\w.-]+\.mp4/g)].map((m) => m[0]))]
      .filter((u) => !/_mp4_(hd|std|dvd)/.test(u))
      .filter((u) => !/(this-isnt-comfort|that-moment-where|theres-a-point)/.test(u)); // these three masters ARE the small copy
    masters.length ? fail('no camera master is used as a page asset', masters.map((m) => m.split('/').pop().slice(0, 40)).join(', ')) : pass('no camera master is used as a page asset');

    /* ⚠️ THIS USED TO GREP THE BUNDLE FOR "-scaled", AND THAT WAS WRONG.
       The catalogue DATA still holds those addresses; allProducts rewrites
       them through webSizedImage on the way out, so nothing ever requests
       one — verified against the live site. Grepping the bundle tested the
       raw data and failed a site that was behaving correctly. The invariant
       worth guarding is that the mapping is still in place. */
    const catalogue = fs.readFileSync(path.join(ROOT, 'src', 'data', 'products.ts'), 'utf8');
    /webSizedImage\(p\.image\)/.test(catalogue)
      ? pass('the catalogue hands out web-sized images')
      : fail('the catalogue hands out web-sized images', 'allProducts no longer maps image through webSizedImage; the -scaled originals are 1.3-1.7MB each');
    /* The structured data must never advertise a price the checkout refuses. */
    const paymentsOn = /export const PAYMENTS_ENABLED = true/.test(fs.readFileSync(path.join(ROOT, 'src', 'lib', 'site.ts'), 'utf8'));
    if (!paymentsOn && /"offers"/.test(all)) fail('no offer is published while the checkout is shut', 'search results would show a price nobody can pay');
    else pass('no offer is published while the checkout is shut', paymentsOn ? 'payments are live, offers allowed' : 'payments off, offers withheld');
    if (/aggregateRating|ratingValue/.test(all)) fail('no invented rating is published', 'there are no reviews'); else pass('no invented rating is published');
  }
}

/* ── 7. the service worker must never cache a failure as the app shell ───── */
{
  const sw = await get(`${BASE}/sw.js`);
  if (sw.status !== 200) fail('the service worker serves', `got ${sw.status}`);
  else if (!/res\.ok/.test(sw.text)) fail('the service worker only caches successful navigations', 'without an res.ok guard it will save a 404 page as the offline shell');
  else pass('the service worker only caches successful navigations');
}

/* ── 8. browser checks, if the tooling happens to be here ────────────────── */
let chromium = null;
try {
  const { createRequire } = await import('node:module');
  chromium = createRequire(path.join(ROOT, 'package.json'))('playwright-core').chromium;
} catch { /* not installed: reported as skipped below, never as a pass */ }

if (!chromium) {
  skip('no page renders source comments', 'playwright-core not installed');
  skip('no page has an accessibility violation', 'playwright-core not installed');
} else {
  const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p));
  if (!exe) {
    skip('no page renders source comments', 'no Chrome found');
    skip('no page has an accessibility violation', 'no Chrome found');
  } else {
    const browser = await chromium.launch({ executablePath: exe, headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const sample = ['/', '/shop', '/product/29', '/combat', '/contact'];
    const leaked = [];
    for (const r of sample) {
      await page.goto(BASE + r, { waitUntil: 'load' });
      await page.waitForTimeout(800);
      await page.keyboard.press('Enter').catch(() => {});
      await page.waitForTimeout(1200);
      /* ⚠️ A BARE /* *​/ INSIDE JSX IS A TEXT NODE, NOT A COMMENT. One of mine
         painted itself across the front page for a whole build. */
      const hit = await page.evaluate(() => (document.body.innerText.match(/\/\*|\*\/|⚠️/) || [])[0] || null);
      if (hit) leaked.push(`${r} shows ${JSON.stringify(hit)}`);
    }
    leaked.length ? fail('no page renders source comments', leaked.join('; ')) : pass('no page renders source comments', `${sample.length} routes`);

    const axe = path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js');
    if (!fs.existsSync(axe)) skip('no page has an accessibility violation', 'axe-core not installed');
    else {
      const bad = [];
      for (const r of sample) {
        await page.goto(BASE + r, { waitUntil: 'load' });
        await page.waitForTimeout(800);
        await page.keyboard.press('Enter').catch(() => {});
        await page.waitForTimeout(1200);
        await page.addScriptTag({ path: axe });
        const v = await page.evaluate(async () => {
          const res = await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
          return res.violations.map((x) => `${x.id}(${x.nodes.length})`);
        });
        if (v.length) bad.push(`${r}: ${v.join(', ')}`);
      }
      bad.length ? fail('no page has an accessibility violation', bad.join(' | ')) : pass('no page has an accessibility violation', `${sample.length} routes, WCAG 2.1 AA`);
    }
    await browser.close();
  }
}

console.log(`\n${checks - failures}/${checks} checks passed${failures ? ` — ${failures} FAILED, do not push` : ''}\n`);
process.exit(failures ? 1 : 0);
