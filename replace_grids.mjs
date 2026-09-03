import fs from 'fs/promises';
import path from 'path';

async function walk(dir) {
  let files = await fs.readdir(dir);
  for (let file of files) {
    let p = path.join(dir, file);
    let stat = await fs.stat(p);
    if (stat.isDirectory()) {
      await walk(p);
    } else if (p.endsWith('.tsx')) {
      let content = await fs.readFile(p, 'utf8');
      let o = content;

      o = o.replace(/<div className="absolute inset-0 bg-\[linear-gradient.*?pointer-events-none.*?opacity-[0-9]+.*?" \/>/g, '<Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />');
      o = o.replace(/<div className="absolute inset-0 bg-\[linear-gradient.*?opacity-[0-9]+.*?" \/>/g, '<Atmosphere glowOpacity={0.02} gridMode="lines" intensity="low" />');
      
      if (documentHasChanges(content, o)) {
        // We will need to prepend the import if Atmosphere is used but not imported
        if (!o.includes("import { Atmosphere }")) {
          o = `import { Atmosphere } from '../components/common/Atmosphere';\n` + o;
        }
        await fs.writeFile(p, o, 'utf8');
        console.log(`Updated ${p}`);
      }
    }
  }
}

function documentHasChanges(oldContent, newContent) {
  return oldContent !== newContent;
}

walk('./src/pages').catch(console.error);
