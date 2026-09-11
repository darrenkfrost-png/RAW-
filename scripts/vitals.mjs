// HOW DOES A PAGE FEEL ON A PHONE? Two of Google's own measures:
//   LCP — when the largest thing on screen finished drawing (good < 2.5s)
//   CLS — how much the page jumped while loading        (good < 0.1)
// Measured with PerformanceObserver installed BEFORE the page's own scripts,
// on a 375px phone with a 4x CPU slowdown and a ~fast-4G network, 3 runs each,
// median reported. The intro gate is dismissed like a visitor would.
//
// ⚠️ PLANT A FAILURE FIRST: a test page that shifts a block by 300px must read
// CLS > 0.1, or the observer is not wired and every zero below is a lie.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B = process.argv[2] || 'https://skyblue-reindeer-199095.hostingersite.com';
const ROUTES = ['/', '/shop', '/product/29', '/nutrients', '/combat', '/recovery', '/our-story', '/contact', '/stay-safe', '/academy'];

const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive})`); process.exit(1); }

const OBSERVE = () => {
  window.__v = { lcp: 0, cls: 0, lcpEl: '' };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) { window.__v.lcp = e.startTime; window.__v.lcpEl = (e.element?.tagName || '') + ' ' + String(e.element?.className || '').slice(0, 40) + ' ' + (e.url || '').slice(-40); } }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
};

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const fresh = async () => {
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.addInitScript(OBSERVE);
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8 * 5, uploadThroughput: 750 * 1024 / 8 });
  return { ctx, p };
};

// the planted failure
{
  const { ctx, p } = await fresh();
  // ⚠️ A REAL NAVIGATION, AND THE PAGE SHIFTS ITSELF. setContent is not a
  // navigation (the init script never ran), and a shift made from outside via
  // evaluate() read 0.000 even with the observer installed by hand. So this is
  // a real page load whose own script moves the text 300px after first paint —
  // the same conditions the site is measured under.
  const html = '<!doctype html><body style="margin:0"><div style="height:200px;background:#333">top</div>' +
    '<p style="font-size:40px;margin:0">text that will move when the block above grows</p>' +
    '<script>setTimeout(()=>{const d=document.createElement("div");d.style.height="300px";d.style.background="#900";document.body.prepend(d)},600)<\/script></body>';
  await p.goto('data:text/html,' + encodeURIComponent(html));
  await p.waitForTimeout(2000);
  const v = await p.evaluate(() => window.__v);
  // The question is "does the observer fire at all", so any non-zero reading
  // passes. (The first threshold, 0.1, was wrong: one short line moving on an
  // 812px screen is a small fraction of the viewport — it read 0.033.)
  console.log(`PLANTED SHIFT reads CLS ${v.cls.toFixed(3)} — ${v.cls > 0.005 ? 'observer works' : 'OBSERVER BROKEN, results below are meaningless'}`);
  await ctx.close();
  if (!(v.cls > 0.005)) { await b.close(); process.exit(1); }
}

const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
console.log('\nroute                 LCP(ms)  CLS     largest element');
for (const r of ROUTES) {
  const lcps = [], clss = []; let el = '';
  for (let i = 0; i < 3; i++) {
    const { ctx, p } = await fresh();
    try {
      await p.goto(B + r, { waitUntil: 'load', timeout: 60000 });
      await p.waitForTimeout(1200);
      await p.keyboard.press('Enter').catch(() => {});
      await p.waitForTimeout(3500);
      const v = await p.evaluate(() => window.__v);
      lcps.push(v.lcp); clss.push(v.cls); el = v.lcpEl;
    } catch (e) { console.log('  !! ' + r + ' ' + String(e).slice(0, 60)); }
    await ctx.close();
  }
  if (!lcps.length) continue;
  const L = med(lcps), C = med(clss);
  const flag = (L > 2500 ? ' SLOW' : '') + (C > 0.1 ? ' JUMPY' : '');
  console.log(`${r.padEnd(20)} ${String(Math.round(L)).padStart(7)}  ${C.toFixed(3)}  ${el.trim().slice(0, 60)}${flag}`);
}
await b.close();
console.log('\nDONE');
