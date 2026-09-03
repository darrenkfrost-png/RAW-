import fs from 'fs/promises';
import path from 'path';

async function walk(dir) {
  let files = await fs.readdir(dir);
  for (let file of files) {
    let p = path.join(dir, file);
    let stat = await fs.stat(p);
    if (stat.isDirectory()) {
      await walk(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.css')) {
      let content = await fs.readFile(p, 'utf8');
      let o = content;

      o = o.replace(/\bborder-white\/[0-9]+\b/g, 'border-editorial-text/20');
      o = o.replace(/\bbg-white\/10\b/g, 'bg-editorial-text/5');
      o = o.replace(/\bbg-white\/20\b/g, 'bg-editorial-text/10');
      o = o.replace(/\btext-white\b/g, 'text-editorial-text');
      o = o.replace(/\bbg-black\/40\b/g, 'bg-editorial-surface/80');
      o = o.replace(/\bbg-\[#080808\]\b/g, 'bg-editorial-surface');
      o = o.replace(/\bbg-transparent\b/g, 'bg-transparent'); // keep

      if (o !== content) {
        await fs.writeFile(p, o, 'utf8');
        console.log(`Updated ${p}`);
      }
    }
  }
}
walk('./src').catch(console.error);
