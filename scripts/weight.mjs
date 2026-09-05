// TRUE bytes over the wire, counted chunk by chunk as they arrive.
//
// ⚠️ TWO WRONG WAYS TO DO THIS, BOTH OF WHICH I USED FIRST.
//   · Summing each response's Content-Length OVER-counts: a browser opens a
//     range request for a whole film and abandons it once buffered. The header
//     said 28.5MB; a few MB actually moved.
//   · Summing encodedDataLength on loadingFinished UNDER-counts: a video that
//     is still streaming never "finishes", so it is missed entirely.
// Network.dataReceived fires per chunk and is the honest one.
// Run:  npm run weight            (against a local build)
//       npm run weight -- <url>   (against the deployed site)
//
// Needs playwright-core. Without it this says so and stops, rather than
// reporting a number it did not measure.
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Resolve from THIS repository, not from wherever the file was written. */
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'package.json'));
let chromium;
try {
  ({ chromium } = require('playwright-core'));
} catch {
  console.log('weight: playwright-core is not installed — no measurement taken.');
  process.exit(0);
}

const BASE = (process.argv[2] || 'http://localhost:5200').replace(/\/$/, '');
const SECONDS = Number(process.argv[3] || 12);
const ROUTES = ['/', '/shop', '/combat', '/recovery', '/nutrients', '/our-story', '/product/29', '/showcase'];
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => fs.existsSync(p));
if (!CHROME) { console.log('weight: no Chrome found — no measurement taken.'); process.exit(0); }
const browser = await chromium.launch({ executablePath: CHROME, headless: true });

for (const size of [{ n: 'phone', w: 375, h: 812 }, { n: 'desktop', w: 1440, h: 900 }]) {
  console.log(`\n${size.n.toUpperCase()} — true bytes in the first ${SECONDS}s`);
  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport: { width: size.w, height: size.h }, isMobile: size.w < 768, hasTouch: size.w < 768 });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    const urlOf = new Map();
    const per = new Map();
    cdp.on('Network.requestWillBeSent', (e) => urlOf.set(e.requestId, e.request.url));
    cdp.on('Network.dataReceived', (e) => {
      const u = urlOf.get(e.requestId) || '?';
      per.set(u, (per.get(u) || 0) + (e.encodedDataLength || e.dataLength || 0));
    });
    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter').catch(() => {});
      await page.waitForTimeout(SECONDS * 1000);
    } catch { /* keep what was measured */ }
    const total = [...per.values()].reduce((a, b) => a + b, 0);
    const top = [...per.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2)
      .filter(([, n]) => n > 300_000)
      .map(([u, n]) => `${(n / 1048576).toFixed(1)}MB ${u.split('/').pop().slice(0, 40)}`);
    console.log(`  ${route.padEnd(13)} ${(total / 1048576).toFixed(1).padStart(6)} MB   ${top.join('  ')}`);
    await ctx.close();
  }
}
await browser.close();
