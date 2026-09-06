// For every heading using the fitted sizes: does its LONGEST WORD clear the
// column, at every width? The earlier probe only checked the coloured span and
// missed "UNFILTERED" sitting above "AMBITION" in the same heading.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B=process.argv[2];
const ROUTES=['/','/shop','/product/29','/combat','/recovery','/nutrients','/protocol-stacks','/compare','/knowledge-core','/academy','/our-story','/raw-cares','/logistics','/performance-system','/contact','/manifesto','/showcase'];
const PROBE=()=>{
  const out=[];
  for(const e of document.querySelectorAll('.display-fit, .title-fit-lg, .title-fit-md, .title-fit-sm')){
    const cs=getComputedStyle(e); const size=parseFloat(cs.fontSize);
    const col=e.getBoundingClientRect().width;
    if(col<4) continue;
    const words=(e.innerText||e.textContent||'').split(/\s+/).filter(Boolean);
    if(!words.length) continue;
    const probe=document.createElement('span');
    probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font:'+cs.font+';letter-spacing:'+cs.letterSpacing+';text-transform:none';
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
