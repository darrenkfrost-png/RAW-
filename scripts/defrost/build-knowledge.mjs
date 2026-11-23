/**
 * THE DEFROST.WORLD KNOWLEDGE PACK.
 *
 * DEFROST.WORLD reads this repository every day and its Oracle answers
 * questions about the founders it hosts. Page titles are not enough for that —
 * it needs the words. This writes them into one standard file:
 *
 *     public/defrost/knowledge.json   (and so dist/defrost/knowledge.json)
 *
 * ⚠️ CONSENT IS THE FIRST GATE, AND IT IS THE OWNER'S. content/social-accounts.json
 * holds consent.defrostKnowledge. When it is false this still writes the file —
 * because a missing file looks like a broken build — but with an empty documents
 * list and the flag reported honestly, so DEFROST takes nothing. No other part
 * of this script can turn it on.
 *
 * ⚠️ EVERY WORD COMES FROM THE SITE. Nothing here is written by hand:
 *   · pages   → content/pages.generated.json, read out of the rendered pages by
 *               scripts/defrost/extract-pages.mjs
 *   · products→ src/data/products.ts, the same catalogue the shop renders
 *   · films   → src/data/videoArchive.ts and the platforms' own captions
 * The one sentence this script composes is "summary", and it is built from the
 * site's own counts and its own home-page heading.
 *
 * ⚠️ AND IT REFUSES TO PUBLISH A BAD PACK. Seven checks run on the output, and a
 * failure exits non-zero — which stops `npm run build`, because a pack with a
 * dead link, a customer's email address or a leaked key in it is worse than no
 * pack at all. `--selftest` plants one fault of every shape first and requires
 * all seven to fire.
 *
 * USAGE
 *   npm run knowledge            # build the pack (also runs inside npm run build)
 *   npm run knowledge:selftest   # prove the seven checks can fail
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allProducts } from '../../src/data/products.ts';
import { ARCHIVE } from '../../src/data/videoArchive.ts';
import { REAL_PATHS } from '../../src/data/navigation.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT_DIR = path.join(ROOT, 'public', 'defrost');
const OUT = path.join(OUT_DIR, 'knowledge.json');
const SELFTEST = process.argv.includes('--selftest');

const MAX_TEXT = 20_000;
const MAX_FILE = 5 * 1024 * 1024;
const OWN_SITE = 'https://rawofficial.co';

const read = async (p, fallback) => {
  try { return JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8')); } catch { return fallback; }
};

/* ── 1. CONSENT ──────────────────────────────────────────────────────────── */
const accounts = await read('content/social-accounts.json', null);
if (!accounts) {
  console.error('content/social-accounts.json is missing — without the owner\'s consent flags nothing may be published. Refusing to write a pack.');
  process.exit(1);
}
const consented = accounts?.consent?.defrostKnowledge === true;
const owner = accounts.owner || 'RAW Official';
const site = accounts.site || OWN_SITE;

/* ── 2. THE SOURCES ──────────────────────────────────────────────────────── */
const pageFile = await read('content/pages.generated.json', { pages: [] });
const captions = await read('public/transcripts/descriptions.json', {});
const sitemap = await fs.readFile(path.join(ROOT, 'public', 'sitemap.xml'), 'utf8').catch(() => '');
const sitemapPaths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
  try { return new URL(m[1]).pathname; } catch { return m[1]; }
}));

/* Which kind of thing each page is. A page not named here is a plain page —
   never guessed into something it is not. */
const KIND = {
  '/our-story': 'about', '/manifesto': 'about', '/raw-cares': 'about',
  '/terms-of-use': 'policy', '/privacy-policy': 'policy', '/logistics': 'policy',
  '/stay-safe': 'policy', '/stay-safe/feedback': 'policy',
  '/contact': 'contact',
  '/academy': 'article', '/knowledge-core': 'article', '/performance-system': 'article',
};

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
/**
 * ⚠️ TRACKING PARAMETERS ARE STRIPPED. The brief asks for no tracking links, and
 * the platforms' own captions arrive full of them — one donation link carried an
 * attribution id, a campaign tag and a timestamp. The address is kept so a
 * reader can still follow it; the tail that follows somebody around is not.
 */
