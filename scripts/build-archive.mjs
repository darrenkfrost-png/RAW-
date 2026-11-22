/**
 * BUILD-ARCHIVE — turns the raw social harvest into the site's video archive.
 *
 * WHAT THIS READS. A harvest folder produced by yt-dlp (see HARVEST.md), which
 * holds one `<id>.info.json` per post and, for YouTube, one `<id>.<lang>.vtt`
 * caption file per video. Nothing here contacts a platform; the harvest is a
 * separate, deliberate step so a build can never depend on YouTube being up.
 *
 * WHAT THIS WRITES.
 *   src/data/videoArchive.ts        metadata only — small enough to bundle
 *   public/transcripts/<id>.json    one transcript per video, timed, lazy-loaded
 *   public/transcripts/search.json  flat text of every transcript, for search
 *
 * ⚠️ TRANSCRIPTS ARE NOT BUNDLED. 68 transcripts is megabytes of text that
 * almost nobody opens. They are static files fetched when a visitor opens that
 * film or runs a search, so the first page of the site stays the weight it was.
 *
 * ⚠️ NOTHING HERE IS WRITTEN COPY. Every title, caption, date, duration and
 * line of transcript is the platform's own. A video with no caption track is
 * marked `transcript: false` and says so on the page — it is never given an
 * invented summary, because a plausible fake is the one error nobody catches.
 *
 * ⚠️ TIKTOK THUMBNAILS ARE DOWNLOADED, NEVER HOTLINKED. Their CDN URLs are
 * signed and expire within days, so a wall built on them looks perfect on the
 * day it ships and is a grid of broken frames a fortnight later. YouTube's
 * i.ytimg.com thumbnails are stable and intended to be linked, so those stay
 * remote and cost this repository nothing.
 *
 * Run:  node scripts/build-archive.mjs [harvestDir]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HARVEST = process.argv[2] || 'C:/RAW-HARVEST';
const OUT_TS = path.join(ROOT, 'src', 'data', 'videoArchive.ts');
const OUT_DIR = path.join(ROOT, 'public', 'transcripts');
const TT_THUMBS = path.join(ROOT, 'public', 'showcase', 'tiktok');

const read = async (p) => JSON.parse(await fs.readFile(p, 'utf8'));
const exists = async (p) => !!(await fs.stat(p).catch(() => null));

/* ------------------------------------------------------------------ *
 * VTT → timed cues
 *
 * ⚠️ YOUTUBE'S AUTO-CAPTIONS ARE A ROLLING TELEPROMPTER, NOT A TRANSCRIPT.
 * Each cue repeats the tail of the one before it and carries per-word
 * <00:00:01.240><c>timing</c> tags, so a naive parse produces text that says
 * everything two or three times. Strip the inline tags, then keep a line only
 * when it is not already the end of what has been kept.
 * ------------------------------------------------------------------ */
