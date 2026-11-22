/**
 * DOES EVERY FILM ACTUALLY PLAY?
 *
 * ⚠️ A <video> THAT NEVER STARTS LOOKS EXACTLY LIKE ONE THAT IS LOADING.
 * A poster sits there either way, so a broken source, a 404, a codec the
 * browser will not take, or an autoplay that was refused all present as
 * "still arriving" and nobody notices. The only honest test is to watch the
 * clock: a film that is playing has a currentTime that goes up.
 *
 * So this samples currentTime twice, a second apart, and reports anything
 * that did not move — along with any media error and any failed request for
 * a video file, which is what tells you WHY it did not move.
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:5331').replace(/\/$/, '');
/* ⚠️ '/defrost' WAS IN THIS LIST AFTER THE PAGE WAS REMOVED, AND THE PROBE
   DID NOT NOTICE. The app answers an unknown address with the shell, and the
   shell carries the site-wide background film — so the probe measured the
   wallpaper on a "page not found" screen and reported a healthy film at
   /defrost. A route that no longer exists cannot fail a check; it can only
   pad the count. It is '/watch' now, which is a real page with real films. */
const ROUTES = process.argv.slice(3).length ? process.argv.slice(3)
  : ['/', '/combat', '/recovery', '/nutrients', '/showcase', '/our-story', '/stay-safe', '/watch', '/films'];

const MEDIA_ERR = ['', 'ABORTED', 'NETWORK', 'DECODE', 'SRC_NOT_SUPPORTED'];

const b = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required'],
});
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();

const failedRequests = [];
p.on('requestfailed', (r) => {
  const why = r.failure()?.errorText || '';
  /* ⚠️ ERR_ABORTED IS NOT A BROKEN FILM. Tiles that preview on hover cancel
     their own fetch the moment the pointer leaves, and treating that as a
     failure buried the real ones under a dozen false alarms. */
  if (/\.(mp4|webm|mov)(\?|$)/i.test(r.url()) && !/ABORTED/.test(why)) failedRequests.push(`${r.url().split('/').pop().slice(0, 50)} — ${why}`);
});
p.on('response', (r) => {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(r.url()) && r.status() >= 400) failedRequests.push(`${r.url().split('/').pop().slice(0, 50)} — HTTP ${r.status()}`);
});

let stalled = 0, played = 0, broken = 0;
for (const route of ROUTES) {
  failedRequests.length = 0;
  await p.goto(BASE + route, { waitUntil: 'load' });
  await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
  await p.reload({ waitUntil: 'load' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 450) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 220)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(4000);

  const sample = () => p.evaluate(() => [...document.querySelectorAll('video')].map((v) => ({
    src: (v.currentSrc || v.src || '(none)').split('/').pop().slice(0, 42),
    t: v.currentTime,
    paused: v.paused,
    ready: v.readyState,
    err: v.error ? v.error.code : 0,
    /* ⚠️ ONLY A FILM THAT MEANT TO PLAY CAN HAVE FAILED TO. The showcase and
       Stay Safe tiles start on hover and are SUPPOSED to sit at 0.00 paused —
       judging them stalled produced sixteen failures of which none were real.
       autoplay is the film's own statement that it intends to run. */
    autoplay: v.autoplay,
  })));

  const a = await sample();
  await p.waitForTimeout(1200);
  const z = await sample();

  for (let i = 0; i < z.length; i++) {
    const before = a[i], now = z[i];
    if (!now) continue;
    const moved = before && now.t > before.t + 0.01;
    // A film deliberately waiting for a press is not stalled: it has no source yet.
    const awaitingPress = now.src === '(none)';
    const awaitingHover = !now.autoplay;
    if (awaitingPress || awaitingHover) continue;
    if (moved) { played++; continue; }
    stalled++;
    console.log(`XX ${route.padEnd(12)} did not advance  t=${now.t.toFixed(2)} paused=${now.paused} readyState=${now.ready}` +
      (now.err ? `  MEDIA_ERR_${MEDIA_ERR[now.err]}` : '') + `  ${now.src}`);
  }
  /* ⚠️ A FILM WHOSE REQUEST FAILED NEVER GETS TO STALL — it never attaches,
     so the clock check above never sees it. Counting only stalls let a
     deliberately broken source through with "all films advanced" and exit 0.
     A failed request is a failure in its own right. */
  const unique = [...new Set(failedRequests)];
  broken += unique.length;
  unique.forEach((f) => console.log(`XX ${route.padEnd(12)} request failed   ${f}`));
}
await b.close();
const total = stalled + broken;
console.log(total
  ? `\n${stalled} film(s) did not advance, ${broken} source(s) failed to load; ${played} played`
  : `\nall ${played} attached films advanced their clock, and no source failed to load`);
process.exit(total ? 1 : 0);
