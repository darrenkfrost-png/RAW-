// Every product page's name, at every width that squeezes: does the longest word
// in the product's name fit the name's column? The sweeps only visit /product/29.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B = process.argv[2];
const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive})`); process.exit(1); }
const sitemap = await fetch(B + '/sitemap.xml').then((r) => r.text());
const products = [...new Set([...sitemap.matchAll(/<loc>[^<]*?(\/product\/\d+)<\/loc>/g)].map((m) => m[1]))];

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const bad = []; let checked = 0;
for (const w of [375, 768, 1024, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const route of products) {
    await p.goto(B + route, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(250);
    if (checked === 0) { await p.keyboard.press('Enter').catch(() => {}); await p.waitForTimeout(600); }
    await p.waitForTimeout(1900); // the name animates in over ~2s
    const r = await p.evaluate(() => {
      const h = document.querySelector('main h1'); if (!h) return null;
      const cs = getComputedStyle(h), col = h.getBoundingClientRect().width;
      const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT); let txt = '';
      for (let t = tw.nextNode(); t; t = tw.nextNode()) if (getComputedStyle(t.parentElement).fontSize === cs.fontSize) txt += ' ' + t.textContent;
      const pr = document.createElement('span');
      pr.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + cs.font + ';letter-spacing:' + cs.letterSpacing + ';text-transform:' + cs.textTransform;
      let worst = '', need = 0;
      for (const wd of txt.split(/[\s\-]+/).filter(Boolean)) { pr.textContent = wd; document.body.appendChild(pr); const n = pr.getBoundingClientRect().width; pr.remove(); if (n > need) { need = n; worst = wd; } }
      return { worst, need: Math.round(need), col: Math.round(col), size: Math.round(parseFloat(cs.fontSize)) };
    });
    checked++;
    if (r && r.need > r.col + 0.5) bad.push(`${w} ${route} "${r.worst}" needs ${r.need}px in ${r.col}px at ${r.size}px`);
  }
  await p.close();
}
await b.close();
console.log(`${products.length} products x 4 widths = ${checked} names checked`);
console.log(bad.length ? `${bad.length} DO NOT FIT:\n  ` + bad.join('\n  ') : 'EVERY PRODUCT NAME FITS');
