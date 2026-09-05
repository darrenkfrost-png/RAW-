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

const urls = ["/", ...routes.map((r) => `/${r}`), ...ids.map((id) => `/product/${id}`), ...profiles.map((p) => `/target/${p}`)];
const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)]
  .map((u) => `  <url>\n    <loc>${ORIGIN}${u}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n")}
</urlset>
`;

await fs.writeFile(path.join(ROOT, "public", "sitemap.xml"), xml, "utf8");
console.log(`sitemap.xml: ${new Set(urls).size} URLs (${routes.length} pages + ${ids.length} products + ${profiles.length} profiles)`);
