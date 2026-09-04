/**
 * Service-worker behaviour test.
 *
 * ⚠️ WHY THIS EXISTS. A service worker is the one piece of front-end code that
 * can break a site PERMANENTLY for a returning visitor: cache the wrong thing
 * and every refresh is served from the same poisoned cache, so the usual cure
 * makes no difference. It therefore must not ship on "it looks right".
 *
 * The preview browser used during development refuses to register service
 * workers at all, so it cannot be exercised there. This harness runs sw.js in
 * Node against stubbed platform globals and asserts the routing rules that
 * actually matter — above all that HTML is fetched from the network first, so a
 * new deploy can never be masked by a stale shell.
 *
 * Run: node scripts/test-sw.mjs
 */

import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('public/sw.js', 'utf8');

// ── Minimal platform stubs ────────────────────────────────────────────────
class FakeResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status ?? 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = { get: (k) => (init.headers || {})[k.toLowerCase()] ?? null };
  }
  clone() { return new FakeResponse(this.body, { status: this.status }); }
  static error() { return new FakeResponse('error', { status: 500 }); }
}

const makeCache = () => {
  const store = new Map();
  return {
    store,
    put: async (req, res) => { store.set(typeof req === 'string' ? req : req.url, res); },
    match: async (req) => store.get(typeof req === 'string' ? req : req.url),
    add: async (url) => { store.set(url, new FakeResponse('precached')); },
  };
};

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const run = async () => {
  const caches = new Map();
  const listeners = {};
  let networkCalls = [];
  let networkShouldFail = false;

  const sandbox = {
    self: {
      addEventListener: (type, fn) => { listeners[type] = fn; },
      skipWaiting: async () => {},
      clients: { claim: async () => {} },
      location: { origin: 'https://raw.test' },
    },
    caches: {
      open: async (name) => {
        if (!caches.has(name)) caches.set(name, makeCache());
        return caches.get(name);
      },
      keys: async () => [...caches.keys()],
      delete: async (k) => caches.delete(k),
      match: async (req) => {
        for (const c of caches.values()) {
          const hit = await c.match(req);
          if (hit) return hit;
        }
        return undefined;
      },
    },
    fetch: async (req) => {
      const url = typeof req === 'string' ? req : req.url;
      networkCalls.push(url);
      if (networkShouldFail) throw new Error('offline');
      return new FakeResponse('from-network:' + url);
    },
    Response: FakeResponse,
    URL,
    Promise,
    console,
  };
  sandbox.self.location = { origin: 'https://raw.test' };

  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  check('registers install, activate and fetch handlers',
    !!listeners.install && !!listeners.activate && !!listeners.fetch);

  // ── activate must delete caches from older versions ─────────────────────
  caches.set('raw-v0-shell', makeCache());
  caches.set('raw-v1-shell', makeCache());
  let activateWork;
  await listeners.activate({ waitUntil: (p) => { activateWork = p; } });
  await activateWork;
  check('activate deletes stale-version caches, keeps current',
    !caches.has('raw-v0-shell') && caches.has('raw-v1-shell'),
    [...caches.keys()].join(','));

  // ── helper to drive a fetch event ───────────────────────────────────────
  const request = async (url, opts = {}) => {
    let responded;
    const req = {
      url,
      method: opts.method || 'GET',
      mode: opts.mode || 'no-cors',
      headers: { get: (k) => (k.toLowerCase() === 'accept' ? opts.accept || '' : null) },
    };
    listeners.fetch({ request: req, respondWith: (p) => { responded = p; } });
    return responded === undefined ? 'PASSED_THROUGH' : await responded;
  };

  // 1. HTML must be network-first — the rule that prevents a stale shell.
  networkCalls = [];
  const nav = await request('https://raw.test/shop', { mode: 'navigate' });
  check('HTML navigation goes to the network first',
    networkCalls.includes('https://raw.test/shop') && String(nav.body).startsWith('from-network'),
    String(nav.body));

  // 2. ...and falls back to the cached shell only when the network is gone.
  networkShouldFail = true;
  const shell = await sandbox.caches.open('raw-v1-shell');
  await shell.put('/', new FakeResponse('cached-shell'));
  const offlineNav = await request('https://raw.test/combat', { mode: 'navigate' });
  check('offline navigation falls back to the cached shell',
    offlineNav && offlineNav.body === 'cached-shell', String(offlineNav && offlineNav.body));
  networkShouldFail = false;

  // 3. Fingerprinted assets are cache-first — safe because names are immutable.
  const assets = await sandbox.caches.open('raw-v1-assets');
  await assets.put('https://raw.test/assets/index-ABC123.js', new FakeResponse('cached-asset'));
  networkCalls = [];
  const asset = await request('https://raw.test/assets/index-ABC123.js');
  check('hashed /assets/ served from cache without touching the network',
    asset.body === 'cached-asset' && networkCalls.length === 0,
    `network calls: ${networkCalls.length}`);

  // 4. The API must never be intercepted.
  const api = await request('https://raw.test/api/gemini/analyze');
  check('/api/ requests pass straight through, never cached', api === 'PASSED_THROUGH');

  // 5. Other origins are left entirely alone.
  const cross = await request('https://www.youtube-nocookie.com/embed/x');
  check('cross-origin requests pass through untouched', cross === 'PASSED_THROUGH');

  // 6. Non-GET must never be handled.
  const post = await request('https://raw.test/anything', { method: 'POST' });
  check('POST requests pass through', post === 'PASSED_THROUGH');

  // 7. A partial (206) video response must not poison the cache.
  const media = await sandbox.caches.open('raw-v1-media');
  const before = media.store.size;
  sandbox.fetch = async (req) => new FakeResponse('partial', { status: 206 });
  await request('https://raw.test/promo/assets/campaign-giveaway.mp4');
  await new Promise((r) => setTimeout(r, 10));
  check('206 partial responses are not cached', media.store.size === before,
    `media entries: ${media.store.size}`);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) process.exit(1);
};

run().catch((e) => { console.error('harness error:', e); process.exit(1); });
