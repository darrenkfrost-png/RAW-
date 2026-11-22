# DEFROST.WORLD integration — RAW Official

Everything DEFROST needs to host this site, in one file. Keep it current: if a
page, a route or a button changes, change it here in the same commit.

---

## 1. The app

| | |
|---|---|
| **App name** | RAW Official |
| **Owner / creator** | Darren Frost |
| **One line** | A performance and recovery brand: 47 products, 116 of its own films with searchable transcripts, and build-your-own supplement protocols. |
| **Own website** | https://rawofficial.co |
| **This app is hosted at** | https://skyblue-reindeer-199095.hostingersite.com |
| **Brand accent colour** | `#ff1d48` |

⚠️ **The app and the shop are two different sites.** `rawofficial.co` is a live
WordPress/WooCommerce store taking real orders and is **not** this repository.
This app is an overlay that showcases the brand and hands every purchase to that
store. Nothing here may replace it or take a payment.

---

## 2. Build

| | |
|---|---|
| **Build command** | `npm run build` |
| **Output folder** | `dist/` |
| **Environment needed** | **None.** The build succeeds with nothing set. |
| **Routing on our own domain** | **Path** routing (BrowserRouter) — `/shop`, `/watch/yt-…` |
| **Routing inside DEFROST** | **Hash** routing (HashRouter) — `#/shop` |

`npm run build` also bundles a small Express server to `server-dist/server.cjs`.
**DEFROST does not need it** — it only serves `dist/` and sets the two
`.htaccess` rules on our own host. Serve `dist/` as static files.

⚠️ **The router is chosen once, at module level**, in `src/components/AppProviders.tsx`,
by `insideDefrost()` in `src/lib/defrost.ts`. Inside DEFROST the site is static
files in a sandboxed frame with no server to answer a deep link, so a
path-routed address would 404 on the host; hash addresses resolve from
`index.html`. On our own domain the address bar is unchanged.

`insideDefrost()` reads two signals: `window.__defrostWebsite` being a non-empty
string (the documented one), **or** being framed at a `/sites/<slug>/` path. The
second exists because the first is injected by the host — if it ever arrived
after our scripts ran, the router would already have been chosen, and choosing
wrong there breaks every link on the site.

---

## 3. Pages

Thirty addresses, plus two families of generated pages. All are in
`public/sitemap.xml` (and the 116 film pages in `public/sitemap-videos.xml`).

| Path | Name |
|---|---|
| `/` | Home |
| `/shop` | Shop — the full catalogue |
| `/nutrients` | Nutrients |
| `/recovery` | Recovery |
| `/combat` | Combat |
| `/gallery` | Visual gallery |
| `/compare` | Compare products |
| `/product/:id` | Product detail (47 products) |
| `/watch` | The Vault — 116 films, searchable by what was said |
| `/watch/:id` | A single film (116 pages) |
| `/films` | Films |
| `/showcase` | Showcase |
| `/academy` | Academy |
| `/knowledge-core` | Knowledge base |
| `/protocol-builder` | Build your own stack |
| `/protocol-stacks` | Ready-made stacks |
| `/protocol-stacks/:id` | A single stack |
| `/performance-system` | Performance system |
| `/our-story` | Our story |
| `/manifesto` | Manifesto |
| `/raw-cares` | RAW Cares |
| `/stay-safe` | Stay Safe campaign |
| `/analytics` | Site analytics |
| `/account` | Account |
| `/logistics` | Delivery |
| `/contact` | Contact |
| `/checkout` | Checkout (payments are off — see §6) |
| `/terms-of-use` | Terms of use |
| `/privacy-policy` | Privacy policy |
| `/target/:type` | Audience pages (athletes, fighters, everyday, recovery) |
| `/category/:slug` | Category view of the shop |
| anything else | Page not found |

**Every destination is in one file: `src/data/navigation.ts`** (`PRIMARY`,
`DIRECTORY`, `REAL_PATHS`). If DEFROST wants a menu of this site, read that.

### Readable by the voice and the Oracle
- One `<main id="main-content">` per page; the top bar, footer and status bar
  sit outside it.
- One `<h1>` per page, then `h2`/`h3`. Checked on all 78 routes by
  `npm run structure` — 0 issues.
- Navigation is real `<a href>` links with plain-English text (Shop, Films, The
  Vault, Protocols, Academy, Knowledge, Performance, Our Story). Checked by
  `npm run linkcheck` — 196 internal links, 0 dead.
- Every page has its own `<title>` and share preview (`src/hooks/usePageMeta.ts`).
- Images carry alt text, icon-only buttons carry `aria-label`. `npm run axeall`
  is clean on 78 routes at 375px and 1440px, WCAG 2.1 AA.
