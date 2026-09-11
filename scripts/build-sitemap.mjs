/**
 * Generates public/sitemap.xml from the routes the app actually serves.
 *
 * ⚠️ IT READS THE ROUTER, IT DOES NOT KEEP ITS OWN LIST. A hand-maintained
 * sitemap drifts the moment a route is added or removed, and a sitemap that
 * advertises a dead URL is worse than none — so the static routes come from
 * src/App.tsx and the product URLs from the product data. Re-run after adding
 * a page:  node scripts/build-sitemap.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";


// The customerTypes object ends at the first line that is just "};".
function eolSafeEnd(text) {
  const m = text.match(/\r?\n\};/);
  return m ? m[0] : "\n};";
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://www.rawprotection.com";

const app = await fs.readFile(path.join(ROOT, "src", "App.tsx"), "utf8");
const routes = [...app.matchAll(/<Route path="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((r) => !r.includes(":") && r !== "*");

const products = await fs.readFile(path.join(ROOT, "src", "data", "products.ts"), "utf8");
// The data is JSON-shaped, so the key is quoted: "id": 1
const ids = [...new Set([...products.matchAll(/"id":\s*(\d+)/g)].map((m) => m[1]))];

// The audience profiles hang off a parameterised route (/target/:type), so the
// <Route> scan above cannot see them and they were missing from the sitemap
// entirely. Their keys in CustomerType.tsx are the source of truth, the same
// way product ids are read from the catalogue.
const ct = await fs.readFile(path.join(ROOT, "src", "pages", "CustomerType.tsx"), "utf8");
const block = ct.slice(ct.indexOf("const customerTypes = {"));
const profiles = [...block.slice(0, block.indexOf(eolSafeEnd(block))).matchAll(/^  ([a-z]+): \{/gm)].map((m) => m[1]);

/**
 * ⚠️ THE INDEX ROUTE IS path="", SO `/${r}` PRODUCED "/" A SECOND TIME AND,
 * where a route already began with a slash, "//" — which the live sitemap was
 * publishing as https://www.rawprotection.com//. A search engine treats that
 * as a separate URL from the home page, so the site was advertising a
 * duplicate of its own front door. Normalise every path to exactly one leading
 * slash, drop any trailing slash except on the root, then dedupe.
 */
const normalise = (u) => {
  const clean = ("/" + String(u).replace(/^\/+/, "")).replace(/\/+$/, "");
  return clean === "" ? "/" : clean;
};
const urls = [...new Set(
  ["/", ...routes, ...ids.map((id) => `/product/${id}`), ...profiles.map((p) => `/target/${p}`)].map(normalise),
)];
const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>\n    <loc>${ORIGIN}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n")}
</urlset>
`;

await fs.writeFile(path.join(ROOT, "public", "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml: ${urls.length} URLs (${routes.length} pages + ${ids.length} products + ${profiles.length} profiles)`);
