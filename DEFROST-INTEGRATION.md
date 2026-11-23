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
npm run knowledge:selftest   # the knowledge pack's own checks can still fail
npm test                     # the reader's paywall rules
```

Every one of these plants a fault first and must catch it, so a clean result
means the check ran — not that it was asleep.

---

## 10. DEFROST knowledge pack

So the Oracle can answer questions about RAW in RAW's own words — not just from
page titles — every build writes the whole of this site's public content into one
plain-text file.

| | |
|---|---|
| **The file DEFROST reads** | `/defrost/knowledge.json` (served from `dist/defrost/knowledge.json`) |
| **Parts** | None. One file, 265KB — well under the 5MB limit, so `"parts"` is not used. |
| **Consent flag** | `consent.defrostKnowledge` in `content/social-accounts.json` |
| **Documents today** | 193 — 47 products, 116 films, 18 pages, 5 policies, 3 about, 3 articles, 1 contact |
| **Words** | ~25,600 of the site's own text |

### Consent

⚠️ **Nothing is published unless the owner says so.** `content/social-accounts.json`
holds the only switch:

```json
"consent": { "defrostFeed": false, "defrostKnowledge": true }
```

`defrostKnowledge` is **on**. Set it to `false`, push, and the next build writes
the same file with an empty `documents` list and `defrostKnowledge: false` — so
DEFROST takes nothing, and a missing file is never mistaken for a broken build.
No script may set it to `true`; only Darren edits that line.

`defrostFeed` is **on** — Darren switched it on on 23 November 2026. ⚠️ **But the
feed itself is not built yet**, and the flag does not pretend otherwise: it is
permission, not a feature. The daily social-content brief has never been run in
this app, so there is no `public/defrost/feed.json` for DEFROST to read. The
consent now stands ready for the day it is built; until then DEFROST will find
nothing to show, which is the honest outcome rather than a fake one.

What already exists, and does not depend on that brief: the 116 films are inside
the site itself at `/watch`, pulled from YouTube by `scripts/build-archive.mjs`,
and every one of them is in the knowledge pack above.

### What is included

Every page a visitor can see without signing in: home, the shop and its three
category pages, the four audience pages, the gallery, compare, films, The Vault,
showcase, the Academy, the knowledge base, the protocol builder and stacks, the
performance system, our story, the manifesto, RAW Cares, Stay Safe, analytics,
delivery, checkout, contact, terms and the privacy policy — plus all 47 products
(price, category, availability, what it does, key benefits, who it is for,
suggested use, quality notes, pairings and the responsible-use notice) and a
short entry for each of the 116 films (title, the platform's own caption, series,
duration, published date and watch link).

### What is never included

- Anything behind a login, a paywall or a members area. **There is none here** —
  this site has no sign-in at all.
- Any customer's or visitor's personal data. There is no customer data in this
  repository to leak: orders live at `rawofficial.co`, which is a different site.
- Drafts, admin pages, private notes, secrets, keys, tokens or analytics IDs.
- Film transcripts. They are **not duplicated** into the pack — each film entry
  carries `transcriptUrl` pointing at `/transcripts/<id>.json`, where the real
  words already are. 60 of the 116 films have one; the other 56 are `null`,
  because no caption track was ever published for them.
- Tracking parameters. Any `?...` tail is stripped from every address in the text.
- **`/account`.** It is a signed-out placeholder that renders a dummy address,
  `GUEST@RAWOFFICIAL.CO`. The page is untouched and still public; it simply
  carries nothing worth answering from, and publishing that address would have
  the Oracle hand strangers an inbox nobody reads. The pack's own personal-data
  check is what found it.

### How it is built

Two steps, because the pack needs the site's real rendered words and the build
host has no browser:

| Command | What it does | When |
|---|---|---|
| `npm run knowledge:extract` | Loads the built pages in a browser and reads each `<main>`'s real text into `content/pages.generated.json` (committed, generated — do not hand-edit). Decoration the markup already marks `aria-hidden` and the breadcrumb are left out; repeated ticker lines are said once. | By hand, after page prose changes |
| `npm run knowledge` | Plain Node. Combines that file with `src/data/products.ts`, `src/data/videoArchive.ts` and the platforms' captions into `public/defrost/knowledge.json`, then checks its own output. | **Automatically, inside `npm run build`** |

Nothing in the pack is written by hand. The one composed sentence is `summary`,
and it is built from the site's own counts and its own home-page heading.

### The checks that run before every push

`npm run knowledge` refuses to write the file, and **fails the build**, on any of:

1. invalid JSON, or a shape that is not `version: 1`
2. an id with characters outside letters, digits, `-` and `_`, or an id used twice
3. an empty document, or one over 20,000 characters
4. a `pagePath` that is not a page this build produces (checked against
   `public/sitemap.xml`, `REAL_PATHS`, the product ids and the film ids)
5. an HTML tag or script in any text
6. an email address or telephone number that is not already shown on the public
   contact page
7. anything that looks like a secret (`token=`, `secret=`, `api_key=`, `key=`,
   `Bearer …`, `AIza…`, `sk-…`, `EAAG…`), or a pack over 5MB

⚠️ **And those checks are themselves tested.** `npm run knowledge:selftest` plants
one fault of every shape above and requires all nine to fire. A check that has
never failed is a check nobody has proven.
