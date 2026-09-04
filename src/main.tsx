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
