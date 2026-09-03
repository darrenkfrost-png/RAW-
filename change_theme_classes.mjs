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
      // Text color mapping
      o = o.replace(/\btext-white\b/g, 'text-editorial-text');
      o = o.replace(/\btext-zinc-100\b/g, 'text-editorial-text');
      o = o.replace(/\btext-zinc-200\b/g, 'text-editorial-text');
      o = o.replace(/\btext-zinc-300\b/g, 'text-editorial-text');
      o = o.replace(/\btext-zinc-400\b/g, 'text-editorial-text-muted');
      o = o.replace(/\btext-zinc-500\b/g, 'text-editorial-text-muted');
      o = o.replace(/\btext-red-50\b/g, 'text-editorial-text');
      
      // Border color mapping
      o = o.replace(/\bborder-white\/5\b/g, 'border-editorial-border');
      o = o.replace(/\bborder-white\/10\b/g, 'border-editorial-border-light');
      o = o.replace(/\bborder-white\/20\b/g, 'border-editorial-border-light');
      o = o.replace(/\bborder-zinc-900\b/g, 'border-editorial-border');
      o = o.replace(/\bborder-zinc-800\b/g, 'border-editorial-border');

      // Gradients
      o = o.replace(/\bfrom-black\b/g, 'from-transparent');
      o = o.replace(/\bfrom-zinc-950\b/g, 'from-editorial-bg');
      o = o.replace(/\bfrom-zinc-900\b/g, 'from-editorial-bg');
      o = o.replace(/\bvia-black\b/g, 'via-editorial-bg');
      o = o.replace(/\bto-black\b/g, 'to-editorial-bg');
      
      // Black background
      o = o.replace(/\bbg-black\b/g, 'bg-editorial-bg');

      if (o !== content) {
        await fs.writeFile(p, o, 'utf8');
        console.log(`Updated ${p}`);
      }
    }
  }
}
walk('./src').catch(console.error);
