// COPY RAW'S IMAGES OFF THE WORDPRESS SHOP (founder approved 2026-09-11).
//
// Why: rawofficial.co is still the WordPress shop. This site borrowed 63 files
// from it, so the day this site takes over that domain every product photo
// would vanish. After this, the site depends on WordPress for nothing visual.
//
// What is copied is exactly what the running site requests:
//   1. every https://rawofficial.co/wp-content/uploads/... address in src/
//   2. the -1024x1024 sibling of every catalogue image, because
//      getHighResImageUrl / webSizedImage rename files to that at runtime
//      (verified 2026-09-05 that every catalogue image has one).
//
// Downloaded with a PLAIN request — no Accept: image/webp — so we get the real
// JPEG/PNG, not the CDN's "optimised" WebP that measured up to 4x bigger.
//
// GATE: every file must arrive as 200, an image content-type, non-empty, and
// start with real PNG/JPEG/WebP/GIF magic bytes. If ANY fails, src/ is not
// touched. Usage:  node selfhost.mjs download   then   node selfhost.mjs rewrite
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/darre/OneDrive/Desktop/RAW/';
const PREFIX = 'https://rawofficial.co/wp-content/uploads/';
const LOCAL = '/media/wp/';
const DEST = ROOT + 'public/media/wp/';
const MANIFEST = ROOT + 'public/media/wp/MANIFEST.json';

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
  d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
const SRC_FILES = walk(ROOT + 'src').filter((f) => /\.(tsx?|css)$/.test(f));
const URL_RE = /https:\/\/rawofficial\.co\/wp-content\/uploads\/[^"'`\s)]+/g;

const mode = process.argv[2];

if (mode === 'download') {
  const referenced = new Set();
  for (const f of SRC_FILES) for (const m of fs.readFileSync(f, 'utf8').matchAll(URL_RE)) referenced.add(m[0]);

  // catalogue images also get renamed to -1024x1024 at runtime
  const catalogue = fs.readFileSync(ROOT + 'src/data/products.ts', 'utf8');
  const siblings = new Set();
  for (const m of catalogue.matchAll(URL_RE)) {
    const u = m[0];
    if (/-\d+x\d+\.\w+$/.test(u)) siblings.add(u.replace(/-\d+x\d+(\.\w+)$/, '-1024x1024$1'));
    else if (/-scaled\.\w+$/.test(u)) siblings.add(u.replace(/-scaled(\.\w+)$/, '-1024x1024$1'));
  }
  const all = [...new Set([...referenced, ...siblings])].sort();
  console.log(`${referenced.size} referenced + ${[...siblings].filter((s) => !referenced.has(s)).length} runtime siblings = ${all.length} files`);

  const magic = (b) => {
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
    if (b[0] === 0xff && b[1] === 0xd8) return 'jpeg';
    if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') return 'webp';
    if (b.slice(0, 3).toString() === 'GIF') return 'gif';
    return null;
  };

  const results = []; let bytes = 0; const failed = [];
  for (const u of all) {
    try {
      const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(30000) });
      const type = res.headers.get('content-type') || '';
      const buf = Buffer.from(await res.arrayBuffer());
      const kind = magic(buf);
      if (res.status !== 200 || !type.startsWith('image/') || buf.length === 0 || !kind) {
        failed.push(`${res.status} ${type} ${buf.length}B ${kind} ${u}`); continue;
      }
      const rel = u.slice(PREFIX.length);
      const out = DEST + rel;
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, buf);
      bytes += buf.length;
      results.push({ from: u, to: LOCAL + rel, bytes: buf.length, kind });
    } catch (e) { failed.push(`ERR ${String(e).slice(0, 60)} ${u}`); }
  }
  fs.mkdirSync(DEST, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify({ copiedOn: '2026-09-11', from: PREFIX, files: results }, null, 2));
  console.log(`downloaded ${results.length}/${all.length} — ${(bytes / 1048576).toFixed(1)} MB`);
  if (failed.length) { console.log(`FAILED ${failed.length} — src/ will NOT be rewritten:`); for (const f of failed) console.log('  ' + f); process.exit(1); }
  console.log('GATE PASSED — every file is a real image. Run: node selfhost.mjs rewrite');
}

if (mode === 'rewrite') {
  const man = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const have = new Set(man.files.map((f) => f.from));
  // refuse if any address in src/ was not downloaded
  const missing = [];
  for (const f of SRC_FILES) for (const m of fs.readFileSync(f, 'utf8').matchAll(URL_RE)) if (!have.has(m[0])) missing.push(m[0]);
  if (missing.length) { console.log('REFUSING — not downloaded:', [...new Set(missing)]); process.exit(1); }
  let n = 0;
  for (const f of SRC_FILES) {
    const s = fs.readFileSync(f, 'utf8');
    const c = s.split(PREFIX).length - 1;
    if (!c) continue;
    fs.writeFileSync(f, s.split(PREFIX).join(LOCAL));
    n += c; console.log(`  ${path.relative(ROOT, f)}: ${c}`);
  }
  console.log(`rewrote ${n} references to ${LOCAL}`);
}
