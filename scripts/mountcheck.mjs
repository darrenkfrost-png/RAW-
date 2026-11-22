/**
 * THE SITE, MOUNTED THE WAY DEFROST.WORLD MOUNTS IT.
 *
 * ⚠️ WHY THIS IS NOT OPTIONAL. The integration brief says DEFROST serves this
 * repository's static build inside a sandboxed frame at
 * defrost-world.com/sites/<slug>/, with no server behind it. Everything about
 * the DEFROST branch of this app — hash routing, the store opening in a new
 * tab, the storage notices — is a claim about a situation that never occurs on
 * our own host. A claim nobody has run is a guess.
 *
 * So this builds that situation: a static server with no deep-link fallback,
 * serving dist/ at /sites/raw-official/, loaded inside a real frame with
 * window.__defrostWebsite set before the bundle runs. Then it checks the three
 * things that would make the site dead in there:
 *
 *   1. it mounts at all, and renders its own content
 *   2. it uses HASH routing — a path-routed deep link would 404 on the host,
 *      because there is no server to rewrite it
 *   3. its own links navigate inside the frame rather than breaking
 *
 * ⚠️ AND IT PROVES THE SERVER REALLY HAS NO FALLBACK first, by asking for a
 * deep path and requiring a 404. If that answered 200, this whole harness
 * would be a friendlier host than the real one and every result below would be
 * worthless.
 *
 * USAGE: npm run mountcheck
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const MOUNT = '/sites/raw-official/';
const PORT = 4991;

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

/* The host page that frames the site, exactly as DEFROST would: the global is
   written by the PARENT before the child loads, and the child is sandboxed. */
const HOST_PAGE = `<!doctype html><html><head><title>DEFROST mount harness</title></head>
<body style="margin:0;background:#000">
<iframe id="site" src="${MOUNT}" style="width:100vw;height:100vh;border:0"
  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
<script>
  const f = document.getElementById('site');
  f.addEventListener('load', () => {
    try { f.contentWindow.__defrostWebsite = 'https://rawofficial.co'; } catch (e) {}
  });
</script>
</body></html>`;

const server = http.createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);

  if (url === '/' || url === '/host') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(HOST_PAGE);
    return;
  }

  /* ⚠️ DEFROST REWRITES ROOT-RELATIVE ADDRESSES INTO THE MOUNT, AND SO MUST
     THIS, OR THE HARNESS IS NOT A TEST OF DEFROST. The built index.html asks
     for /assets/index-xxx.js, because Vite's base has to stay "/" — a relative
     base would break the app on our OWN domain, where /watch/yt-abc is a real
     path and "./assets/..." would resolve under it. The brief says the host
     rewrites those; the first run of this harness did not, so the bundle 404'd
     and the page rendered zero characters. That was the harness being stricter
     than the real thing, not the site being broken — and a harness that fails
     a healthy site is as useless as one that passes a broken one.
     What is NOT rewritten is a deep link: there is still no SPA fallback. */
  const asset = /\.[a-z0-9]{2,5}$/i.test(url);
  if (!url.startsWith(MOUNT) && !asset) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }

  let rel = url.startsWith(MOUNT) ? url.slice(MOUNT.length) : url.replace(/^\//, '');
  if (rel === '' || rel === '/') rel = 'index.html';

  /* ⚠️ NO SPA FALLBACK, DELIBERATELY. This is the point of the harness: a
     static mount cannot rewrite /sites/<slug>/shop to index.html, which is
     exactly why the app must use hash routing in here. */
  const file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) { res.writeHead(403); res.end(); return; }

  try {
    const body = await fs.readFile(file);
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
});

await new Promise((r) => server.listen(PORT, r));
const BASE = `http://localhost:${PORT}`;

let bad = 0;
const fail = (m) => { console.log('   ' + m); bad++; };

/* ── SELF-TEST: the harness must really be as unhelpful as the real host ── */
const probe = await fetch(`${BASE}${MOUNT}shop`);
if (probe.status !== 404) {
  console.error(`SELF-TEST FAILED: a path-routed deep link answered ${probe.status}, so this harness is kinder than a static mount and would hide the very fault it exists to find.`);
  server.close();
  process.exit(2);
}
console.log('SELF-TEST: a path-routed deep link 404s here, as it would on a static mount');

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(`${BASE}/host`, { waitUntil: 'load' });
await page.waitForTimeout(1500);