const TIME = /^(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/;
const secs = (h, m, s, ms) => +h * 3600 + +m * 60 + +s + +ms / 1000;

function parseVtt(text) {
  const lines = text.replace(/\r/g, '').split('\n');
  const cues = [];
  let start = null, end = null, buf = [];

  const flush = () => {
    if (start === null) return;
    const body = buf
      .join(' ')
      .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')   // per-word timing marks
      .replace(/<\/?c[^>]*>/g, '')                   // the <c> spans around them
      .replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (body) cues.push({ t: Math.round(start * 10) / 10, d: Math.round((end - start) * 10) / 10, s: body });
    start = null; end = null; buf = [];
  };

  for (const line of lines) {
    const m = TIME.exec(line.trim());
    if (m) {
      flush();
      start = secs(m[1], m[2], m[3], m[4]);
      end = secs(m[5], m[6], m[7], m[8]);
      continue;
    }
    if (/^(WEBVTT|Kind:|Language:|NOTE\b|STYLE\b)/.test(line.trim())) continue;
    if (start !== null) buf.push(line);
  }
  flush();

  /* ⚠️ DE-ROLL BY WORDS, NOT BY CHARACTERS. A character-overlap test needs a
     minimum length to avoid trimming on a coincidence, and that floor is
     exactly where the real repeats live: "pain" followed by "pain and
     suffering" left the word "pain" in twice, because a four-character
     overlap was below any safe floor. Whole words have no such problem —
     one repeated word is still a repeat. */
  const kept = [];
  let tailWords = [];
  const norm = (w) => w.toLowerCase().replace(/[^\w']/g, '');
  for (const c of cues) {
    /* ⚠️ STRIP `>>` BEFORE COMPARING, NOT AFTER. It is YouTube's caption mark
       for "a different person is speaking now" — meaningless on a page that
       shows one line per cue. Removing it after the overlap test instead of
       before it broke the de-roll outright: the comparison saw text the kept
       line no longer contained, so every rolling cue came through and a
       428-line transcript became 529 lines of "Hi Titch. Hi Titch. Hi Titch."
       Measured, not reasoned about. */
    const s = c.s.replace(/>>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!s) continue;
    const words = s.split(/\s+/);
    let overlap = 0;
    for (let n = Math.min(words.length, tailWords.length, 20); n > 0; n--) {
      const a = tailWords.slice(-n).map(norm).join(' ');
      const b = words.slice(0, n).map(norm).join(' ');
      if (a && a === b) { overlap = n; break; }
    }
    const fresh = words.slice(overlap).join(' ').trim();
    if (!fresh) continue;
    kept.push({ t: c.t, d: c.d, s: fresh });
    tailWords = tailWords.concat(fresh.split(/\s+/)).slice(-40);
  }
  return kept;
}

/* ------------------------------------------------------------------ *
 * Series — derived from the real titles, never invented.
 * A video that matches nothing is simply left unsorted rather than
 * pushed into the nearest-looking shelf.
 * ------------------------------------------------------------------ */
const SERIES = [
  { id: 'combat', label: 'RAW Combat', test: /raw combat|stand\s*&\s*bang|stand and bang|full fight|\bvs\.?\b/i },
  { id: 'podcast', label: 'The RAW Podcast', test: /podcast/i },
  { id: 'rise', label: 'The Rise of RAW', test: /rise of raw/i },
  { id: 'recovery', label: 'Recovery & Nutrition', test: /recovery|nutrient|honey|ice bath|hydrat|sleep/i },
  { id: 'behind', label: 'Behind the Scenes', test: /behind|vlog|day in|backstage|build/i },
];
const seriesOf = (title) => SERIES.find((s) => s.test.test(title))?.id ?? null;

/* ------------------------------------------------------------------ */
async function main() {
  const items = [];
  const transcripts = [];
  const notes = [];

  /* ---------------- YouTube ---------------- */
  const ytDir = path.join(HARVEST, 'yt');
  const ytFiles = (await fs.readdir(ytDir).catch(() => [])).filter((f) => f.endsWith('.info.json'));
  for (const f of ytFiles) {
    const d = await read(path.join(ytDir, f));
    const id = d.id;

    /* Prefer a human-written caption track over the machine one; prefer the
       original language over YouTube's own translation of it. */
    let vtt = null;
    for (const cand of [`${id}.en.vtt`, `${id}.en-orig.vtt`, `${id}.en-GB.vtt`, `${id}.en-US.vtt`]) {
      if (await exists(path.join(ytDir, cand))) { vtt = cand; break; }
    }
    let cues = [];
    if (vtt) {
      cues = parseVtt(await fs.readFile(path.join(ytDir, vtt), 'utf8'));
      if (cues.length) transcripts.push({ id: `yt-${id}`, cues });
    }

    items.push({
      id: `yt-${id}`,
      platform: 'youtube',
      videoId: id,
      title: d.title,
      description: (d.description || '').trim(),
      author: d.channel || d.uploader || 'RAW Official Co.',
      duration: Math.round(d.duration || 0),
      published: d.upload_date ? `${d.upload_date.slice(0, 4)}-${d.upload_date.slice(4, 6)}-${d.upload_date.slice(6, 8)}` : null,
      views: d.view_count ?? null,
      thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      vertical: (d.width || 16) < (d.height || 9),
      series: seriesOf(d.title || ''),
      transcript: cues.length > 0,
      words: cues.reduce((n, c) => n + c.s.split(/\s+/).length, 0),
      url: `https://www.youtube.com/watch?v=${id}`,
    });
  }

  /* ---------------- TikTok ---------------- */
  const ttDir = path.join(HARVEST, 'tt');
  const ttFiles = (await fs.readdir(ttDir).catch(() => [])).filter((f) => f.endsWith('.info.json'));
  await fs.mkdir(TT_THUMBS, { recursive: true });
  for (const f of ttFiles) {
    const d = await read(path.join(ttDir, f));
    const id = d.id;

    /* download the thumbnail — see the note at the top of this file */
    let thumb = null;
    const local = path.join(TT_THUMBS, `${id}.jpg`);
    if (await exists(local)) {
      thumb = `/showcase/tiktok/${id}.jpg`;
    } else if (d.thumbnail) {
      try {
        const res = await fetch(d.thumbnail);
        if (res.ok) {
          await fs.writeFile(local, Buffer.from(await res.arrayBuffer()));
          thumb = `/showcase/tiktok/${id}.jpg`;
        } else notes.push(`tiktok ${id}: thumbnail ${res.status}`);
      } catch (e) { notes.push(`tiktok ${id}: thumbnail failed (${e.message})`); }
    }

    const caption = (d.title || d.description || '').trim();
    items.push({
      id: `tt-${id}`,
      platform: 'tiktok',
      videoId: id,
      title: caption || '(no caption)',
      description: (d.description || '').trim(),
      author: d.uploader || 'raw_official_co',
      duration: Math.round(d.duration || 0),
      published: d.upload_date ? `${d.upload_date.slice(0, 4)}-${d.upload_date.slice(4, 6)}-${d.upload_date.slice(6, 8)}` : null,
      views: d.view_count ?? null,
      thumb,
      vertical: true,
      series: seriesOf(caption),
      /* ⚠️ TikTok does not publish a caption track. Marked false and shown as
         "no transcript" on the page — never filled in with a guess. */
      transcript: false,
      words: 0,
      url: d.webpage_url || `https://www.tiktok.com/@raw_official_co/video/${id}`,
    });
  }

  if (!items.length) {
    console.error(`no posts found under ${HARVEST} — refusing to overwrite the archive with nothing`);
    process.exit(2);
  }

  /* newest first; undated last rather than first */
  items.sort((a, b) => (b.published || '0').localeCompare(a.published || '0'));

  /* ---------------- write ---------------- */
  await fs.mkdir(OUT_DIR, { recursive: true });
  for (const t of transcripts) {
    await fs.writeFile(path.join(OUT_DIR, `${t.id}.json`), JSON.stringify(t.cues));
  }
  /* the searchable text of a film = its description plus everything said in
     it, so one search covers both without either being in the bundle */
  const searchable = {};
  for (const i of items) {
    const spoken = transcripts.find((t) => t.id === i.id);
    const text = [i.description, spoken ? spoken.cues.map((c) => c.s).join(' ') : ''].filter(Boolean).join(' — ');
    if (text) searchable[i.id] = text;
  }
  await fs.writeFile(path.join(OUT_DIR, 'search.json'), JSON.stringify(searchable));

  /* ⚠️ DESCRIPTIONS ARE NOT BUNDLED EITHER. Measured: 50.1 KB of the 100.9 KB
     of archive data was video descriptions — half the weight, carried by every
     visitor to the site, for text that appears on one film page at a time. */
  await fs.writeFile(
    path.join(OUT_DIR, 'descriptions.json'),
    JSON.stringify(Object.fromEntries(items.filter((i) => i.description).map((i) => [i.id, i.description]))),
  );

  /* ⚠️ A MACHINE-READABLE LIST OF WHAT WAS PUBLISHED, FOR THE PROBE TO READ.
     scripts/watchcheck.mjs first pulled the film list out of the generated
     TypeScript with a regular expression, and quietly matched 115 of 116 — one
     title's punctuation did not fit the pattern, so a real page went unchecked
     while the run reported a clean sweep. A list the probe cannot misparse
     removes that whole class of silent gap. */
  await fs.writeFile(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(items.map((i) => ({ id: i.id, title: i.title, transcript: i.transcript }))),
  );

  const header = `// GENERATED by scripts/build-archive.mjs on ${new Date().toISOString().slice(0, 10)} — do not edit by hand.
// Every field below came from the platform's own data for that post. Nothing
// here is written copy: a video with no caption track is marked
// \`transcript: false\` and says so on the page rather than being given one.
// Transcripts are NOT in this file — they are lazy-loaded from
// /transcripts/<id>.json so the bundle stays the size it was.
`;

  const ts = `${header}
export interface ArchiveItem {
  id: string;
  platform: "youtube" | "tiktok";
  videoId: string;
  title: string;
  author: string;
  /** seconds */
  duration: number;
  /** YYYY-MM-DD, or null where the platform did not give one */
  published: string | null;
  views: number | null;
  thumb: string | null;
  vertical: boolean;
  series: string | null;
  /** true only when a real caption track was published for this video */
  transcript: boolean;
  /** words in that transcript, 0 when there is none */
  words: number;
  url: string;
}

/** Descriptions live in /transcripts/descriptions.json — see the generator. */
export const SERIES: { id: string; label: string }[] = ${JSON.stringify(SERIES.map(({ id, label }) => ({ id, label })), null, 2)};

export const ARCHIVE: ArchiveItem[] = [
${items.map((i) => { const { description, ...rest } = i; void description; return '  ' + JSON.stringify(rest) + ','; }).join('\n')}
];

/** Counts the page can state without recounting the list in three places. */
export const ARCHIVE_STATS = {
  total: ${items.length},
  youtube: ${items.filter((i) => i.platform === 'youtube').length},
  tiktok: ${items.filter((i) => i.platform === 'tiktok').length},
  withTranscript: ${items.filter((i) => i.transcript).length},
  transcribedWords: ${items.reduce((n, i) => n + i.words, 0)},
  runtimeSeconds: ${items.reduce((n, i) => n + i.duration, 0)},
};
`;
  await fs.writeFile(OUT_TS, ts);

  console.log(`archive: ${items.length} posts (${items.filter((i) => i.platform === 'youtube').length} youtube, ${items.filter((i) => i.platform === 'tiktok').length} tiktok)`);
  console.log(`transcripts: ${transcripts.length} written, ${items.reduce((n, i) => n + i.words, 0).toLocaleString()} words`);
  console.log(`without a caption track: ${items.filter((i) => !i.transcript).length} (shown as "no transcript", never invented)`);
  if (notes.length) console.log(`\nnotes:\n   ${notes.join('\n   ')}`);
}

main();
