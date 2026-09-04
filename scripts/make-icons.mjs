/**
 * Square app icons, generated from the wordmark.
 *
 * ⚠️ WHY THIS EXISTS. index.html pointed apple-touch-icon at /favicon.png,
 * which is the 813x348 wordmark strip. iOS does not letterbox a home-screen
 * icon — it fills a square, so the mark was being stretched or cropped into a
 * smear. The manifest had the same strip listed as its icon, so an installed
 * app got it too.
 *
 * There is no image library available in this project (no sharp, no canvas,
 * no ImageMagick), so this decodes the source PNG, resamples it and re-encodes
 * by hand. The source is 8-bit palette, non-interlaced, with a tRNS chunk —
 * that is the only shape handled here, deliberately: a decoder that quietly
 * mishandled a format it did not support would produce a broken icon rather
 * than an error.
 *
 * Run: node scripts/make-icons.mjs
 */

import fs from 'node:fs';
import zlib from 'node:zlib';

const SRC = 'public/brand/raw-logo-red.png';

/** iOS masks its own rounded corners, so the mark is kept well inside the
 *  square — 76% of the width — or the corners clip it. */
const SAFE = 0.76;
const BG = [10, 10, 11]; // the site's near-black, not pure #000

// ── decode ──────────────────────────────────────────────────────────────────
function decode(buf) {
  if (buf.slice(1, 4).toString() !== 'PNG') throw new Error('not a PNG');
  let o = 8, ihdr = null, plte = null, trns = null;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.slice(o + 4, o + 8).toString();
    const data = buf.slice(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      ihdr = {
        w: data.readUInt32BE(0), h: data.readUInt32BE(4),
        depth: data[8], color: data[9], interlace: data[12],
      };
    } else if (type === 'PLTE') plte = data;
    else if (type === 'tRNS') trns = data;
    else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (!ihdr) throw new Error('no IHDR');
  if (ihdr.depth !== 8 || ihdr.color !== 3 || ihdr.interlace !== 0) {
    throw new Error(`unsupported PNG: depth ${ihdr.depth}, colorType ${ihdr.color}, interlace ${ihdr.interlace}`);
  }
  if (!plte) throw new Error('palette image with no PLTE');

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { w, h } = ihdr;
  const bpp = 1;                        // one palette index per pixel
  const stride = w * bpp;
  const px = Buffer.alloc(h * stride);  // de-filtered palette indices

  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)];
    const line = raw.slice(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const out = px.slice(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? out[x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = line[x];
      if (ft === 1) v += a;
      else if (ft === 2) v += b;
      else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) {
        const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (ft !== 0) throw new Error('bad filter type ' + ft);
      out[x] = v & 0xff;
    }
  }

  // palette indices -> straight RGBA
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const idx = px[i];
    rgba[i * 4] = plte[idx * 3];
    rgba[i * 4 + 1] = plte[idx * 3 + 1];
    rgba[i * 4 + 2] = plte[idx * 3 + 2];
    rgba[i * 4 + 3] = trns && idx < trns.length ? trns[idx] : 255;
  }
  return { w, h, rgba };
}

// ── box-filter resample, alpha-weighted ─────────────────────────────────────
// A plain average would drag the transparent background's colour into the
// edges of the mark and leave it haloed; weighting by alpha keeps the edge
// colour honest.
function resample(src, sw, sh, dw, dh) {
  const out = new Uint8ClampedArray(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    const y0 = Math.floor((y * sh) / dh), y1 = Math.max(y0 + 1, Math.floor(((y + 1) * sh) / dh));
    for (let x = 0; x < dw; x++) {
      const x0 = Math.floor((x * sw) / dw), x1 = Math.max(x0 + 1, Math.floor(((x + 1) * sw) / dw));
      let r = 0, g = 0, b = 0, a = 0, n = 0;
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const i = (sy * sw + sx) * 4, al = src[i + 3] / 255;
          r += src[i] * al; g += src[i + 1] * al; b += src[i + 2] * al;
          a += src[i + 3]; n++;
        }
      }
      const j = (y * dw + x) * 4, aw = a / 255 || 1e-6;
      out[j] = r / aw; out[j + 1] = g / aw; out[j + 2] = b / aw; out[j + 3] = a / n;
    }
  }
  return out;
}

// ── encode (24-bit RGB, no alpha — the icon is opaque by design) ────────────
function crc32(buf) {
  let c, t = [];
  for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  let crc = 0xffffffff;
  for (const byte of buf) crc = t[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encode(rgb, size) {
  const rows = [];
  for (let y = 0; y < size; y++) rows.push(Buffer.from([0]), Buffer.from(rgb.slice(y * size * 3, (y + 1) * size * 3)));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── compose ─────────────────────────────────────────────────────────────────
const src = decode(fs.readFileSync(SRC));
console.log(`source: ${SRC} ${src.w}x${src.h}`);

for (const size of [180, 192, 512]) {
  const markW = Math.round(size * SAFE);
  const markH = Math.max(1, Math.round((markW * src.h) / src.w));
  const mark = resample(src.rgba, src.w, src.h, markW, markH);

  const rgb = new Uint8ClampedArray(size * size * 3);
  for (let i = 0; i < size * size; i++) { rgb[i * 3] = BG[0]; rgb[i * 3 + 1] = BG[1]; rgb[i * 3 + 2] = BG[2]; }

  const ox = Math.round((size - markW) / 2), oy = Math.round((size - markH) / 2);
  for (let y = 0; y < markH; y++) {
    for (let x = 0; x < markW; x++) {
      const s = (y * markW + x) * 4, a = mark[s + 3] / 255;
      if (a <= 0) continue;
      const d = ((y + oy) * size + (x + ox)) * 3;
      for (let c = 0; c < 3; c++) rgb[d + c] = mark[s + c] * a + rgb[d + c] * (1 - a);
    }
  }

  const file = `public/brand/app-icon-${size}.png`;
  fs.writeFileSync(file, encode(rgb, size));
  console.log(`  wrote ${file}  (${size}x${size}, mark ${markW}x${markH}, ${Math.round(fs.statSync(file).size / 1024)}KB)`);
}
