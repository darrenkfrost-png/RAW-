/**
 * HOW MUCH OF EACH FILM THE VISITOR ACTUALLY SEES.
 *
 * object-cover fills the box and throws away whatever does not fit. That is
 * invisible in code review — the markup looks identical whether the source is
 * square, tall or wide — so this asks the browser: what are the film's real
 * pixels, what shape is the box, and what fraction of the picture survives.
 *
 * It reads videoWidth/videoHeight (the decoded frame), not the file name, so a
 * film swapped for a different crop is caught the next time this runs.
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
  : ['/', '/combat', '/recovery', '/nutrients', '/showcase', '/our-story', '/stay-safe', '/watch'];
const FLOOR = 0.80; // keep at least 80% of the frame, or say so

const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();

const read = async (route) => {
  await p.goto(BASE + route, { waitUntil: 'load' });
  await p.evaluate(() => sessionStorage.setItem('raw_intro_seen', '1'));
  await p.reload({ waitUntil: 'load' });
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 450) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 220)); }
    scrollTo(0, 0);
  });
  await p.waitForTimeout(4000);
  return p.evaluate(() => [...document.querySelectorAll('video')].map((v) => {
    const box = v.getBoundingClientRect();
    const cs = getComputedStyle(v);
    const vw = v.videoWidth, vh = v.videoHeight;
    if (!vw || !vh || !box.width || !box.height) return { src: (v.currentSrc || v.src || '').split('/').pop().slice(0, 40), vw, vh, skip: true };
    /* WHICH FILMS THIS JUDGES, AND WHY THAT RULE AND NOT ANOTHER.
       A film that fills a section behind a headline at 30% opacity is a wash:
       it is SUPPOSED to be cropped to the viewport, exactly like the
       wallpaper, and complaining about it is noise. A film in a frame someone
       chose the shape of is content, and cropping that is a defect.
       The signal is the frame itself: content sits in a box with an explicit
       aspect-ratio (aspect-video, aspect-square, or a style set from the
       film's own dimensions). A background wash never has one — it just
       stretches to whatever its section happens to be.
       Two earlier rules were wrong and are recorded so they are not retried:
       position:fixed alone missed every full-bleed hero, and an aria-hidden
       ancestor hid the home hero and all three protocol reels — the very
       films this exists to judge. */
    let framed = getComputedStyle(v).aspectRatio !== 'auto';
    for (let a = v.parentElement, d = 0; a && d < 3 && !framed; a = a.parentElement, d++) {
      if (getComputedStyle(a).aspectRatio !== 'auto') framed = true;
    }
    /* A blurred or fixed copy is a backdrop, whatever shape its box is:
       the Recovery band fills itself with a blurred copy of its own upright
       clip so the sharp copy can be shown whole. Nobody blurs content. */
    const wash = !framed || /blur\(/.test(cs.filter || '') || cs.position === 'fixed';
    const srcAR = vw / vh, boxAR = box.width / box.height;
    const fit = cs.objectFit || 'fill';
    // object-cover keeps the box's aspect out of the source's centre
    const visible = fit === 'cover' ? Math.min(srcAR / boxAR, boxAR / srcAR) : 1;
    return {
      src: (v.currentSrc || v.src || '').split('/').pop().slice(0, 40),
      vw, vh, fit,
      box: `${Math.round(box.width)}x${Math.round(box.height)}`,
      visible: Math.round(visible * 100), wash,
    };
  }));
};

let bad = 0, seen = 0;
const washed = [];
const undecoded = [];
for (const r of ROUTES) {
  for (const v of await read(r)) {
    /* ⚠️ A FILM THAT HAS NOT DECODED IS NOT A FILM THAT IS FINE.
       videoWidth is 0 until the browser has the first frame, and an earlier
       version of this script treated that as "nothing to judge" and moved on
       — which is how the combat reel, a 720x720 film in a 16:9 box, was
       reported clean. Undecoded films are counted and named, so a quiet pass
       can never be mistaken for a clean one. */
    if (v.skip) { undecoded.push(`${r} ${v.src || '(no src)'}`); continue; }
    if (v.wash) { washed.push(`${r} ${v.vw}x${v.vh} ${v.src}`); continue; }
    seen++;
    const cut = v.visible < FLOOR * 100;
    if (cut) bad++;
    console.log(`${cut ? 'XX' : '  '} ${r.padEnd(16)} ${String(v.vw) + 'x' + String(v.vh)} source → ${v.box} box (${v.fit})  shows ${v.visible}%  ${v.src}`);
  }
}
await b.close();
if (undecoded.length) {
  console.log(`
— NEVER DECODED, so never judged (${undecoded.length}) — re-run or raise the settle time:`);
  undecoded.forEach((u) => console.log('   ' + u));
}
console.log(`
— treated as background wash, not judged (${washed.length}):`);
washed.forEach((w) => console.log('   ' + w));
console.log(bad ? `\n${bad} of ${seen} films are cropped below ${FLOOR * 100}%` : `\nall ${seen} films keep at least ${FLOOR * 100}% of the frame`);
process.exit(bad || undecoded.length ? 1 : 0);