const clean = (s) => String(s || '')
  .replace(/ /g, ' ')
  .replace(/(https?:\/\/[^\s<>"')]+?)[?#][^\s<>"')]*/g, '$1')
  .replace(/[ \t]+\n/g, '\n')
  .trim()
  .slice(0, MAX_TEXT);

const documents = [];

if (consented) {
  /* Pages — the site's own rendered words. */
  /* ⚠️ ONE PAGE IS LEFT OUT, AND HERE IS WHY. /account is a signed-out
     placeholder — there is no sign-in anywhere on this site — and it renders a
     dummy address, GUEST@RAWOFFICIAL.CO, where a real one would go. Publishing
     that would have the Oracle hand strangers an address nobody reads. The page
     is untouched and still public; it simply carries no content worth answering
     from. The check caught it, and this is the fix — not a loosened check. */
  const SKIP = new Set(['/account']);
  for (const pg of (pageFile.pages || []).filter((x) => !SKIP.has(x.path))) {
    const id = pg.path === '/' ? 'page-home' : `${KIND[pg.path] || 'page'}-${slug(pg.path)}`;
    documents.push({
      id,
      kind: KIND[pg.path] || 'page',
      title: pg.h1 || pg.title || pg.path,
      pagePath: pg.path,
      updatedAt: pageFile.extractedAt || null,
      text: clean(pg.text),
      facts: pg.description ? { pageDescription: pg.description } : {},
      transcriptUrl: null,
    });
  }

  /* Products — the catalogue the shop itself renders, field for field. */
  for (const p of allProducts) {
    const parts = [
      p.shortBenefit, p.overview, p.whatItDoes,
      p.keyBenefits?.length ? 'Key benefits:\n' + p.keyBenefits.map((x) => '- ' + x).join('\n') : '',
      p.whoItsFor?.length ? 'Who it is for:\n' + p.whoItsFor.map((x) => '- ' + x).join('\n') : '',
      p.suggestedUse ? 'Suggested use: ' + p.suggestedUse : '',
      p.qualityNotes?.length ? 'Quality:\n' + p.qualityNotes.map((x) => '- ' + x).join('\n') : '',
      p.protocolPairings?.length ? 'Pairs with:\n' + p.protocolPairings.map((x) => '- ' + x).join('\n') : '',
      p.responsibleUse,
    ].filter(Boolean);
    documents.push({
      id: `product-${p.id}-${slug(p.name)}`,
      kind: 'product',
      title: p.name,
      pagePath: `/product/${p.id}`,
      updatedAt: null,
      text: clean(parts.join('\n\n')),
      facts: {
        price: p.price,
        category: p.category,
        availability: p.stockStatus,
        buyUrl: OWN_SITE,
      },
      transcriptUrl: null,
    });
  }

  /* Films — one short entry each, with the platform's own caption. The
     transcripts are not duplicated here; each entry points at its own. */
  for (const v of ARCHIVE) {
    const caption = clean(captions[v.id] || '').slice(0, 2000);
    const mins = Math.round(v.duration / 60);
    const line = v.duration >= 90 ? `${mins} minute film` : `${v.duration} second clip`;
    documents.push({
      id: `film-${v.id}`,
      kind: 'post',
      title: v.title,
      pagePath: `/watch/${v.id}`,
      updatedAt: v.published,
      text: clean([v.title, caption].filter(Boolean).join('\n\n')) || v.title,
      facts: {
        platform: v.platform,
        duration: line,
        published: v.published || undefined,
        watchUrl: v.url,
        series: v.series || undefined,
      },
      transcriptUrl: v.transcript ? `/transcripts/${v.id}.json` : null,
    });
  }
}

/* The one composed sentence, built from the site's own counts and heading. */
const home = (pageFile.pages || []).find((p) => p.path === '/');
const summary = consented
  ? [
      `${owner} runs RAW Official, a performance and recovery brand.`,
      home?.h1 ? `Its home page opens with "${home.h1.replace(/"/g, "'")}".` : '',
      `This site shows ${allProducts.length} products across nutrients, recovery and combat, builds personal supplement protocols, and holds an archive of ${ARCHIVE.length} of the brand's own films with searchable transcripts.`,
      `Every order is placed at the brand's own shop, ${OWN_SITE} — this site never takes a payment.`,
    ].filter(Boolean).join(' ')
  : 'The owner has not given consent for DEFROST to read this site\'s content.';

const pack = {
  version: 1,
  site,
  owner,
  updatedAt: new Date().toISOString(),
  language: 'en',
  consent: { defrostKnowledge: consented },
  summary,
  documents,
};

/* ── 3. THE SEVEN CHECKS ─────────────────────────────────────────────────── */
if (SELFTEST) {
  /* ⚠️ A CHECK THAT HAS NEVER FAILED IS UNTESTED. One fault of every shape, so
     a clean run below means the checks ran rather than slept. */
  pack.documents.push(
    { id: 'planted bad id!', kind: 'page', title: 'Planted', pagePath: '/no-such-page', updatedAt: null, text: 'Write to someone@example.com or call 07700 900123. <script>alert(1)</script> api_key=AIzaSyPLANTED', facts: {}, transcriptUrl: null },
    { id: 'planted-empty', kind: 'page', title: 'Planted empty', pagePath: '/', updatedAt: null, text: '   ', facts: {}, transcriptUrl: null },
    { id: 'page-home', kind: 'page', title: 'Planted duplicate id', pagePath: '/', updatedAt: null, text: 'a duplicate id must be caught', facts: {}, transcriptUrl: null },
  );
}

const problems = [];
const seen = new Set();

/* (a) shape */
if (pack.version !== 1) problems.push('shape: version is not 1');
if (!pack.site || !pack.owner || typeof pack.summary !== 'string') problems.push('shape: site, owner or summary missing');
if (!Array.isArray(pack.documents)) problems.push('shape: documents is not a list');

const KINDS = new Set(['about', 'service', 'product', 'faq', 'article', 'policy', 'event', 'testimonial', 'contact', 'post', 'page']);
const contactText = pack.documents.filter((d) => d.kind === 'contact').map((d) => d.text).join('\n').toLowerCase();

for (const d of pack.documents) {
  const where = `${d.id || '(no id)'}`;

  /* (b) ids: the agreed character set, and stable one-per-page */
  if (!/^[A-Za-z0-9_-]+$/.test(d.id || '')) problems.push(`id: "${where}" uses characters outside letters, digits, - and _`);
  if (seen.has(d.id)) problems.push(`id: "${where}" appears twice — DEFROST could not tell the two apart`);
  seen.add(d.id);
  if (!KINDS.has(d.kind)) problems.push(`kind: "${where}" has kind "${d.kind}", which is not one of the agreed kinds`);

  /* (c) no empty document */
  if (!d.text || !d.text.trim()) problems.push(`empty: "${where}" has no text`);
  if ((d.text || '').length > MAX_TEXT) problems.push(`length: "${where}" is ${d.text.length} characters, over the ${MAX_TEXT} limit`);

  /* (d) every pagePath really exists in the static build */
  const base = (d.pagePath || '').replace(/[?#].*$/, '');
  const known = sitemapPaths.has(base)
    || REAL_PATHS.has(base)
    || (/^\/product\/(\d+)$/.test(base) && allProducts.some((p) => String(p.id) === base.split('/')[2]))
    || (/^\/watch\/[\w-]+$/.test(base) && ARCHIVE.some((v) => v.id === base.split('/')[2]));
  if (!known) problems.push(`path: "${where}" points at ${base || '(nothing)'}, which is not a page this build produces`);

  /* (e) no HTML or script in any text */
  if (/<\s*\/?\s*[a-z][\s\S]*?>/i.test(d.text || '')) problems.push(`html: "${where}" contains an HTML tag`);
  /* ⚠️ NAMED EVENT HANDLERS, NOT /on\w+=/. The loose version read
     "attribution_id=" inside a real donation link as an onclick handler and
     refused to publish a healthy pack. A check that fails honest content is a
     check someone switches off, and then it guards nothing. */
  if (/<\s*script|javascript:|\son(?:click|load|error|mouseover|mouseout|focus|blur|submit|change|keydown|keyup|input)\s*=/i.test(d.text || '')) problems.push(`script: "${where}" contains script`);

  /* (f) no personal data that is not already on the public contact page */
  const emails = (d.text || '').match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/g) || [];
  const phones = (d.text || '').match(/(?:\+\d[\d\s().-]{7,}\d|\b0\d[\d\s().-]{8,}\d)/g) || [];
  for (const e of emails) if (d.kind !== 'contact' && !contactText.includes(e.toLowerCase())) problems.push(`personal data: "${where}" holds the email address ${e}, which is not shown on the public contact page`);
  for (const t of phones) if (d.kind !== 'contact' && !contactText.includes(t.toLowerCase().trim())) problems.push(`personal data: "${where}" holds what looks like a telephone number (${t.trim()}), which is not shown on the public contact page`);

  /* (g) no secrets, ever */
  for (const needle of [/\btoken\s*[:=]/i, /\bsecret\s*[:=]/i, /\bapi[_-]?key\s*[:=]/i, /\bkey=/i, /\bBearer\s+[\w-]{10}/i, /\bAIza[\w-]{10}/, /\bsk-[A-Za-z0-9]{10}/, /\bEAAG[\w]{10}/]) {
    if (needle.test(d.text || '')) { problems.push(`secret: "${where}" matches ${needle} — refusing to publish`); break; }
  }
}

const body = JSON.stringify(pack, null, 2) + '\n';
if (Buffer.byteLength(body) > MAX_FILE) problems.push(`size: the pack is ${(Buffer.byteLength(body) / 1048576).toFixed(1)}MB, over the 5MB limit — split it into parts`);
try { JSON.parse(body); } catch (e) { problems.push('json: the output is not valid JSON — ' + e.message); }

/* ── 4. REPORT, THEN WRITE ───────────────────────────────────────────────── */
const byKind = pack.documents.reduce((m, d) => ({ ...m, [d.kind]: (m[d.kind] || 0) + 1 }), {});

if (SELFTEST) {
  const mustCatch = {
    'bad id characters': /^id: .*outside letters/m,
    'a duplicate id': /appears twice/m,
    'an empty document': /^empty:/m,
    'a page that does not exist': /^path:/m,
    'an HTML tag': /^html:/m,
    'script in the text': /^script:/m,
    'an email address': /holds the email address/m,
    'a telephone number': /telephone number/m,
    'a leaked key': /^secret:/m,
  };
  const joined = problems.join('\n');
  let missed = 0;
  for (const [what, re] of Object.entries(mustCatch)) {
    const ok = re.test(joined);
    if (!ok) missed++;
    console.log(`  ${ok ? 'caught' : 'MISSED'}  ${what}`);
  }
  console.log(missed
    ? `\nSELF-TEST FAILED: ${missed} planted fault(s) went unnoticed — these checks cannot be trusted.`
    : '\nSELF-TEST PASSED: every planted fault was caught. Nothing was written.');
  process.exit(missed ? 1 : 0);
}

if (problems.length) {
  console.error(`DEFROST knowledge pack NOT written — ${problems.length} problem(s):`);
  for (const p of problems.slice(0, 20)) console.error('  · ' + p);
  if (problems.length > 20) console.error(`  · …and ${problems.length - 20} more`);
  console.error('\nFix these and build again. Nothing was published.');
  process.exit(1);
}

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(OUT, body, 'utf8');

const words = pack.documents.reduce((n, d) => n + d.text.split(/\s+/).length, 0);
console.log(`DEFROST knowledge pack: ${pack.documents.length} documents, ${words.toLocaleString()} words, ${(Buffer.byteLength(body) / 1024).toFixed(0)}KB`);
console.log(`  consent.defrostKnowledge = ${consented}${consented ? '' : ' — pack written EMPTY on purpose'}`);
if (consented) console.log('  ' + Object.entries(byKind).map(([k, n]) => `${n} ${k}`).join(', '));
if (consented && !(pageFile.pages || []).length) console.log('  ⚠️ content/pages.generated.json is missing or empty — page text is NOT in this pack. Run: npm run knowledge:extract');