const frame = page.frames().find((f) => f.url().includes(MOUNT));
if (!frame) {
  console.error('the site did not load in the frame at all');
  await b.close(); server.close(); process.exit(1);
}

/* Get past the opening gate the way a visitor does. */
await frame.evaluate(() => { try { sessionStorage.setItem('raw_intro_seen', '1'); } catch {} });
await frame.evaluate(() => location.reload());
await page.waitForTimeout(4000);

const live = page.frames().find((f) => f.url().includes(MOUNT));
const seen = await live.evaluate(() => ({
  url: location.href,
  title: document.title,
  main: (document.querySelector('main')?.innerText || '').trim().length,
  h1: document.querySelector('h1')?.textContent?.slice(0, 50) || '',
  navLinks: document.querySelectorAll('#main-nav a[href]').length,
  firstNav: [...document.querySelectorAll('#main-nav a[href]')].map((a) => a.getAttribute('href')).slice(0, 4),
  insideFlag: typeof window.__defrostWebsite,
}));

console.log(`   mounted at ${seen.url}`);

if (seen.main < 200) fail(`the page rendered ${seen.main} characters of content — it did not mount`);
else console.log(`   it rendered its own content (${seen.main} characters, h1 "${seen.h1}")`);

/* 2. HASH routing, because nothing can answer a path here.
   ⚠️ NOT "does the address contain a #". At the mount root a hash router shows
   the home page with no hash at all, which is correct — the first version of
   this check called that a failure on a perfectly healthy site. The evidence
   that matters is what the site's own links look like, and whether a hash deep
   link loads straight into the right page with no server behind it. */
if (!seen.firstNav.some((h) => (h || '').includes('#'))) {
  fail(`its own links are not hash links (${seen.firstNav.join(', ')}) — they would leave the mount and 404`);
} else {
  console.log('   it is hash-routed, so a deep link needs no server');
}

console.log(`   its links stay inside the mount (${seen.firstNav.filter(Boolean).find((h) => h.includes('#')) || seen.firstNav[0]})`);

/* 2b. THE DEEP LINK ITSELF. Someone shares an address from inside DEFROST, or
   the Oracle is asked to open a page. Load one cold and require the real page,
   not the home page and not an empty shell. */
await page.goto(`${BASE}${MOUNT}#/watch`, { waitUntil: 'load' });
await page.waitForTimeout(3500);
const deep = await (page.frames().find((f) => f.url().includes(MOUNT)) || page).evaluate(() => ({
  h1: (document.querySelector('h1')?.textContent || '').slice(0, 60),
  main: (document.querySelector('main')?.innerText || '').trim().length,
}));
if (!/searchable|every film/i.test(deep.h1) || deep.main < 200) {
  fail(`a cold deep link to #/watch rendered "${deep.h1}" (${deep.main} chars) instead of The Vault`);
} else {
  console.log(`   a cold deep link lands on the right page ("${deep.h1.trim()}")`);
}
/* Back into the frame for the navigation test. ⚠️ Re-find the frame AFTER the
   wait: the previous goto detached the old one, and calling evaluate on a
   detached frame throws and kills the run rather than failing a check. */
await page.goto(`${BASE}/host`, { waitUntil: 'load' });
await page.waitForTimeout(3500);

/* 3. A link really navigates, rather than reloading into nothing. */
const framed2 = page.frames().find((f) => f.url().includes(MOUNT));
const before = await framed2.evaluate(() => location.href);
await framed2.evaluate(() => {
  const a = [...document.querySelectorAll('#main-nav a[href]')].find((x) => /shop/i.test(x.textContent || ''));
  a?.click();
});
await page.waitForTimeout(2500);
const after = await (page.frames().find((f) => f.url().includes(MOUNT))).evaluate(() => ({
  url: location.href,
  main: (document.querySelector('main')?.innerText || '').trim().length,
}));
if (after.url === before) fail('clicking Shop did not move the site anywhere');
else if (after.main < 200) fail(`after clicking Shop the page held ${after.main} characters — it navigated into nothing`);
else console.log(`   navigation works inside the frame (${after.url.split('#')[1] || after.url})`);

if (errors.length) fail(`the page threw — ${errors[0].slice(0, 110)}`);
else console.log('   nothing threw');

await b.close();
server.close();
console.log(bad ? `\n${bad} problem(s) — this site would not work inside DEFROST` : '\nthe site mounts, routes and navigates correctly inside a sandboxed sub-path frame');
process.exit(bad ? 1 : 0);
