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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
