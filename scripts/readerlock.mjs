/**
 * ⚠️ RETIRED 2026-11-22, AND NOT DELETED, FOR ONE REASON.
 *
 * This probe proved the ebook paywall in a real browser by walking to page 11
 * of a book and checking that no premium text reached the page source. The only
 * door to that reader was /defrost — the "DeFrost OS" desktop — and that page
 * was removed at the founder's instruction (it belongs to a different brand).
 *
 * With no page mounting the reader there is nothing for this to walk, so it is
 * out of package.json rather than left in place quietly passing: a probe whose
 * subject no longer exists reports a clean sheet for a thing it never looked at,
 * which is the exact failure mode scripts here are written to avoid.
 *
 * The reader itself (src/components/LivingBookEngine.tsx, src/lib/bookPreview.ts
 * and src/data/books.ts) is still in the repository, untouched. Give it a page
 * again and this probe works as written — nothing below needs changing.
 */
import { createRequire } from 'node:module';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright-core');

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const MARKER = 'SECRET CONTENT';

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });

let failures = 0;
const check = (ok, name, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n        ${detail}` : ''}`);
  if (!ok) failures++;
};

console.log(`\nreader paywall on ${BASE}\n`);

await p.goto(BASE + '/defrost', { waitUntil: 'load' });
await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
await p.reload({ waitUntil: 'load' });
await p.waitForTimeout(2500);

/* ⚠️ REACHABILITY IS PART OF THE TEST, NOT A PRECONDITION OF IT. If the dock
   button cannot be clicked, that is the finding — not a reason to skip. This
   probe exists because that is exactly what happened and nothing reported it. */
const dock = p.locator('[aria-label="Open Living Books Manager"]');
let opened = false;
try {
  await dock.click({ timeout: 8000 });
  await p.waitForTimeout(1800);
  opened = await p.evaluate(() => /BOOKSTORE|public preview/i.test(document.body.innerText));
} catch (e) {
  check(false, 'the reader can be opened from the desktop', `clicking the dock button failed: ${String(e.message).split('\n')[0]}`);
}
if (opened) check(true, 'the reader can be opened from the desktop');
else if (failures === 0) check(false, 'the reader can be opened from the desktop', 'the click landed but no bookstore appeared');

if (failures === 0) {
  await p.locator('button', { hasText: 'OPEN MANUAL' }).first().click();
  await p.waitForTimeout(1800);

  const read = () => p.evaluate((marker) => {
    const text = document.body.innerText;
    return {
      page: Number((text.match(/PAGE (\d+)/) || [])[1]) || 0,
      publicBadge: /PUBLIC_ACCESS/.test(text),
      restricted: /RESTRICTED/i.test(text),
      inText: (text.match(new RegExp(marker, 'g')) || []).length,
      inSource: (document.body.innerHTML.match(new RegExp(marker, 'g')) || []).length,
    };
  }, MARKER);

  const first = await read();
  check(first.page === 1 && first.publicBadge && first.inSource === 0,
    'page 1 reads as public, with no premium text in the source', JSON.stringify(first));

  // Walk forward until the paywall, or run out of patience and say so.
  let at = first, steps = 0;
  while (at.page < 11 && steps < 16) {
    const moved = await p.evaluate(() => {
      const next = [...document.querySelectorAll('button')].find((x) =>
        /next/i.test((x.getAttribute('aria-label') || '') + (x.title || '')) && !x.disabled);
      if (next) { next.click(); return true; }
      return false;
    });
    if (!moved) break;
    await p.waitForTimeout(300);
    at = await read();
    steps++;
  }

  check(at.page === 11, 'a visitor can walk to page 11', `stopped at page ${at.page} after ${steps} step(s)`);
  if (at.page === 11) {
    check(at.restricted, 'page 11 shows the lock screen', JSON.stringify(at));
    check(!at.publicBadge, 'page 11 does not claim public access');
    check(at.inSource === 0, 'no premium text is anywhere in the page source',
      at.inSource ? `"${MARKER}" appears ${at.inSource} time(s) in innerHTML — hidden is not absent` : '');
  }
}

await b.close();
console.log(`\n${failures ? `${failures} FAILED — the reader's paywall is not holding` : 'the reader holds the paywall in the browser'}\n`);
process.exit(failures ? 1 : 0);
