/**
 * RAW Official — service worker.
 *
 * ⚠️ THE ONE RULE THAT MATTERS HERE: NETWORK-FIRST FOR HTML, CACHE-FIRST ONLY
 * FOR HASHED ASSETS.
 *
 * The classic way to destroy a site with a service worker is cache-first for
 * everything. The visitor then gets yesterday's index.html, which asks for
 * yesterday's /assets/index-ABC123.js — a file the new deploy has deleted — and
 * the app boots to a white screen that no amount of refreshing fixes, because
 * the refresh is served from the same poisoned cache. Every deploy after that
 * makes it worse.
 *
 * So:
 *  · HTML and anything navigational: NETWORK FIRST. The cache is a fallback for
 *    genuine offline, never the primary source. A deploy is therefore visible
 *    on the next load, exactly as it would be without a service worker.
 *  · /assets/* : cache-first is safe ONLY because Vite fingerprints those
 *    filenames — index-ABC123.js is immutable, so a cached copy can never be
 *    stale. A new build produces new names and misses the cache naturally.
 *  · Everything else (images, video, fonts): stale-while-revalidate, so the
 *    site is fast but self-healing.
 *
 * VERSION must be bumped on every meaningful change to this file; the old cache
 * is deleted on activate.
 */

const VERSION = 'raw-v2';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const MEDIA = `${VERSION}-media`;

/** Only the entry document is pre-cached — enough to boot offline, nothing more. */
const PRECACHE = ['/', '/brand/raw-logo-red.png', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      // A single failed precache entry must not abort the whole install, so each
      // is added independently and failures are ignored.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

/** A page telling us it has a newer build: drop everything and step aside. */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never touch another origin: YouTube, the video host and the font CDN must
  // reach the network on their own terms, with their own caching.
  if (url.origin !== self.location.origin) return;

  // The API is never cached. A stale answer from an AI endpoint or a health
  // check is worse than no answer.
  if (url.pathname.startsWith('/api/')) return;

  // ── HTML / navigation: network first, cache only as an offline fallback ──
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // ⚠️ ONLY A GOOD RESPONSE MAY BECOME THE SHELL.
          // This used to cache whatever came back. On the live site, before the
          // .htaccess rewrite existed, every page except '/' returned the host's
          // own 404 — so this line saved that 404 page AS the offline app. Any
          // visitor who then lost signal was served "This Page Does Not Exist"
          // by their own browser, from a cache no refresh could clear.
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put('/', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('/').then((hit) => hit || Response.error())),
    );
    return;
  }

  // ── Fingerprinted build output: cache-first is safe, the name is immutable ──
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSETS).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          }),
      ),
    );
    return;
  }

  // ── Everything else: serve fast, refresh in the background ──
  event.respondWith(
    caches.match(req).then((hit) => {
      const live = fetch(req)
        .then((res) => {
          // Videos arrive as 206 Partial Content, which cannot be cached; and a
          // failed response must never replace a good cached one.
          if (res.ok && res.status === 200) {
            const copy = res.clone();
            caches.open(MEDIA).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || live;
    }),
  );
});
