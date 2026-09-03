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

      o = o.replace(/bg-red-[456789]00(?:[^\w-]|(?:\/[0-9]+)?).*?text-editorial-text/g, match => match.replace('text-editorial-text', 'text-white'));
      o = o.replace(/text-editorial-text.*?bg-red-[456789]00/g, match => match.replace('text-editorial-text', 'text-white'));
      o = o.replace(/hover:bg-red-[456789]00(?:[^\w-]|(?:\/[0-9]+)?).*?hover:text-editorial-text/g, match => match.replace('hover:text-editorial-text', 'hover:text-white'));
      o = o.replace(/hover:text-editorial-text.*?hover:bg-red-[456789]00/g, match => match.replace('hover:text-editorial-text', 'hover:text-white'));
      o = o.replace(/group-hover(?:.*):bg-red-[456789]00(?:[^\w-]|(?:\/[0-9]+)?).*?group-hover(?:.*):text-editorial-text/g, match => match.replace(/group-hover.*?text-editorial-text/g, 'group-hover:text-white'));

      if (o !== content) {
        await fs.writeFile(p, o, 'utf8');
        console.log(`Updated ${p}`);
      }
    }
  }
}
walk('./src').catch(console.error);
