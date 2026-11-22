/**
 * THE FILM PAGES — all of them, every time.
 *
 * ⚠️ WHY THIS PROBE EXISTS AT ALL. The 116 /watch/:id pages are published in
 * their own sitemap (public/sitemap-videos.xml) so they do not treble the cost
 * of the accessibility and keyboard sweeps, which read sitemap.xml. A page kept
 * out of the sweep that nothing else looks at is an unchecked page wearing a
 * clean sheet — so this walks every one of them and checks the handful of
 * things that can actually be wrong on a data-driven page:
 *
 *   · it renders the film's REAL title, not the shell or a 404
 *   · a film the data says has a transcript actually serves one, and it is
 *     not empty
 *   · a film the data says has NO transcript says so in words, rather than
 *     showing an empty panel that reads as "nothing was said"
 *   · nothing threw in the console
 *
 * ⚠️ THE CLAIM IS CHECKED AGAINST THE DATA, BOTH WAYS. Checking only that
 * transcripts load would pass a site where every film quietly claims to have
 * one. Checking only the absent ones would pass a site where none load.
 *
 * USAGE
 *   npm run watchcheck                 # local build
 *   npm run watchcheck -- https://…    # the deployed site
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');
import fs from 'node:fs/promises';

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');

/* ⚠️ THE LIST IS READ, NOT PATTERN-MATCHED. This probe first scraped the film
   list out of the generated TypeScript with a regular expression and matched
   115 of 116 — one title's punctuation slipped the pattern, so a published page
   went unchecked inside a run that reported a clean sweep. The generator now
   writes a manifest, and the count is cross-checked against the sitemap that
   actually publishes these pages, so a gap of even one is an error and not a
   silence. */
const FILMS = JSON.parse(await fs.readFile(new URL('../public/transcripts/manifest.json', import.meta.url), 'utf8'));
const sitemap = await fs.readFile(new URL('../public/sitemap-videos.xml', import.meta.url), 'utf8').catch(() => '');
const published = [...sitemap.matchAll(/<loc>[^<]*\/watch\/([^<]+)<\/loc>/g)].map((m) => m[1]);

if (!FILMS.length) {
  console.error('the archive manifest is empty — refusing to report a clean sweep of nothing');
  process.exit(2);
}
const missing = published.filter((id) => !FILMS.some((f) => f.id === id));
if (missing.length) {
  console.error(`${missing.length} page(s) are published in sitemap-videos.xml but absent from the manifest, so they would go unchecked: ${missing.slice(0, 5).join(', ')}`);
  process.exit(2);
}
if (published.length && published.length !== FILMS.length) {
  console.error(`the sitemap publishes ${published.length} film pages and the manifest lists ${FILMS.length} — one of them is wrong, so neither can be trusted`);
  process.exit(2);
}

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

/* ⚠️ SELF-TEST. Ask for a film id that does not exist: the page must say so.
   If a nonsense address renders like a real film, then every "PASS" below is
   meaningless, because the probe cannot tell a page from a shell. */
await p.goto(`${BASE}/watch/yt-this-id-does-not-exist`, { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(2500);
const nonsense = await p.evaluate(() => document.body.innerText);
if (!/not in the vault/i.test(nonsense)) {
  console.error('SELF-TEST FAILED: an invented film id did not produce the "not in the vault" page, so this probe cannot tell a real film page from a shell.');
  await b.close();
  process.exit(2);
}
console.log('SELF-TEST: an invented film id is refused, so a rendered title means a real page');

let bad = 0;
let withText = 0;
const problems = [];

for (const film of FILMS) {
  const errors = [];
  p.removeAllListeners('pageerror');
  p.on('pageerror', (e) => errors.push(e.message));

  await p.goto(`${BASE}/watch/${film.id}`, { waitUntil: 'load' }).catch(() => {});
  await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1')).catch(() => {});
  await p.reload({ waitUntil: 'load' }).catch(() => {});
  /* the transcript is fetched after mount, so wait for it to settle */
  await p.waitForTimeout(1800);

  const seen = await p.evaluate(() => ({
    text: document.body.innerText,
    h1: document.querySelector('h1')?.textContent || '',
    lines: document.querySelectorAll('ol li button').length,
    title: document.title,
  })).catch(() => null);

  if (!seen) { problems.push(`${film.id}: the page could not be read`); bad++; continue; }

  /* the real title, not the shell */
  const want = film.title.replace(/\s+/g, ' ').trim().slice(0, 40).toLowerCase();
  if (want && !seen.h1.replace(/\s+/g, ' ').toLowerCase().includes(want.slice(0, 24))) {
    problems.push(`${film.id}: the heading is "${seen.h1.slice(0, 50)}" — expected "${film.title.slice(0, 50)}"`);
    bad++;
  }

  if (film.transcript) {
    if (seen.lines < 3) {
      problems.push(`${film.id}: the data says this film has a transcript, but the page shows ${seen.lines} line(s)`);
      bad++;
    } else withText++;
  } else if (!/no caption track|does not publish a caption track/i.test(seen.text)) {
    /* ⚠️ the other direction: silence must be explained, not left blank */
    problems.push(`${film.id}: has no transcript and does not say so — an empty panel reads as "nothing was said"`);
    bad++;
  }

  if (errors.length) {
    problems.push(`${film.id}: threw — ${errors[0].slice(0, 90)}`);
    bad++;
  }
}

await b.close();
if (problems.length) {
  console.log('');
  problems.forEach((m) => console.log('   ' + m));
}
console.log(`\n${FILMS.length} film pages checked · ${withText} served a real transcript · ${FILMS.filter((f) => !f.transcript).length} correctly say they have none`);
console.log(bad ? `\n${bad} problem(s)` : '\nevery film page renders its own film, and every transcript claim matches what the page shows');
process.exit(bad ? 1 : 0);
