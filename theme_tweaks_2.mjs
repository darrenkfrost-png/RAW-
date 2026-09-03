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

      // Replace rgba(255, 255, 255, x) with low-opacity black for shadows, glows, borders
      o = o.replace(/rgba\(255,255,255,0\.8\)/g, 'rgba(0,0,0,0.15)');
      o = o.replace(/rgba\(255,255,255,0\.6\)/g, 'rgba(0,0,0,0.1)');
      o = o.replace(/rgba\(255,255,255,0\.5\)/g, 'rgba(0,0,0,0.08)');
      o = o.replace(/rgba\(255,255,255,0\.4\)/g, 'rgba(0,0,0,0.08)');
      o = o.replace(/rgba\(255,255,255,0\.3\)/g, 'rgba(0,0,0,0.06)');
      o = o.replace(/rgba\(255,255,255,0\.2\)/g, 'rgba(0,0,0,0.05)');
      o = o.replace(/rgba\(255,255,255,0\.1\)/g, 'rgba(0,0,0,0.04)');
      o = o.replace(/rgba\(255, 255, 255, 0\.8\)/g, 'rgba(0,0,0,0.15)');
      o = o.replace(/rgba\(255, 255, 255, 0\.6\)/g, 'rgba(0,0,0,0.1)');
      o = o.replace(/rgba\(255, 255, 255, 0\.5\)/g, 'rgba(0,0,0,0.08)');
      o = o.replace(/rgba\(255, 255, 255, 0\.4\)/g, 'rgba(0,0,0,0.08)');
      o = o.replace(/rgba\(255, 255, 255, 0\.3\)/g, 'rgba(0,0,0,0.06)');
      o = o.replace(/rgba\(255, 255, 255, 0\.2\)/g, 'rgba(0,0,0,0.05)');
      o = o.replace(/rgba\(255, 255, 255, 0\.1\)/g, 'rgba(0,0,0,0.04)');
      o = o.replace(/rgba\(255,255,255,0\.05\)/g, 'rgba(0,0,0,0.03)');
      o = o.replace(/rgba\(255, 255, 255, 0\.05\)/g, 'rgba(0,0,0,0.03)');

      // If we see hover:shadow-[0_40px_100px_rgba(255,255,255,0.6)], it will now be hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] - much cleaner on light theme.

      if (o !== content) {
        await fs.writeFile(p, o, 'utf8');
        console.log(`Updated ${p}`);
      }
    }
  }
}
walk('./src').catch(console.error);
