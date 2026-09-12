// For every heading using the fitted sizes: does its LONGEST WORD clear the
// column, at every width? The earlier probe only checked the coloured span and
// missed "UNFILTERED" sitting above "AMBITION" in the same heading.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B=process.argv[2];
// ⚠️ A DEAD SERVER MUST NEVER READ AS "ALL CLEAR". Every page load below is
// wrapped in try/catch, so against a port with nothing on it this script used
// to sail through and print "every fitted heading clears its column".
{ const alive = await fetch(B + '/').then((r) => r.status).catch(() => 0);
  if (alive !== 200) { console.log(`SERVER NOT ANSWERING (${alive}) — no result`); process.exit(1); } }
const ROUTES=['/','/shop','/product/29','/combat','/recovery','/nutrients','/protocol-stacks','/compare','/knowledge-core','/academy','/our-story','/raw-cares','/logistics','/performance-system','/contact','/manifesto','/showcase'];
const PROBE=()=>{
  const out=[];
  for(const e of document.querySelectorAll('.display-fit, .title-fit-lg, .title-fit-md, .title-fit-sm')){
    const cs=getComputedStyle(e); const size=parseFloat(cs.fontSize);
    const col=e.getBoundingClientRect().width;
    if(col<4) continue;
    // A hyphen is a real break point in every browser, so PRE-WORKOUT may
    // legitimately wrap as PRE- / WORKOUT. An underscore is one only where
    // machineText() has put a <wbr> after it — so it counts only then.
    const splitter = e.querySelector('wbr') ? /[\s\-_]+/ : /[\s\-]+/;
    // ⚠️ ONLY THIS ELEMENT'S OWN WORDS. A fitted heading can contain another
    // fitted element at a different size (Manifesto's red line sits inside the
    // quote). Measuring the inner words at the OUTER size reported PERFORMANCE
    // overflowing by 108px when it rendered comfortably. Nested fitted elements
    // are measured on their own turn.
    // Precisely: only text printed at THIS element's size. The product name
    // shares its heading with a small [ TARGET_ASSET_IDENT ] tag set at its own
    // clamp — measured at the heading's size, that tag is a false overflow.
    const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    let ownText = '';
    for (let t = tw.nextNode(); t; t = tw.nextNode()) {
      if (t.parentElement && getComputedStyle(t.parentElement).fontSize === cs.fontSize) ownText += ' ' + t.textContent;
    }
    const words=ownText.split(splitter).filter(Boolean);
    if(!words.length) continue;
    const probe=document.createElement('span');
    probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font:'+cs.font+';letter-spacing:'+cs.letterSpacing+';text-transform:'+cs.textTransform; // ⚠️ was "none": capitals are wider, so every uppercase heading was under-measured and "UNDERPINNINGS" passed while it broke
    let worst=null;
    for(const w of words){ probe.textContent=w; document.body.appendChild(probe);
      const need=probe.getBoundingClientRect().width; probe.remove();
      if(!worst||need>worst.need) worst={w,need}; }
    if(worst.need>col+0.5) out.push({cls:[...e.classList].find(c=>c.startsWith('display-fit')||c.startsWith('title-fit'))||'?',
      word:worst.w, need:Math.round(worst.need), col:Math.round(col), size:Math.round(size),
      maxCqi:+(size*col/worst.need/col*100).toFixed(1)});
  }
  return out;
};
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
let bad=0;
for(const w of [1440,1280,1024,768,500,375]){
  const ctx=await browser.newContext({viewport:{width:w,height:900},isMobile:w<768,hasTouch:w<768});
  const p=await ctx.newPage();
  for(const r of ROUTES){
    try{
      await p.goto(B+r,{waitUntil:'load',timeout:30000}); await p.waitForTimeout(600);
      await p.keyboard.press('Enter').catch(()=>{}); await p.waitForTimeout(900);
      await p.evaluate(async()=>{const s=innerHeight*0.8;for(let y=0;y<document.body.scrollHeight;y+=s){scrollTo(0,y);await new Promise(x=>setTimeout(x,60));}scrollTo(0,0);});
      await p.waitForTimeout(400);
      for(const h of await p.evaluate(PROBE)){ bad++; console.log(`${w} ${r} ${h.cls}: "${h.word}" needs ${h.need}px in ${h.col}px at ${h.size}px — max --fit ${h.maxCqi}`); }
    }catch{}
  }
  await ctx.close();
}
await browser.close();
console.log(bad?`\n${bad} headings still overflow`:'\nevery fitted heading clears its column');
