import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (e) => {
  fetch('/api/debug-crash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'window.error', message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, error: e.error?.stack })
  }).catch(() => {});
});
window.addEventListener('unhandledrejection', (e) => {
  fetch('/api/debug-crash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'unhandledrejection', reason: e.reason?.stack || e.reason?.message || e.reason })
  }).catch(() => {});
});

/**
 * ⚠️ A DEPLOY RENAMES EVERY CHUNK. Anyone with the previous build still open
 * asks for a file that no longer exists the moment they navigate. Before this
 * guard, that arrived as a crash card — "Failed to fetch dynamically imported
 * module" — on a site that had just deployed successfully. Seen live on
 * 2026-09-04 within minutes of a push.
 *
 * Vite reports the failure as a `vite:preloadError` event. One reload fetches the new
 * index.html and its new chunk names, and the visitor never sees a thing.
 *
 * THE BUDGET IS TIME-BASED, DELIBERATELY. A flag cleared on `load` would re-arm
 * on the reloaded page and loop forever against a genuinely broken deploy. A
 * 30-second window allows exactly one healing reload per incident, and every
 * future deploy gets its own — while a chunk that is truly gone surfaces as an
 * error after a single attempt instead of a reload storm.
 */
window.addEventListener('vite:preloadError', (event) => {
  const KEY = 'raw_chunk_reload_at';
  let last = 0;
  try { last = Number(sessionStorage.getItem(KEY) || 0); } catch { /* private mode */ }
  if (Date.now() - last < 30_000) return; // already tried: let the error show
  try { sessionStorage.setItem(KEY, String(Date.now())); } catch { /* ignore */ }
  event.preventDefault();
  window.location.reload();
});

/**
 * ⚠️ THE SERVICE WORKER IS REGISTERED IN PRODUCTION ONLY.
 *
 * In dev it would sit between Vite and the browser and serve yesterday's
 * modules over hot reload — hours lost to "my change isn't showing".
 *
 * It is also registered AFTER load, so it never competes with the first paint
 * for bandwidth, and every failure is swallowed: a site must not break because
 * an optional offline layer would not install.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // A new build is waiting: take over on the next navigation rather than
      // swapping the page out from under someone mid-read.
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        if (!next) return;
        next.addEventListener('statechange', () => {
          if (next.state === 'installed' && navigator.serviceWorker.controller) {
            next.postMessage('SKIP_WAITING');
          }
        });
      });
    }).catch(() => { /* offline support is a bonus, never a requirement */ });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