- No text is cut off at any width (`npm run cutoff` — 0), and reduced motion is
  respected.

---

## 4. AI routes

**There are none, and that is deliberate.** This site has no AI features. The
advisor, the voice hub and the diagnostics panel were removed earlier, with
their providers, and nothing calls a model.

The only server routes that exist at all are:

| Method | Path | What it does |
|---|---|---|
| `GET` | `/api/health` | Returns `{status, timestamp, version, platform}`. Used by the deploy checks. |
| `POST` | `/api/debug-crash` | Deliberately throws, to prove the error handler works. Not reachable from the interface. |

Neither is needed inside DEFROST, and neither is called by the built site.
**There is no prompt file to mirror.** If an AI feature is ever added here, it
must be a task-based route under `/api/ai/`, with the prompts in one server
file, and this section must be filled in before it ships.

---

## 5. Server-only features

Almost nothing here needs a server — the site is static by design.

| Feature | What it does | Inside DEFROST |
|---|---|---|
| **Basket** | Holds products for an order placed at the real store. | Works, but kept **for this visit only** — the frame's storage is a temporary stand-in. The drawer says so in a line of its own. |
| **My stack** | A personal shortlist of products. | Same: works, kept for this visit only, and says so. |
| **Contact form** | Builds a `mailto:` link and opens the visitor's own mail app. | Works — no server involved. |
| **Offline / PWA** | A service worker caches the shell. | **Does not run** (service workers are disabled in an opaque origin). Registration is wrapped in try/catch so it fails silently; the PWA console page reports it honestly. |
| **Transcripts** | 116 films' transcripts and the spoken-word search index. | Works — static JSON under `/transcripts/`, fetched with root-relative paths that DEFROST rewrites. |

**There is no sign-in anywhere in this app** — no Firebase Auth, no Google
sign-in, no accounts. `/account` is a local page, not a login. Nothing breaks
in the frame for want of a session.

---

## 6. Payment and checkout

⚠️ **This app never takes a payment, on any host.** Its own `/checkout` has
payments switched off and says so, and the production gate fails the build if an
offer is ever published while they are off.

Every purchase goes to **https://rawofficial.co**. Six controls open it: the
top bar's **Buy** button, the basket drawer, the stack drawer, the command
palette, the `/checkout` page and the Everything directory.

**All six obey the `window.__defrostWebsite` rule, because the rule is on the
setter, not on the buttons.** `setIsShopIframeOpen(true)` in
`src/context/UIContext.tsx` checks `insideDefrost()` first:

- **Inside DEFROST** → opens `window.__defrostWebsite` (or `https://rawofficial.co`
  if that is empty) in a **new tab**. The in-app panel never opens, because it
  is a frame, and a frame inside DEFROST's sandboxed frame would be refused by
  the store's own headers anyway.
- **On our own domain** → the store panel opens exactly as it always has.

Putting the rule at each of the six controls would have been six chances to
forget it. One setter cannot drift.

---

## 7. Logo and icon

| File | Size |
|---|---|
| `/brand/logo.png` | 813 × 348, transparent |
| `/brand/icon.png` | 512 × 512 |
| `/brand/app-icon.svg` | square mark, vector |
| `/brand/share-card.jpg` | social share image |

Accent colour: **`#ff1d48`**.

---

## 8. What DEFROST must NOT do with this app

1. **Do not take a payment, and do not put a checkout in front of this site.**
   Orders belong to `rawofficial.co`. See §6.
2. **Do not treat this repository as rawofficial.co.** That is a separate live
   WordPress store with real customers and real orders. Nothing here deploys to
   it, and nothing here may replace it.
3. **Do not present the basket or the stack as saved.** Inside the frame they
   last one visit. Both already say so; please do not remove those lines.
4. **Do not announce offline support inside DEFROST.** The service worker does
   not run there.
5. **Do not run this app's `server-dist/server.cjs`.** Serve `dist/` as static
   files. The server exists only for our own host.
6. **Do not rewrite or strip the `#` from in-frame addresses.** Hash routing is
   what makes deep links work without a server.

---

## 9. How to check this is still true

Run against a built copy, or against the live URL:

```
npm run build
npm run verify -- <url>      # 14 production checks; 2 of them need the real host
npm run linkcheck -- <url>   # every link resolves
npm run structure -- <url>   # one h1, headings in order
npm run axeall -- <url>      # WCAG 2.1 AA at 375px and 1440px
npm run keycheck -- <url>    # every focus stop is visible
npm run trapcheck -- <url>   # open panels keep the keyboard
npm run cutoff -- <url>      # no text cut off
npm run watchcheck -- <url>  # all 116 film pages
npm test                     # the reader's paywall rules
```

Every one of these plants a fault first and must catch it, so a clean result
means the check ran — not that it was asleep.
