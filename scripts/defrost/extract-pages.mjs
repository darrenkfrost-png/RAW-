/**
 * THE SITE'S OWN WORDS, TAKEN FROM THE SITE.
 *
 * ⚠️ WHY THIS IS A SEPARATE STEP, AND NOT PART OF THE BUILD. The knowledge pack
 * has to carry each page's real text, and most of this site's prose lives inside
 * its React components — there is no content file to read. The only way to get
 * the true words, with no hand-copying and no chance of drift, is to load the
 * built pages and read what they actually render.
 *
 * But that needs a browser, and the build runs on a host that has none. A build
 * step that cannot run on the host is a build that fails in production. So this
 * runs HERE, like scripts/build-archive.mjs already does for the film archive,
 * and commits its result:
 *
 *     content/pages.generated.json
 *
 * scripts/defrost/build-knowledge.mjs then reads that file with plain Node, on
 * every build, on any machine.
 *
 * ⚠️ AND NOTHING HERE IS WRITTEN BY HAND OR BY ME. Every character of every
 * page's text below came out of the rendered page. Where a page renders nothing,
 * it is reported as empty and left out — never given words it does not have.
 *
 * USAGE
 *   npm run knowledge:extract                 # against the live site
 *   npm run knowledge:extract -- http://localhost:3999
 */
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(path.join(ROOT, 'package.json'));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com').replace(/\/$/, '');
const OUT = path.join(ROOT, 'content', 'pages.generated.json');

const alive = await fetch(BASE + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) {
  console.error(`SERVER NOT ANSWERING (${alive}) at ${BASE} — nothing extracted, nothing written.`);
  process.exit(1);
}

/* The page list comes from the site's own sitemap, so a page added later is
   picked up without editing this file. Product and film pages are left out on
   purpose: the knowledge pack builds those from src/data, which is where their
   words already live as data. */
const sitemap = await fetch(BASE + '/sitemap.xml').then((r) => r.text());
const paths = [...new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1]).pathname)
  .filter((p) => !/^\/(product|watch)\//.test(p)))].sort();

console.log(`${paths.length} page(s) to read from ${BASE}`);

/* What a page is: its heading, its title, and the text of its <main>. The top
   bar, footer and status bar sit outside <main>, so the site's chrome is not
   repeated into every document. */
const READ = () => {
  const main = document.querySelector('main');

  /* ⚠️ DECORATION IS NOT CONTENT, AND THE FIRST RUN PROVED IT. The home page's
     texture layer is the word "RAW_..." forty times over at 5% opacity; read
     straight out of <main>, it became the first three hundred characters the
     Oracle would have answered from. The breadcrumb ("RAW:// YOU ARE HERE ...")
     is chrome too, repeated on every page.

     Both are already marked as decoration in the markup — aria-hidden="true"
     and nav[aria-label="Breadcrumb"] — so nothing has to be guessed or named by
     hand here: whatever the site tells a screen reader to ignore, this ignores.
     They are hidden only for the moment of reading, then put back. */
  const hidden = [...document.querySelectorAll('main [aria-hidden="true"], main nav[aria-label="Breadcrumb"]')];
  const prior = hidden.map((el) => el.style.display);
  hidden.forEach((el) => { el.style.display = 'none'; });

  const raw = main?.innerText || '';
  hidden.forEach((el, i) => { el.style.display = prior[i]; });

  const text = raw
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l, i, a) => l !== '' || (a[i - 1] || '') !== '')
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  /* A line the page draws over and over — a ticker, a repeated label — is said
     once. Order is kept; nothing is reworded. */
  const once = new Set();
  const deduped = text.split('\n').filter((l) => {
    if (l.length < 3) return true;
    if (once.has(l)) return false;
    once.add(l);
    return true;
  }).join('\n');
  return {
    title: document.title,
    h1: (document.querySelector('h1')?.textContent || '').replace(/\s+/g, ' ').trim(),
    description: document.head.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    text: deduped,
  };
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });

/* ── SELF-TEST: an empty page must be reported as empty ──────────────────────
   ⚠️ A generator that silently writes "" for a page it failed to read would
   publish a pack full of blanks and call it a success. So before anything is
   kept, one page is deliberately emptied and the reader must notice. */
await p.goto(BASE + '/contact', { waitUntil: 'load' });
await p.waitForTimeout(1500);
await p.keyboard.press('Enter').catch(() => {});
await p.waitForTimeout(1200);
await p.evaluate(() => { const m = document.querySelector('main'); if (m) m.innerHTML = ''; });
const planted = await p.evaluate(READ);
if (planted.text.length !== 0) {
  console.error(`SELF-TEST FAILED: an emptied page still read ${planted.text.length} characters, so this reader is not reading the page — every result below would be worthless.`);
  await b.close();
  process.exit(2);
}
console.log('SELF-TEST: an emptied page reads as empty, so the reader is really reading the page');

const pages = [];
const empty = [];
for (const route of paths) {
  try {
    await p.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
    await p.waitForTimeout(900);
    /* Walk the page so anything that renders on scroll has rendered. */
    await p.evaluate(async () => {
      const step = innerHeight * 0.9;
      for (let y = 0; y < document.body.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      scrollTo(0, 0);
    });
    await p.waitForTimeout(500);
    const r = await p.evaluate(READ);
    if (r.text.length < 40) { empty.push(route); continue; }
    pages.push({ path: route, title: r.title, h1: r.h1, description: r.description, text: r.text });
    process.stdout.write('.');
  } catch (e) {
    empty.push(`${route} (${String(e).slice(0, 50)})`);
  }
}
await b.close();
console.log('');

const payload = {
  _generated: `by scripts/defrost/extract-pages.mjs from ${BASE} — do not edit by hand`,
  source: BASE,
  extractedAt: new Date().toISOString(),
  pages,
};
await fs.writeFile(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');

const words = pages.reduce((n, x) => n + x.text.split(/\s+/).length, 0);
console.log(`${pages.length} page(s) written to content/pages.generated.json — ${words.toLocaleString()} words of the site's own text`);
if (empty.length) console.log(`${empty.length} page(s) rendered nothing worth keeping and were LEFT OUT (not invented): ${empty.join(', ')}`);
process.exit(0);
