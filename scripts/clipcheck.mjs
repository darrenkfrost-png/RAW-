// WHERE IS TEXT BEING CUT OFF BY ITS OWN BOX?
// An element whose content is wider than its box AND which hides the overflow
// is showing the visitor a truncated word with no ellipsis and no way to know.
// Deliberate one-line truncation (text-overflow: ellipsis, line-clamp) is not a
// fault, so both are excluded.
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/darre/OneDrive/Desktop/RAW/package.json');
const { chromium } = require('playwright-core');
const B=process.argv[2];
const ROUTES=['/','/shop','/product/29','/combat','/recovery','/nutrients','/protocol-stacks','/protocol-builder','/compare','/knowledge-core','/academy','/our-story','/raw-cares','/logistics','/performance-system','/contact','/manifesto','/showcase','/checkout'];
const PROBE=()=>{
  const out=[];
  for(const e of document.querySelectorAll('button, a, h1, h2, h3, h4, span, div, p, li')){
    const cs=getComputedStyle(e);
    if(cs.display==='none'||cs.visibility==='hidden'||parseFloat(cs.opacity)<0.15) continue;
    if(cs.overflowX!=='hidden'&&cs.overflow!=='hidden') continue;
    if(cs.textOverflow==='ellipsis') continue;
    if(cs.webkitLineClamp&&cs.webkitLineClamp!=='none') continue;
    const txt=(e.textContent||'').trim();
    if(txt.length<4||txt.length>120) continue;
    // only elements whose children are text, so we are measuring the label itself
    if([...e.childNodes].some(n=>n.nodeType===1)) continue;
    if(e.scrollWidth>e.clientWidth+2 && e.clientWidth>10)
      out.push({t:txt.slice(0,42), tag:e.tagName.toLowerCase(), over:e.scrollWidth-e.clientWidth, box:e.clientWidth});
  }
  return out;
};
const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
let n=0; const seen=new Set();
for(const w of [1440,1280,1024,768,375]){
  const ctx=await b.newContext({viewport:{width:w,height:900},isMobile:w<768,hasTouch:w<768});
  const p=await ctx.newPage();
  for(const r of ROUTES){
    try{
      await p.goto(B+r,{waitUntil:'load',timeout:30000});await p.waitForTimeout(600);
      await p.keyboard.press('Enter').catch(()=>{});await p.waitForTimeout(900);
      await p.evaluate(async()=>{const s=innerHeight*0.8;for(let y=0;y<document.body.scrollHeight;y+=s){scrollTo(0,y);await new Promise(x=>setTimeout(x,60));}scrollTo(0,0);});
      await p.waitForTimeout(400);
      for(const h of await p.evaluate(PROBE)){
        const k=r+'|'+h.t; if(seen.has(k)) continue; seen.add(k); n++;
        console.log(`${w} ${r} <${h.tag}> "${h.t}" cut by ${h.over}px in ${h.box}px`);
      }
    }catch{}
  }
  await ctx.close();
}
await b.close();
console.log(n?`\n${n} places where text is cut off`:'\nno text is cut off by its own box');
