import fs from 'fs/promises';
import path from 'path';

async function walk(dir) {
  let files = await fs.readdir(dir);
  for (let file of files) {
    let p = path.join(dir, file);
    let stat = await fs.stat(p);
    if (stat.isDirectory()) {
      await walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = await fs.readFile(p, 'utf8');
      
      let o = content;
      // Change bg-white to bg-editorial-text and text-black to text-editorial-bg
      o = o.replace(/\bbg-white\b/g, 'bg-editorial-text');
      o = o.replace(/\btext-black\b/g, 'text-editorial-bg');

      // We should also replace text-zinc-* that are currently light? I already did that.
      
      // Let's also lighten up some super heavy box shadows
      o = o.replace(/rgba\(0,0,0,0.8\)/g, 'rgba(0,0,0,0.1)');
      o = o.replace(/rgba\(0,0,0,0.9\)/g, 'rgba(0,0,0,0.15)');
      o = o.replace(/rgba\(0,0,0,0.5\)/g, 'rgba(0,0,0,0.08)');
      o = o.replace(/rgba\(0,0,0,0.6\)/g, 'rgba(0,0,0,0.08)');
      
      if (o !== content) {
        await fs.writeFile(p, o, 'utf8');
        console.log(`Updated ${p}`);
      }
    }
  }
}
walk('./src').catch(console.error);
